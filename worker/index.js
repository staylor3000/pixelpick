const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function todayKey() {
  return `leaderboard:${new Date().toISOString().slice(0, 10)}`;
}

function sanitiseName(raw) {
  return (raw || 'AAA')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 3)
    .padEnd(3, 'A');
}

async function getScores(env) {
  const raw = await env.SCORES.get(todayKey());
  return raw ? JSON.parse(raw) : [];
}

async function putScores(env, scores) {
  await env.SCORES.put(todayKey(), JSON.stringify(scores), {
    expirationTtl: 60 * 60 * 24 * 8 // keep 8 days, auto-expire
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    // GET /api/scores — return today's top 20
    if (request.method === 'GET' && url.pathname === '/api/scores') {
      const scores = await getScores(env);
      return new Response(JSON.stringify(scores), {
        headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }

    // POST /api/scores — submit a new score
    if (request.method === 'POST' && url.pathname === '/api/scores') {
      let body;
      try { body = await request.json(); }
      catch { return new Response('Bad request', { status: 400, headers: CORS }); }

      const entry = {
        name:   sanitiseName(body.name),
        score:  Math.round(Number(body.score) || 0),
        rounds: Math.round(Number(body.rounds) || 0),
        combo:  String(body.combo || '').slice(0, 40),
        tone:   String(body.tone || '').slice(0, 20),
        ts:     Date.now(),
      };

      // Basic validation
      if (entry.score < 0 || entry.score > 99999) {
        return new Response('Invalid score', { status: 422, headers: CORS });
      }

      const scores = await getScores(env);
      scores.push(entry);
      scores.sort((a, b) => b.score - a.score);
      const top20 = scores.slice(0, 20);
      await putScores(env, top20);

      // Return rank (1-indexed)
      const rank = top20.findIndex(s => s.ts === entry.ts) + 1;
      return new Response(JSON.stringify({ rank, total: top20.length, scores: top20 }), {
        headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not found', { status: 404, headers: CORS });
  }
};
