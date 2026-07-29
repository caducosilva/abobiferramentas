const { resolveMeta } = require('./_lib/extract');
const { getBaseUrl } = require('./_lib/base-url');

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

    let result;
    try {
      result = await resolveMeta(url);
    } catch (primaryErr) {
      result = await tryYtdlpFallback(url, getBaseUrl(req));
      if (!result) throw primaryErr;
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(200).json({ ok: false, error: String(err.message || err) });
  }
};

async function tryYtdlpFallback(url, baseUrl) {
  try {
    const r = await fetch(`${baseUrl}/api/ytdlp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await r.json();
    return data.ok ? data : null;
  } catch (err) {
    return null;
  }
}
