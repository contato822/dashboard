// api/dados.js — Vercel Serverless Function
// Recebe POST da extensão e serve GET para o dashboard
// Usa Vercel KV (key-value store) para persistência gratuita

export default async function handler(req, res) {
  // CORS — permite extensão Chrome e qualquer origem
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { kv } = await import('@vercel/kv');

  // ── POST: extensão envia dados coletados ──────────────
  if (req.method === 'POST') {
    try {
      const novaColeta = req.body;
      novaColeta.recebidoEm = new Date().toISOString();
      novaColeta.id = Date.now();

      // Busca histórico atual
      let historico = (await kv.get('coletas')) || [];

      // Adiciona no início e limita a 200 coletas
      historico.unshift(novaColeta);
      if (historico.length > 200) historico = historico.slice(0, 200);

      await kv.set('coletas', historico);
      await kv.set('ultimaAtualizacao', new Date().toISOString());

      return res.status(200).json({ ok: true, total: historico.length });
    } catch (e) {
      return res.status(500).json({ ok: false, erro: e.message });
    }
  }

  // ── GET: dashboard busca dados ────────────────────────
  if (req.method === 'GET') {
    try {
      const coletas = (await kv.get('coletas')) || [];
      const ultimaAtualizacao = await kv.get('ultimaAtualizacao');
      return res.status(200).json({ coletas, ultimaAtualizacao });
    } catch (e) {
      return res.status(500).json({ ok: false, erro: e.message });
    }
  }

  return res.status(405).json({ erro: 'Método não permitido' });
}
