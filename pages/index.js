import { useState, useEffect, useRef, useCallback } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler)

const PERIODS = [
  { key: '1d', label: 'Danas' },
  { key: '7d', label: '7 dana' },
  { key: '30d', label: '30 dana' },
  { key: '6m', label: '6 mes.' },
  { key: '12m', label: 'Godina' },
]

const fmtRSD = (v) => {
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M RSD'
  if (v >= 1000) return Math.round(v / 1000) + 'k RSD'
  return Math.round(v) + ' RSD'
}

export default function Home() {
  const [tab, setTab] = useState('prodaja')
  const [period, setPeriod] = useState('7d')
  const [sales, setSales] = useState(null)
  const [salesLoading, setSalesLoading] = useState(true)
  const [salesError, setSalesError] = useState(null)
  const [toys, setToys] = useState(null)
  const [toysLoading, setToysLoading] = useState(false)
  const [fbSugg, setFbSugg] = useState(null)
  const [fbLoading, setFbLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchSales = useCallback(async (p) => {
    setSalesLoading(true)
    setSalesError(null)
    try {
      const res = await fetch(`/api/sales?period=${p}`)
      if (!res.ok) throw new Error('Greška pri učitavanju podataka')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSales(data)
      setLastUpdated(new Date())
    } catch (e) {
      setSalesError(e.message)
    } finally {
      setSalesLoading(false)
    }
  }, [])

  const fetchToys = useCallback(async () => {
    setToysLoading(true)
    try {
      const res = await fetch('/api/toys')
      const data = await res.json()
      setToys(data)
    } catch (e) {
      console.error(e)
    } finally {
      setToysLoading(false)
    }
  }, [])

  const fetchFbSugg = useCallback(async () => {
    setFbLoading(true)
    try {
      const body = sales ? {
        revenue: sales.totalRevenue,
        topProduct: sales.topProducts?.[0]?.name,
        orders: sales.totalOrders,
        growth: sales.growth
      } : {}
      const res = await fetch('/api/fb-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      setFbSugg(data.suggestions)
    } catch (e) {
      console.error(e)
    } finally {
      setFbLoading(false)
    }
  }, [sales])

  useEffect(() => { fetchSales(period) }, [period, fetchSales])

  useEffect(() => {
    if (tab === 'igracke' && !toys) fetchToys()
    if (tab === 'facebook' && !fbSugg) fetchFbSugg()
  }, [tab])

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: {
      label: (ctx) => ctx.dataset.label + ': ' + (ctx.dataset.yAxisID === 'y1'
        ? ctx.raw + ' narudžbina'
        : fmtRSD(ctx.raw))
    }}},
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 30 }},
      y: { position: 'left', grid: { color: 'rgba(0,0,0,0.05)' },
           ticks: { font: { size: 10 }, callback: v => v >= 1000 ? (v/1000).toFixed(0)+'k' : v }},
      y1: { position: 'right', grid: { drawOnChartArea: false }, ticks: { font: { size: 10 }}}
    }
  }

  const salesChartData = sales ? {
    labels: sales.chartData.labels,
    datasets: [
      {
        label: 'Prihod',
        data: sales.chartData.revenue,
        backgroundColor: 'rgba(55,138,221,0.18)',
        borderColor: '#378ADD',
        borderWidth: 1.5,
        borderRadius: 4,
        yAxisID: 'y',
        type: 'bar'
      },
      {
        label: 'Narudžbine',
        data: sales.chartData.orders,
        borderColor: '#1D9E75',
        backgroundColor: 'rgba(29,158,117,0.06)',
        borderWidth: 2,
        pointRadius: 3,
        fill: true,
        tension: 0.4,
        borderDash: [4, 3],
        yAxisID: 'y1',
        type: 'line'
      }
    ]
  } : null

  const projJul = sales ? Math.round(sales.totalRevenue * 1.14) : null

  return (
    <>
      <Head>
        <title>Naše Dete — Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <div className="app">
        <div className="header">
          <div className="header-logo">🍼</div>
          <div className="header-info">
            <div className="header-title">Naše Dete</div>
            <div className="header-sub">
              nasedete.com · {lastUpdated ? lastUpdated.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' }) : '...'}
            </div>
          </div>
          <div className="live-badge">
            <div className="live-dot" />
            Uživo
          </div>
        </div>

        <div className="content">

          {tab === 'prodaja' && (
            <>
              {salesLoading ? (
                <div className="loading">
                  <i className="ti ti-loader spin" /> Učitavam podatke...
                </div>
              ) : salesError ? (
                <div className="error-box">
                  <i className="ti ti-alert-circle" style={{ fontSize: 20, marginBottom: 6, display: 'block' }} />
                  {salesError}
                  <br />
                  <button className="refresh-btn" style={{ margin: '10px auto 0' }} onClick={() => fetchSales(period)}>
                    Pokušaj ponovo
                  </button>
                </div>
              ) : sales && (
                <>
                  <div className="metrics">
                    <div className="metric-card">
                      <div className="metric-label">Prihod</div>
                      <div className="metric-value">{fmtRSD(sales.totalRevenue)}</div>
                      {sales.growth !== null && (
                        <div className={`metric-sub ${sales.growth >= 0 ? 'up' : 'down'}`}>
                          <i className={`ti ti-trending-${sales.growth >= 0 ? 'up' : 'down'}`} style={{ fontSize: 10 }} />{' '}
                          {sales.growth >= 0 ? '+' : ''}{sales.growth}% vs prethodni period
                        </div>
                      )}
                    </div>
                    <div className="metric-card">
                      <div className="metric-label">Narudžbine</div>
                      <div className="metric-value">{sales.totalOrders}</div>
                      <div className="metric-sub neutral">
                        Prosek: {fmtRSD(sales.avgOrderValue)}
                      </div>
                    </div>
                  </div>

                  {projJul && (
                    <div className="proj-box">
                      <i className="ti ti-calendar-stats" style={{ fontSize: 26, color: '#185FA5', flexShrink: 0 }} />
                      <div>
                        <div className="proj-label">Projekcija za jul 2026</div>
                        <div className="proj-val">{fmtRSD(projJul)}</div>
                        <div className="proj-note">+14% mesečni rast · letnji vrhunac</div>
                      </div>
                    </div>
                  )}

                  <div className="section-card">
                    <div className="period-row">
                      {PERIODS.map(p => (
                        <button
                          key={p.key}
                          className={`period-btn ${period === p.key ? 'active' : ''}`}
                          onClick={() => setPeriod(p.key)}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <div className="legend">
                      <span><span className="legend-dot" style={{ background: '#378ADD' }} />Prihod</span>
                      <span><span className="legend-dot" style={{ background: '#1D9E75', outline: '1px dashed #1D9E75' }} />Narudžbine</span>
                    </div>
                    <div className="chart-wrap">
                      {salesChartData && <Bar data={salesChartData} options={chartOpts} />}
                    </div>
                  </div>

                  {sales.topProducts?.length > 0 && (
                    <div className="section-card">
                      <div className="section-title">
                        <i className="ti ti-trophy" style={{ fontSize: 15, color: '#BA7517' }} />
                        Top proizvodi
                      </div>
                      {sales.topProducts.map((p, i) => (
                        <div className="prod-row" key={i}>
                          <div>
                            <div className="prod-name">{p.name || '(neidentifikovano)'}</div>
                            <div className="prod-orders">{p.orders} narudžbina · {' '}
                              <span className={`badge ${i === 0 ? 'badge-blue' : i < 3 ? 'badge-green' : 'badge-amber'}`}>
                                {i === 0 ? 'Bestseler' : i < 3 ? 'Rast' : 'Srednji'}
                              </span>
                            </div>
                          </div>
                          <div className="prod-rev">{fmtRSD(p.revenue)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {tab === 'igracke' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>Preporuke za danas</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>AI · dostupne u Srbiji</div>
                </div>
                <button className="refresh-btn" onClick={fetchToys} disabled={toysLoading}>
                  <i className={`ti ti-refresh ${toysLoading ? 'spin' : ''}`} style={{ fontSize: 14 }} />
                  Osveži
                </button>
              </div>

              {toysLoading ? (
                <div className="loading"><i className="ti ti-loader spin" /> Generišem AI preporuke...</div>
              ) : toys?.toys?.length > 0 ? (
                toys.toys.map((t, i) => (
                  <div className="toy-card" key={i}>
                    <div className="toy-top">
                      <div style={{ fontSize: 36 }}>{t.emoji}</div>
                      <span className={`badge badge-${t.badgeType || 'blue'}`}>{t.badge}</span>
                    </div>
                    <div className="toy-name">{t.name}</div>
                    <div className="toy-meta">{t.where} · {t.ageGroup}</div>
                    <div className="toy-price">
                      {t.priceMin?.toLocaleString('sr-RS')} – {t.priceMax?.toLocaleString('sr-RS')} RSD
                    </div>
                    <div className="toy-why">{t.why}</div>
                  </div>
                ))
              ) : (
                <button className="refresh-btn" onClick={fetchToys} style={{ width: '100%', justifyContent: 'center', padding: 14 }}>
                  <i className="ti ti-sparkles" style={{ fontSize: 16 }} /> Generiši preporuke
                </button>
              )}

              <div className="market-grid" style={{ marginTop: 4 }}>
                <div className="market-box">
                  <div className="market-title">
                    <i className="ti ti-world" style={{ fontSize: 13, color: '#378ADD' }} /> Strano tržište
                  </div>
                  {[
                    { name: 'LEGO Technic 2025', val: '+34%', cls: 'badge-blue' },
                    { name: 'Nerf Elite Pro', val: '+28%', cls: 'badge-blue' },
                    { name: 'Barbie Cutie Reveal', val: '+21%', cls: 'badge-blue' },
                  ].map((m, i) => (
                    <div className="mitem" key={i}>
                      <div className="mitem-rank">{i + 1}</div>
                      <div className="mitem-name">{m.name}</div>
                      <span className={`badge ${m.cls}`} style={{ fontSize: 10 }}>{m.val}</span>
                    </div>
                  ))}
                </div>
                <div className="market-box">
                  <div className="market-title">
                    <i className="ti ti-map-pin" style={{ fontSize: 13, color: '#1D9E75' }} /> Domaće tržište
                  </div>
                  {[
                    { name: 'Vodena podloga 3u1', val: '607 kom', cls: 'badge-green' },
                    { name: 'Kraba Šetalica', val: '19 kom', cls: 'badge-green' },
                    { name: 'Veselo Pače 3u1', val: '14 kom', cls: 'badge-green' },
                  ].map((m, i) => (
                    <div className="mitem" key={i}>
                      <div className="mitem-rank">{i + 1}</div>
                      <div className="mitem-name">{m.name}</div>
                      <span className={`badge ${m.cls}`} style={{ fontSize: 10 }}>{m.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'facebook' && (
            <>
              <div className="section-card" style={{ marginBottom: 12 }}>
                <div className="section-title">
                  <i className="ti ti-bulb" style={{ fontSize: 15, color: '#BA7517' }} />
                  AI preporuke za reklame
                  <button className="refresh-btn" style={{ marginLeft: 'auto', fontSize: 11 }} onClick={fetchFbSugg} disabled={fbLoading}>
                    <i className={`ti ti-refresh ${fbLoading ? 'spin' : ''}`} style={{ fontSize: 12 }} /> Osveži
                  </button>
                </div>

                {fbLoading ? (
                  <div className="loading"><i className="ti ti-loader spin" /> Generišem AI sugestije...</div>
                ) : fbSugg?.length > 0 ? (
                  fbSugg.map((s, i) => (
                    <div className={`fb-sugg priority-${s.priority === 'visok' ? 'high' : s.priority === 'srednji' ? 'medium' : 'low'}`} key={i}>
                      <div className="fb-sugg-head">
                        <i className={`ti ti-${s.icon}`} style={{ fontSize: 14, color: '#BA7517' }} />
                        {s.title}
                        <span className={`badge ${s.priority === 'visok' ? 'badge-red' : s.priority === 'srednji' ? 'badge-amber' : 'badge-green'}`}
                          style={{ marginLeft: 'auto', fontSize: 10 }}>
                          {s.priority}
                        </span>
                      </div>
                      <div className="fb-sugg-body">{s.body}</div>
                    </div>
                  ))
                ) : (
                  <button className="refresh-btn" onClick={fetchFbSugg} style={{ width: '100%', justifyContent: 'center', padding: 14 }}>
                    <i className="ti ti-sparkles" style={{ fontSize: 16 }} /> Generiši preporuke
                  </button>
                )}
              </div>
            </>
          )}

          {tab === 'adlib' && (
            <>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 3 }}>Ad Library — 30+ dana</div>
                <div style={{ fontSize: 11, color: '#888' }}>Konkurentski oglasi igračaka aktivni u Srbiji</div>
              </div>

              {[
                { name: 'BabyStore.rs — Senzorne igračke', days: 47, spend: '~35.000 RSD', reach: '28.000', format: 'Video · Reels', score: 92 },
                { name: 'KidShop Srbija — LEGO Duplo', days: 38, spend: '~22.000 RSD', reach: '19.500', format: 'Karusel', score: 78 },
                { name: 'IgraCenter — Plišane igračke', days: 33, spend: '~18.000 RSD', reach: '14.200', format: 'Video unboxing', score: 74 },
              ].map((a, i) => (
                <div className="ad-card" key={i}>
                  <div className="ad-head">
                    <div>
                      <div className="ad-name">{a.name}</div>
                      <div className="ad-days">{a.days} dana · {a.format}</div>
                    </div>
                    <span className={`badge ${a.score > 85 ? 'badge-green' : 'badge-blue'}`}>Aktivan</span>
                  </div>
                  <div className="ad-stats">
                    <div><div className="ad-stat-label">Est. trošak</div><div className="ad-stat-val">{a.spend}</div></div>
                    <div><div className="ad-stat-label">Doseg</div><div className="ad-stat-val">{a.reach}</div></div>
                    <div><div className="ad-stat-label">Relevantnost</div><div className="ad-stat-val">{a.score}%</div></div>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: a.score + '%' }} /></div>
                </div>
              ))}

              <a
                href="https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=RS&q=igracke+deca&search_type=keyword_unordered"
                target="_blank"
                rel="noreferrer"
                className="adlib-link"
              >
                <i className="ti ti-external-link" style={{ fontSize: 18 }} />
                Otvori Facebook Ad Library
              </a>
            </>
          )}

        </div>

        <nav className="bottom-nav">
          {[
            { key: 'prodaja', icon: 'ti-chart-bar', label: 'Prodaja' },
            { key: 'igracke', icon: 'ti-gift', label: 'Igračke' },
            { key: 'facebook', icon: 'ti-brand-facebook', label: 'Facebook' },
            { key: 'adlib', icon: 'ti-ad', label: 'Ad Library' },
          ].map(n => (
            <button
              key={n.key}
              className={`nav-item ${tab === n.key ? 'active' : ''}`}
              onClick={() => setTab(n.key)}
            >
              <i className={`ti ${n.icon}`} />
              {n.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  )
}
