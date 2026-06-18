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
    const ordersRes = await fetch(
      `https://${shop}/admin/api/2024-01/orders.json?status=any&created_at_min=${since.toISOString()}&limit=250&fields=id,created_at,total_price,financial_status,line_items`,
      { headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' } }
    )

    if (!ordersRes.ok) throw new Error(`Shopify API error: ${ordersRes.status}`)
    const { orders } = await ordersRes.json()

    const byDay = {}
    let totalRevenue = 0
    let totalOrders = 0
    const productSales = {}

    orders.forEach(order => {
      if (order.financial_status === 'refunded') return
      const day = order.created_at.split('T')[0]
      const price = parseFloat(order.total_price)

      if (!byDay[day]) byDay[day] = { revenue: 0, orders: 0 }
      byDay[day].revenue += price
      byDay[day].orders += 1
      totalRevenue += price
      totalOrders += 1

      order.line_items?.forEach(item => {
        const name = item.title || 'Nepoznat'
        if (!productSales[name]) productSales[name] = { revenue: 0, orders: 0 }
        productSales[name].revenue += parseFloat(item.price) * item.quantity
        productSales[name].orders += item.quantity
      })
    })

    const sortedDays = Object.keys(byDay).sort()
    const chartData = {
      labels: sortedDays.map(d => {
        const dt = new Date(d)
        return `${dt.getDate()}.${dt.getMonth() + 1}`
      }),
      revenue: sortedDays.map(d => Math.round(byDay[d].revenue)),
      orders: sortedDays.map(d => byDay[d].orders)
    }

    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data, revenue: Math.round(data.revenue) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)

    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

    const prevSince = new Date(since)
    const diff = now - since
    prevSince.setTime(prevSince.getTime() - diff)

    const prevRes = await fetch(
      `https://${shop}/admin/api/2024-01/orders.json?status=any&created_at_min=${prevSince.toISOString()}&created_at_max=${since.toISOString()}&limit=250&fields=id,total_price,financial_status`,
      { headers: { 'X-Shopify-Access-Token': token } }
    )
    const { orders: prevOrders } = await prevRes.json()
    const prevRevenue = prevOrders
      .filter(o => o.financial_status !== 'refunded')
      .reduce((sum, o) => sum + parseFloat(o.total_price), 0)

    const growth = prevRevenue > 0
      ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100)
      : null

    res.status(200).json({
      totalRevenue: Math.round(totalRevenue),
      totalOrders,
      avgOrderValue,
      growth,
      chartData,
      topProducts
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
