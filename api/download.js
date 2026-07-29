const { streamMedia } = require('./_lib/extract');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'MÉTODO NÃO PERMITIDO.' });
    return;
  }

  try {
    const url = String(req.query.url || '').trim();
    const kind = req.query.kind === 'audio' ? 'audio' : 'video';
    if (!url) {
      res.status(400).json({ ok: false, error: 'LINK AUSENTE.' });
      return;
    }

    await streamMedia(url, kind, res);
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ ok: false, error: String(err.message || err) });
    } else {
      res.end();
    }
  }
};
