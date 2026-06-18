export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { revenue, topProduct, orders, growth } = req.body || {}
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: `Ti si ekspert za Facebook oglasavanje igracaka za decu u Srbiji.
Podaci o prodavnici "Nase Dete": prihod: ${revenue ? revenue.toLocaleString('sr-RS') + ' RSD' : 'nepoznat'}, top proizvod: ${topProduct || 'Vodena podloga 3u1'}, narudzbiine: ${orders || '?'}, rast: ${growth != null ? growth + '%' : '?'}.
Daj 5 konkretnih profesionalnih preporuka za Facebook oglase sa specificnim brojevima.
Vrati SAMO JSON: [{"icon":"target","title":"naslov","priority":"visok","body":"konkretna preporuka"}]
priority: visok|srednji|nizak. icon: tabler naziv bez ti-.` }]
      })
    })
    const data = await response.json()
    const text = data.content?.[0]?.text || '[]'
    const suggestions = JSON.parse(text.replace(/```json|```/g, '').trim())
    res.status(200).json({ suggestions })
  } catch (err) {
    res.status(500).json({ error: err.message, suggestions: [] })
  }
}
