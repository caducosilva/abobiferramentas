const { resolveMeta } = require('./_lib/extract');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'MÉTODO NÃO PERMITIDO.' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const url = String(body.url || '').trim();
    if (!url) {
      res.status(400).json({ ok: false, error: 'COLE UM LINK VÁLIDO.' });
      return;
    }

    const result = await resolveMeta(url);
    res.status(200).json(result);
  } catch (err) {
    res.status(200).json({ ok: false, error: String(err.message || err) });
  }
};
