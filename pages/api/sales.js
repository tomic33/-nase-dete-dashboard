export default async function handler(req, res) {
  const { period = '7d' } = req.query

  const data = {
    '1d':  { totalRevenue: 2980,   totalOrders: 2,   avgOrderValue: 1490, growth: -85, labels: ['08h','10h','12h','14h','16h','18h','20h'], revenue: [0,1490,0,1490,0,0,0], orders: [0,1,0,1,0,0,0] },
    '7d':  { totalRevenue: 103860, totalOrders: 74,  avgOrderValue: 1403, growth: 12,  labels: ['11.6','12.6','13.6','14.6','15.6','16.6','17.6','18.6'], revenue: [5560,8740,12510,13900,15490,23830,20850,2980], orders: [4,6,9,10,11,17,15,2] },
    '30d': { totalRevenue: 348130, totalOrders: 244, avgOrderValue: 1427, growth: 19,  labels: ['19.5','22.5','25.5','28.5','31.5','3.6','6.6','9.6','12.6','15.6','18.6'], revenue: [28000,21250,10130,2980,2980,9730,16880,2780,8740,15490,2980], orders: [20,15,7,2,2,7,12,2,6,11,2] },
    '6m':  { totalRevenue: 971270, totalOrders: 649, avgOrderValue: 1496, growth: 24,  labels: ['Mar','Apr','Maj','Jun'], revenue: [214350,268380,288760,199780], orders: [128,177,202,142] },
    '12m': { totalRevenue: 971270, totalOrders: 649, avgOrderValue: 1496, growth: null, labels: ['Mar','Apr','Maj','Jun'], revenue: [214350,268380,288760,199780], orders: [128,177,202,142] }
  }

  const d = data[period] || data['7d']

  res.status(200).json({
    totalRevenue: d.totalRevenue,
    totalOrders: d.totalOrders,
    avgOrderValue: d.avgOrderValue,
    growth: d.growth,
    chartData: { labels: d.labels, revenue: d.revenue, orders: d.orders },
    topProducts: [
      { name: 'Edukativna Vodena podloga 3u1', orders: 607, revenue: 863160 },
      { name: 'Edukativna Kraba Šetalica',     orders: 19,  revenue: 42010  },
      { name: 'Veselo Pače 3u1',               orders: 14,  revenue: 26460  },
      { name: 'Zvečka Rotirajuća 3u1',         orders: 10,  revenue: 18700  },
      { name: 'Čarobni Pingvin poklon',        orders: 2,   revenue: 4380   },
    ]
  })
}
