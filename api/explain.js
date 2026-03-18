export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { question, answer, category } = req.body;
  if (!question || !answer) return res.status(400).json({ error: 'Missing fields' });

  const prompt = `Tu es un formateur expert CQP Instructeur Fitness. Réponds en HTML simple uniquement (balises h3, p, ul/li, svg). Pas de markdown, pas de backticks.

Question : "${question}"
Bonne réponse : "${answer}"
Catégorie : ${category}

Génère :
1. Une explication pédagogique approfondie (3-5 phrases)
2. Un schéma SVG simple (viewBox="0 0 300 180", couleurs #2563eb #10b981 #f59e0b, fond #f8fafc, texte lisible)
3. Un point "<p><strong>À retenir pour l'exam :</strong> ...</p>" en fin de réponse`;

  try {
    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await apiRes.json();
    const html = data.content?.[0]?.text || '<p>Erreur de génération.</p>';
    res.status(200).json({ html });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur', detail: e.message });
  }
}
