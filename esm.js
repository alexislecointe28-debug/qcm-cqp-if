/* ══ EN SAVOIR PLUS — Claude API ══ */
let esmCurrentQ = null;

function openESM() {
  const q = session.questions[session.idx];
  if (!q) return;
  esmCurrentQ = q;
  document.getElementById("esm-overlay").classList.add("open");
  document.getElementById("esm-title").textContent = "En savoir plus";
  document.getElementById("esm-body").innerHTML = '<div class="esm-loading"><div class="esm-spinner"></div>Génération en cours…</div>';
  fetchESM(q);
}

function closeESM(e) {
  if (e.target === document.getElementById("esm-overlay")) closeESMBtn();
}
function closeESMBtn() {
  document.getElementById("esm-overlay").classList.remove("open");
}

async function fetchESM(q) {
  const cats = {anat:"Anatomie / Biomécanique",physio:"Physiologie de l'effort",nutri:"Nutrition",regl:"Réglementation / Sécurité"};
  const prompt = `Tu es un formateur expert CQP Instructeur Fitness.
Question : "${q.q}"
Bonne réponse : "${q.opts[q.r]}"
Catégorie : ${cats[q.cat]}

Génère une explication pédagogique approfondie en HTML simple (h3, p, ul/li uniquement, pas de markdown).
Inclus :
1. Explication détaillée du concept (3-5 phrases)
2. Un schéma SVG pédagogique (viewBox="0 0 300 180", couleurs #2563eb #10b981 #f59e0b, fond #f8fafc, texte lisible)
3. Un point "À retenir pour l'exam" en gras

HTML uniquement, pas de backticks, pas de bloc de code.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{role: "user", content: prompt}]
      })
    });
    const data = await res.json();
    const html = data.content && data.content[0] ? data.content[0].text : "Erreur de génération.";
    document.getElementById("esm-body").innerHTML = html;
  } catch(e) {
    document.getElementById("esm-body").innerHTML = "<p>Erreur de connexion.</p>";
  }
}
