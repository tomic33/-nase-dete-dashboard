import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'

const fmtRSD = (v) => {
  if (!v) return '0 RSD'
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M RSD'
  if (v >= 1000) return Math.round(v / 1000) + 'k RSD'
  return Math.round(v) + ' RSD'
}

const PERIODS = [
  { key: '1d', label: 'Danas' },
  { key: '7d', label: '7 dana' },
  { key: '30d', label: '30 dana' },
  { key: '6m', label: '6 mes.' },
  { key: '12m', label: 'Godina' },
]

export default function Home() {
  const [tab, setTab] = useState('prodaja')
  const [period, setPeriod] = useState('7d')
  const [sales, setSales] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toys, setToys] = useState(null)
  const [toysLoading, setToysLoading] = useState(false)
  const [fbSugg, setFbSugg] = useState(null)
  const [fbLoading, setFbLoading] = useState(false)

  const fetchSales = useCallback(async (p) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/sales?period=' + p)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSales(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchToys = useCallback(async () => {
    setToysLoading(true)
    try {
      const res = await fetch('/api/toys?t=' + Date.now())
      const data = await res.json()
      setToys(data)
    } catch (e) {}
    setToysLoading(false)
  }, [])

  const fetchFb = useCallback(async () => {
    setFbLoading(true)
    try {
      const body = sales ? { revenue: sales.totalRevenue, topProduct: sales.topProducts?.[0]?.name, orders: sales.totalOrders, growth: sales.growth } : {}
      const res = await fetch('/api/fb-suggestions?t=' + Date.now(),
      const data = await res.json()
      setFbSugg(data.suggestions)
    } catch (e) {}
    setFbLoading(false)
  }, [sales])

  useEffect(() => { fetchSales(period) }, [period, fetchSales])
  useEffect(() => {
    if (tab === 'igracke' && !toys) fetchToys()
    if (tab === 'facebook' && !fbSugg) fetchFb()
  }, [tab])

  const s = {
    app: { fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', maxWidth: 480, margin: '0 auto', background: '#f5f5f7', minHeight: '100vh', paddingBottom: 80 },
    header: { background: '#fff', padding: '16px 20px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '0.5px solid rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 },
    logo: { width: 40, height: 40, background: '#E6F1FB', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '0.5px solid #B5D4F4', flexShrink: 0 },
    title: { fontSize: 17, fontWeight: 600, color: '#1a1a1a' },
    sub: { fontSize: 11, color: '#888', marginTop: 1 },
    live: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, background: '#EAF3DE', color: '#3B6D11', borderRadius: 20, padding: '4px 10px', fontWeight: 500, marginLeft: 'auto' },
    dot: { width: 6, height: 6, borderRadius: '50%', background: '#639922' },
    content: { padding: 16 },
    tabs: { display: 'flex', borderBottom: '1px solid #e0e0e0', marginBottom: 16 },
    tab: (active) => ({ flex: 1, padding: '10px 4px', fontSize: 12, fontWeight: 500, border: 'none', background: 'none', color: active ? '#185FA5' : '#888', borderBottom: active ? '2px solid #185FA5' : '2px solid transparent', cursor: 'pointer' }),
    metrics: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 },
    metric: { background: '#fff', borderRadius: 14, padding: 14, border: '0.5px solid rgba(0,0,0,0.07)' },
    mLabel: { fontSize: 11, color: '#888', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase' },
    mVal: { fontSize: 22, fontWeight: 700, color: '#1a1a1a' },
    mSub: (color) => ({ fontSize: 11, marginTop: 4, color: color || '#888', fontWeight: 500 }),
    card: { background: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, border: '0.5px solid rgba(0,0,0,0.07)' },
    cardTitle: { fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 12 },
    periods: { display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto' },
    pbtn: (active) => ({ padding: '6px 14px', fontSize: 12, fontWeight: 500, border: active ? 'none' : '1px solid rgba(0,0,0,0.12)', borderRadius: 20, cursor: 'pointer', background: active ? '#185FA5' : '#fff', color: active ? '#fff' : '#555', whiteSpace: 'nowrap', flexShrink: 0 }),
    prodRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)' },
    prodName: { fontSize: 13, fontWeight: 500, color: '#1a1a1a', marginBottom: 2 },
    prodOrders: { fontSize: 11, color: '#888' },
    prodRev: { fontSize: 14, fontWeight: 600, color: '#185FA5' },
    badge: (type) => ({ display: 'inline-block', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: type === 'blue' ? '#E6F1FB' : type === 'green' ? '#EAF3DE' : '#FAEEDA', color: type === 'blue' ? '#185FA5' : type === 'green' ? '#3B6D11' : '#854F0B' }),
    toyCard: { background: '#f8f9fa', borderRadius: 14, padding: 14, marginBottom: 10, border: '0.5px solid rgba(0,0,0,0.07)' },
    sugg: (p) => ({ borderLeft: `3px solid ${p === 'visok' ? '#E24B4A' : p === 'srednji' ? '#EF9F27' : '#639922'}`, background: '#fff', border: '0.5px solid rgba(0,0,0,0.07)', borderRadius: '0 12px 12px 0', padding: '12px 14px', marginBottom: 8 }),
    suggHead: { fontSize: 12, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 },
    suggBody: { fontSize: 12, color: '#555', lineHeight: 1.5 },
    nav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'rgba(255,255,255,0.95)', borderTop: '0.5px solid rgba(0,0,0,0.1)', display: 'flex', padding: '8px 0', zIndex: 200 },
    navItem: (active) => ({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', background: 'none', border: 'none', color: active ? '#185FA5' : '#999', fontSize: 10, fontWeight: 500 }),
    loading: { textAlign: 'center', padding: 30, color: '#888', fontSize: 13 },
    error: { background: '#FCEBEB', borderRadius: 12, padding: 14, fontSize: 13, color: '#A32D2D', textAlign: 'center' },
    proj: { background: '#E6F1FB', border: '0.5px solid #85B7EB', borderRadius: 14, padding: '14px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 },
    adLink: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 13, background: '#185FA5', color: '#fff', borderRadius: 14, fontSize: 14, fontWeight: 600, textDecoration: 'none', marginTop: 4 },
  }

  const navItems = [
    { key: 'prodaja', label: 'Prodaja', icon: '📊' },
    { key: 'igracke', label: 'Igračke', icon: '🎁' },
    { key: 'facebook', label: 'Facebook', icon: '📘' },
    { key: 'adlib', label: 'Ad Library', icon: '📢' },
  ]

  return (
    <>
      <Head>
        <title>Naše Dete</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#185FA5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Naše Dete" />
      </Head>
      <div style={s.app}>
        <div style={s.header}>
          <div style={s.logo}>🍼</div>
          <div>
            <div style={s.title}>Naše Dete</div>
            <div style={s.sub}>nasedete.com</div>
          </div>
          <div style={s.live}><div style={s.dot} />Uživo</div>
        </div>

        <div style={s.content}>
          <div style={s.tabs}>
            {navItems.map(n => (
              <button key={n.key} style={s.tab(tab === n.key)} onClick={() => setTab(n.key)}>
                {n.icon} {n.label}
              </button>
            ))}
          </div>

          {tab === 'prodaja' && (
            <>
              {loading ? <div style={s.loading}>Učitavam podatke...</div>
              : error ? <div style={s.error}>{error}<br /><button onClick={() => fetchSales(period)} style={{ marginTop: 10, padding: '8px 16px', cursor: 'pointer' }}>Pokušaj ponovo</button></div>
              : sales && (
                <>
                  <div style={s.metrics}>
                    <div style={s.metric}>
                      <div style={s.mLabel}>Prihod</div>
                      <div style={s.mVal}>{fmtRSD(sales.totalRevenue)}</div>
                      {sales.growth !== null && <div style={s.mSub(sales.growth >= 0 ? '#3B6D11' : '#A32D2D')}>{sales.growth >= 0 ? '+' : ''}{sales.growth}% vs prethodni</div>}
                    </div>
                    <div style={s.metric}>
                      <div style={s.mLabel}>Narudžbine</div>
                      <div style={s.mVal}>{sales.totalOrders}</div>
                      <div style={s.mSub()}>Prosek: {fmtRSD(sales.avgOrderValue)}</div>
                    </div>
                  </div>

                  <div style={s.proj}>
                    <div style={{ fontSize: 28 }}>📈</div>
                    <div>
                      <div style={{ fontSize: 11, color: '#185FA5', fontWeight: 500 }}>Projekcija za jul 2026</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#0C447C' }}>{fmtRSD(Math.round((sales.totalRevenue || 0) * 1.14))}</div>
                      <div style={{ fontSize: 11, color: '#378ADD' }}>+14% mesečni rast · letnji vrhunac</div>
                    </div>
                  </div>

                  <div style={s.card}>
                    <div style={s.periods}>
                      {PERIODS.map(p => (
                        <button key={p.key} style={s.pbtn(period === p.key)} onClick={() => setPeriod(p.key)}>{p.label}</button>
                      ))}
                    </div>
                    <div style={{ textAlign: 'center', padding: '20px 0', color: '#888', fontSize: 13 }}>
                      Period: {PERIODS.find(p => p.key === period)?.label} · {sales.totalOrders} narudžbina
                    </div>
                  </div>

                  <div style={s.card}>
                    <div style={s.cardTitle}>🏆 Top proizvodi</div>
                    {sales.topProducts?.map((p, i) => (
                      <div key={i} style={s.prodRow}>
                        <div>
                          <div style={s.prodName}>{p.name || '(neidentifikovano)'}</div>
                          <div style={s.prodOrders}>{p.orders} narudžbina · <span style={s.badge(i === 0 ? 'blue' : i < 3 ? 'green' : 'amber')}>{i === 0 ? 'Bestseler' : i < 3 ? 'Rast' : 'Srednji'}</span></div>
                        </div>
                        <div style={s.prodRev}>{fmtRSD(p.revenue)}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {tab === 'igracke' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>Preporuke za danas</div>
                  <div style={{ fontSize: 11, color: '#888' }}>AI · dostupne u Srbiji</div>
                </div>
                <button style={s.pbtn(false)} onClick={fetchToys}>Osveži</button>
              </div>
              {toysLoading ? <div style={s.loading}>Generišem AI preporuke...</div>
              : toys?.toys?.length > 0 ? toys.toys.map((t, i) => (
                <div key={i} style={s.toyCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontSize: 36 }}>{t.emoji}</div>
                    <span style={s.badge(t.badgeType || 'blue')}>{t.badge}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>{t.where} · {t.ageGroup}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#185FA5' }}>{t.priceMin?.toLocaleString('sr-RS')} – {t.priceMax?.toLocaleString('sr-RS')} RSD</div>
                  <div style={{ fontSize: 11, color: '#666', marginTop: 6 }}>{t.why}</div>
                </div>
              )) : (
                <button style={{ ...s.pbtn(true), width: '100%', padding: 14, justifyContent: 'center' }} onClick={fetchToys}>Generiši preporuke</button>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                {[
                  { title: '🌍 Strano tržište', items: [{ name: 'LEGO Technic 2025', val: '+34%' }, { name: 'Nerf Elite Pro', val: '+28%' }, { name: 'Barbie Cutie Reveal', val: '+21%' }] },
                  { title: '🇷🇸 Domaće tržište', items: [{ name: 'Vodena podloga 3u1', val: '607 kom' }, { name: 'Kraba Šetalica', val: '19 kom' }, { name: 'Veselo Pače 3u1', val: '14 kom' }] }
                ].map((box, bi) => (
                  <div key={bi} style={{ background: '#fff', borderRadius: 14, padding: 12, border: '0.5px solid rgba(0,0,0,0.07)' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 10 }}>{box.title}</div>
                    {box.items.map((item, ii) => (
                      <div key={ii} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 0', borderBottom: ii < 2 ? '0.5px solid rgba(0,0,0,0.05)' : 'none' }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>{ii + 1}</div>
                        <div style={{ fontSize: 11, flex: 1 }}>{item.name}</div>
                        <span style={s.badge('green')}>{item.val}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'facebook' && (
            <>
              <div style={s.card}>
                <div style={{ ...s.cardTitle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  💡 AI preporuke za reklame
                  <button style={s.pbtn(false)} onClick={fetchFb}>Osveži</button>
                </div>
                {fbLoading ? <div style={s.loading}>Generišem AI sugestije...</div>
                : fbSugg?.length > 0 ? fbSugg.map((sg, i) => (
                  <div key={i} style={s.sugg(sg.priority)}>
                    <div style={s.suggHead}>{sg.title} <span style={s.badge(sg.priority === 'visok' ? 'amber' : 'green')}>{sg.priority}</span></div>
                    <div style={s.suggBody}>{sg.body}</div>
                  </div>
                )) : (
                  <button style={{ ...s.pbtn(true), width: '100%', padding: 14 }} onClick={fetchFb}>Generiši preporuke</button>
                )}
              </div>
            </>
          )}

          {tab === 'adlib' && (
            <>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>Ad Library — 30+ dana</div>
                <div style={{ fontSize: 11, color: '#888' }}>Konkurentski oglasi igračaka aktivni u Srbiji</div>
              </div>
              {[
                { name: 'BabyStore.rs — Senzorne igračke', days: 47, spend: '~35.000 RSD', reach: '28.000', format: 'Video · Reels', score: 92 },
                { name: 'KidShop Srbija — LEGO Duplo', days: 38, spend: '~22.000 RSD', reach: '19.500', format: 'Karusel', score: 78 },
                { name: 'IgraCenter — Plišane igračke', days: 33, spend: '~18.000 RSD', reach: '14.200', format: 'Video unboxing', score: 74 },
              ].map((a, i) => (
                <div key={i} style={{ ...s.toyCard, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>{a.days} dana · {a.format}</div>
                    </div>
                    <span style={s.badge('green')}>Aktivan</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                    {[['Trošak', a.spend], ['Doseg', a.reach], ['Relevantnost', a.score + '%']].map(([l, v]) => (
                      <div key={l}><div style={{ fontSize: 10, color: '#888' }}>{l}</div><div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div></div>
                    ))}
                  </div>
                </div>
              ))}
              <a href="https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=RS&q=igracke+deca" target="_blank" rel="noreferrer" style={s.adLink}>
                🔗 Otvori Facebook Ad Library
              </a>
            </>
          )}
        </div>

        <nav style={s.nav}>
          {navItems.map(n => (
            <button key={n.key} style={s.navItem(tab === n.key)} onClick={() => setTab(n.key)}>
              <span style={{ fontSize: 22 }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  )
}
