export default async function handler(req, res) {
  const today = new Date().toLocaleDateString('sr-RS', { day: 'numeric', month: 'long', year: 'numeric' })
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
        messages: [{ role: 'user', content: `Danas je ${today}. Ti si ekspert za trziste igracaka u Srbiji.
Preporuci tacno 3 igracke za decu popularne u Srbiji, dostupne za kupovinu.
Vrati SAMO JSON: [{"emoji":"🎨","name":"naziv","badge":"Domaci hit","badgeType":"green","priceMin":1500,"priceMax":2500,"where":"gde se nabavlja","why":"zasto je dobra za prodaju max 12 reci","ageGroup":"0-3 god"}]
badgeType: green|blue|amber|red. Cene u RSD.` }]
      })
    })
    const data = await response.json()
    const text = data.content?.[0]?.text || '[]'
    const toys = JSON.parse(text.replace(/```json|```/g, '').trim())
    res.status(200).json({ toys, date: today })
  } catch (err) {
    res.status(500).json({ error: err.message, toys: [] })
  }
}
