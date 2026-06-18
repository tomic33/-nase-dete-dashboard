export default async function handler(req, res) {
  const { period = '7d' } = req.query
  const shop = process.env.SHOPIFY_SHOP_DOMAIN
  const token = process.env.SHOPIFY_ACCESS_TOKEN

  if (!shop || !token) {
    return res.status(500).json({ error: 'Missing Shopify credentials' })
  }

  const now = new Date()
  let since = new Date()
  if (period === '1d') since.setDate(now.getDate() - 1)
  else if (period === '7d') since.setDate(now.getDate() - 7)
  else if (period === '30d') since.setDate(now.getDate() - 30)
  else if (period === '6m') since.setMonth(now.getMonth() - 6)
  else if (period === '12m') since.setFullYear(now.getFullYear() - 1)

  try {
    const query = `{
      orders(first: 250, query: "created_at:>='${since.toISOString()}' AND financial_status:paid") {
        edges {
          node {
            id
            createdAt
            totalPriceSet { shopMoney { amount } }
            lineItems(first: 10) {
              edges {
                node {
                  title
                  quantity
                  originalUnitPriceSet { shopMoney { amount } }
                }
              }
            }
          }
        }
      }
    }`

    const r = await fetch(`https://${shop}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token
      },
      body: JSON.stringify({ query })
    })

    const json = await r.json()
    if (json.errors) throw new Error(json.errors[0].message)

    const orders = json.data.orders.edges.map(e => e.node)
    const byDay = {}
    let totalRevenue = 0
    let totalOrders = 0
    const productSales = {}

    orders.forEach(order => {
      const day = order.createdAt.split('T')[0]
      const price = parseFloat(order.totalPriceSet.shopMoney.amount)
      if (!byDay[day]) byDay[day] = { revenue: 0, orders: 0 }
      byDay[day].revenue += price
      byDay[day].orders += 1
      totalRevenue += price
      totalOrders += 1

      order.lineItems.edges.forEach(({ node: item }) => {
        const name = item.title || 'Nepoznat'
        if (!productSales[name]) productSales[name] = { revenue: 0, orders: 0 }
        productSales[name].revenue += parseFloat(item.originalUnitPriceSet.shopMoney.amount) * item.quantity
        productSales[name].orders += item.quantity
      })
    })

    const sortedDays = Object.keys(byDay).sort()
    const chartData = {
      labels: sortedDays.map(d => { const dt = new Date(d); return `${dt.getDate()}.${dt.getMonth()+1}` }),
      revenue: sortedDays.map(d => Math.round(byDay[d].revenue)),
      orders: sortedDays.map(d => byDay[d].orders)
    }

    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data, revenue: Math.round(data.revenue) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)

    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

    res.status(200).json({
      totalRevenue: Math.round(totalRevenue),
      totalOrders,
      avgOrderValue,
      growth: null,
      chartData,
      topProducts
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
