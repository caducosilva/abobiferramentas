const { streamMedia } = require('./_lib/extract');
const { getBaseUrl } = require('./_lib/base-url');

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

    try {
      await streamMedia(url, kind, res);
    } catch (primaryErr) {
      if (res.headersSent) { res.end(); return; }
      const streamed = await tryYtdlpDownloadFallback(url, kind, getBaseUrl(req), res);
      if (!streamed) throw primaryErr;
    }
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ ok: false, error: String(err.message || err) });
    } else {
      res.end();
    }
  }
};

async function tryYtdlpDownloadFallback(url, kind, baseUrl, res) {
  let upstream;
  try {
    upstream = await fetch(`${baseUrl}/api/ytdlp?url=${encodeURIComponent(url)}&kind=${kind}`);
  } catch (err) {
    return false;
  }
  if (!upstream.ok || !upstream.body) return false;

  res.setHeader('Content-Type', upstream.headers.get('content-type') || 'video/mp4');
  const disposition = upstream.headers.get('content-disposition');
  if (disposition) res.setHeader('Content-Disposition', disposition);
  const len = upstream.headers.get('content-length');
  if (len) res.setHeader('Content-Length', len);

  const reader = upstream.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(Buffer.from(value));
  }
  res.end();
  return true;
}
