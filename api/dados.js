const KV_URL   = "https://star-flea-39622.upstash.io";
const KV_TOKEN = "AZrGAAIncDE2YTgzZTAzNjM3NWU0ZWE0YWJkOWMxMDAwYTQzNWIyY3AxMzk2MjI";

async function kvGet(key) {
  try {
    const r = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
    const json = await r.json();
    if (!json.result) return null;
    return JSON.parse(json.result);
  } catch(e) {
    return null;
  }
}

async function kvSet(key, value) {
  await fetch(`${KV_URL}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(JSON.stringify(value))
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const nova = { 
        ...body, 
        recebidoEm: new Date().toISOString(), 
        id: Date.now() 
      };
      
      let historico = await kvGet('coletas');
      if (!Array.isArray(historico)) historico = [];
      
      historico.unshift(nova);
      if (historico.length > 100) historico = historico.slice(0, 100);
      
      await kvSet('coletas', historico);
      await kvSet('ultimaAtualizacao', new Date().toISOString());
      
      return res.status(200).json({ ok: true, total: historico.length });
    } catch (e) {
      return res.status(500).json({ ok: false, erro: e.message, stack: e.stack });
    }
  }

  if (req.method === 'GET') {
    try {
      const coletas = await kvGet('coletas') || [];
      const ultimaAtualizacao = await kvGet('ultimaAtualizacao');
      return res.status(200).json({ coletas, ultimaAtualizacao });
    } catch (e) {
      return res.status(500).json({ ok: false, erro: e.message });
    }
  }

  return res.status(405).json({ erro: 'Método não permitido' });
}
