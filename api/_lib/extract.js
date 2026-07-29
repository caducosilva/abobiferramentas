/**
 * Extração real de mídia pública para o Baixador de Vídeos.
 * Sempre seleciona a maior qualidade disponível automaticamente (sem escolha do usuário).
 *
 * Limitação conhecida e documentada: o YouTube bloqueia ativamente downloads
 * originados de IPs de datacenter/nuvem (Vercel, AWS, etc). Isso é uma barreira
 * de infraestrutura do lado do YouTube, não um bug deste código — quando ocorre,
 * devolvemos uma mensagem de erro clara em vez de fingir sucesso.
 */

const ytdl = require('@distube/ytdl-core');
const ytpl = require('@distube/ytpl');

function safeFileName(name) {
  return String(name || 'abobi-ferramentas')
    .replace(/[\\/:*?"<>|]/g, '')
    .trim()
    .slice(0, 120) || 'abobi-ferramentas';
}

function extractYouTubeId(url) {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

function isYouTubePlaylist(url) {
  return (url.includes('youtube.com') || url.includes('youtu.be')) && /[?&]list=/.test(url);
}

function detectPlatform(url) {
  const u = url.toLowerCase();
  if (u.includes('music.youtube.com')) return 'YOUTUBE_MUSIC';
  if (isYouTubePlaylist(u)) return 'YOUTUBE_PLAYLIST';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'YOUTUBE';
  if (u.includes('tiktok.com')) return 'TIKTOK';
  if (u.includes('instagram.com')) return 'INSTAGRAM';
  if (u.includes('facebook.com') || u.includes('fb.watch')) return 'FACEBOOK';
  if (u.includes('twitter.com') || u.includes('x.com')) return 'TWITTER';
  return null;
}

function friendlyYtdlError(err) {
  const msg = String(err && err.message || err);
  if (/sign in to confirm|not a bot|403|429/i.test(msg)) {
    return 'O YOUTUBE BLOQUEOU ESTA REQUISIÇÃO POR VIR DE UM SERVIDOR EM NUVEM (ISSO ACONTECE COM QUALQUER SITE HOSPEDADO NA VERCEL/AWS/ETC, NÃO É UM ERRO DESTE SITE). TENTE NOVAMENTE MAIS TARDE OU USE OUTRO LINK.';
  }
  return 'NÃO FOI POSSÍVEL PROCESSAR ESTE VÍDEO DO YOUTUBE AGORA.';
}

async function resolveYouTubeMeta(url, { music = false } = {}) {
  const id = extractYouTubeId(url);
  if (!id) throw new Error('LINK DO YOUTUBE INVÁLIDO.');
  const canonical = `https://www.youtube.com/watch?v=${id}`;

  let info;
  try {
    info = await ytdl.getInfo(canonical);
  } catch (err) {
    throw new Error(friendlyYtdlError(err));
  }

  const videoFormats = ytdl.filterFormats(info.formats, 'videoandaudio')
    .sort((a, b) => (b.height || 0) - (a.height || 0));
  const audioFormats = ytdl.filterFormats(info.formats, 'audioonly')
    .sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));

  return {
    ok: true,
    kind: 'video',
    platform: music ? 'YOUTUBE_MUSIC' : 'YOUTUBE',
    title: info.videoDetails.title,
    thumbnail: (info.videoDetails.thumbnails || []).slice(-1)[0]?.url || null,
    duration: Number(info.videoDetails.lengthSeconds) || null,
    qualityLabel: videoFormats[0]?.qualityLabel || null,
    hasVideo: videoFormats.length > 0,
    hasAudio: audioFormats.length > 0,
    sourceUrl: canonical
  };
}

async function resolveYouTubePlaylist(url) {
  let playlist;
  try {
    playlist = await ytpl(url, { limit: 50 });
  } catch (err) {
    throw new Error('NÃO FOI POSSÍVEL LER ESTA PLAYLIST DO YOUTUBE (PODE SER PRIVADA OU O LINK ESTAR INCORRETO).');
  }

  return {
    ok: true,
    kind: 'playlist',
    platform: 'YOUTUBE',
    title: playlist.title,
    items: playlist.items.map(i => ({
      title: i.title,
      thumbnail: i.bestThumbnail?.url || i.thumbnails?.[0]?.url || null,
      duration: i.duration || null,
      sourceUrl: i.shortUrl || i.url
    }))
  };
}

async function fetchTikwm(url) {
  let data;
  try {
    const r = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
    data = await r.json();
  } catch (err) {
    throw new Error('NÃO FOI POSSÍVEL CONTACTAR O SERVIÇO DE EXTRAÇÃO DO TIKTOK AGORA. TENTE NOVAMENTE.');
  }
  if (!data || data.code !== 0 || !data.data || !(data.data.hdplay || data.data.play)) {
    throw new Error('NÃO FOI POSSÍVEL PROCESSAR ESTE VÍDEO DO TIKTOK AGORA (O SERVIÇO PODE ESTAR LIMITANDO REQUISIÇÕES). TENTE NOVAMENTE EM ALGUNS SEGUNDOS.');
  }
  return data.data;
}

async function resolveTikTok(url) {
  const d = await fetchTikwm(url);
  return {
    ok: true,
    kind: 'video',
    platform: 'TIKTOK',
    title: d.title || 'VÍDEO DO TIKTOK',
    thumbnail: d.cover || d.origin_cover || null,
    duration: d.duration || null,
    qualityLabel: d.hdplay ? 'HD SEM MARCA D\'ÁGUA' : 'SEM MARCA D\'ÁGUA',
    sourceUrl: url,
    directUrl: d.hdplay || d.play
  };
}

const OG_LABELS = { INSTAGRAM: 'INSTAGRAM', FACEBOOK: 'FACEBOOK', TWITTER: 'TWITTER / X' };

async function resolveGenericOG(url, platform) {
  let html;
  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Accept-Language': 'pt-BR,pt;q=0.9'
      }
    });
    html = await r.text();
  } catch (err) {
    throw new Error(`NÃO FOI POSSÍVEL ACESSAR ESTE LINK DO ${OG_LABELS[platform]}.`);
  }

  const videoMatch =
    html.match(/<meta property="og:video:secure_url" content="([^"]+)"/i) ||
    html.match(/<meta property="og:video:url" content="([^"]+)"/i) ||
    html.match(/<meta property="og:video" content="([^"]+)"/i);
  const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i);
  const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);

  if (!videoMatch) {
    throw new Error(
      `NÃO FOI POSSÍVEL EXTRAIR ESTE VÍDEO DO ${OG_LABELS[platform]}. ESTA REDE SOCIAL FREQUENTEMENTE EXIGE LOGIN PARA CARREGAR O VÍDEO, E ESTE SITE NÃO FAZ LOGIN EM NOME DE NINGUÉM. FUNCIONA APENAS COM POSTS PÚBLICOS SIMPLES.`
    );
  }

  return {
    ok: true,
    kind: 'video',
    platform,
    title: titleMatch ? titleMatch[1] : 'VÍDEO PÚBLICO',
    thumbnail: imageMatch ? imageMatch[1] : null,
    duration: null,
    qualityLabel: 'MELHOR QUALIDADE DISPONÍVEL NO POST',
    sourceUrl: url,
    directUrl: videoMatch[1].replace(/&amp;/g, '&')
  };
}

async function resolveMeta(url) {
  const platform = detectPlatform(url);
  if (!platform) {
    throw new Error('LINK NÃO RECONHECIDO. SUPORTAMOS YOUTUBE, YOUTUBE MUSIC, TIKTOK, INSTAGRAM, FACEBOOK E TWITTER/X.');
  }
  switch (platform) {
    case 'YOUTUBE_PLAYLIST': return resolveYouTubePlaylist(url);
    case 'YOUTUBE': return resolveYouTubeMeta(url, { music: false });
    case 'YOUTUBE_MUSIC': return resolveYouTubeMeta(url, { music: true });
    case 'TIKTOK': return resolveTikTok(url);
    case 'INSTAGRAM': return resolveGenericOG(url, 'INSTAGRAM');
    case 'FACEBOOK': return resolveGenericOG(url, 'FACEBOOK');
    case 'TWITTER': return resolveGenericOG(url, 'TWITTER');
    default: throw new Error('PLATAFORMA NÃO SUPORTADA.');
  }
}

/** Resolve e envia os bytes reais da mídia para `res` (streaming), sem dados fake. */
async function streamMedia(url, kind, res) {
  const platform = detectPlatform(url);
  if (!platform) throw new Error('LINK NÃO RECONHECIDO.');

  if (platform === 'YOUTUBE' || platform === 'YOUTUBE_MUSIC') {
    const id = extractYouTubeId(url);
    if (!id) throw new Error('LINK DO YOUTUBE INVÁLIDO.');
    const canonical = `https://www.youtube.com/watch?v=${id}`;
    let info;
    try {
      info = await ytdl.getInfo(canonical);
    } catch (err) {
      throw new Error(friendlyYtdlError(err));
    }
    const fileTitle = safeFileName(info.videoDetails.title);

    if (kind === 'audio') {
      const audioFormats = ytdl.filterFormats(info.formats, 'audioonly')
        .sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));
      const best = audioFormats[0];
      if (!best) throw new Error('NENHUM ÁUDIO DISPONÍVEL PARA ESTE VÍDEO.');

      const ffmpegPath = require('ffmpeg-static');
      const ffmpeg = require('fluent-ffmpeg');
      ffmpeg.setFfmpegPath(ffmpegPath);

      res.setHeader('Content-Disposition', `attachment; filename="${fileTitle}.mp3"`);
      res.setHeader('Content-Type', 'audio/mpeg');

      const source = ytdl.downloadFromInfo(info, { format: best });
      source.on('error', () => {});
      try {
        await new Promise((resolve, reject) => {
          ffmpeg(source)
            .audioBitrate(Math.min(best.audioBitrate || 128, 192))
            .format('mp3')
            .on('error', reject)
            .on('end', resolve)
            .pipe(res, { end: true });
        });
      } catch (err) {
        throw new Error(friendlyYtdlError(err));
      }
      return;
    }

    const videoFormats = ytdl.filterFormats(info.formats, 'videoandaudio')
      .sort((a, b) => (b.height || 0) - (a.height || 0));
    const best = videoFormats[0];
    if (!best) throw new Error('NENHUM FORMATO DE VÍDEO COM ÁUDIO COMBINADO DISPONÍVEL PARA ESTE VÍDEO.');

    res.setHeader('Content-Disposition', `attachment; filename="${fileTitle}.mp4"`);
    res.setHeader('Content-Type', 'video/mp4');
    if (best.contentLength) res.setHeader('Content-Length', best.contentLength);

    try {
      await new Promise((resolve, reject) => {
        const stream = ytdl.downloadFromInfo(info, { format: best });
        stream.on('error', reject);
        stream.pipe(res);
        res.on('finish', resolve);
      });
    } catch (err) {
      throw new Error(friendlyYtdlError(err));
    }
    return;
  }

  // TikTok / Instagram / Facebook / Twitter: resolve a URL direta real e faz proxy dos bytes
  const meta = platform === 'TIKTOK'
    ? await resolveTikTok(url)
    : await resolveGenericOG(url, platform);

  if (!meta.directUrl) throw new Error('NÃO FOI POSSÍVEL OBTER O ARQUIVO DE MÍDIA REAL DESTE LINK.');

  const upstream = await fetch(meta.directUrl);
  if (!upstream.ok || !upstream.body) {
    throw new Error('O SERVIDOR DE ORIGEM RECUSOU O DOWNLOAD DESTE ARQUIVO.');
  }

  const fileTitle = safeFileName(meta.title);
  const ext = kind === 'audio' ? 'mp3' : 'mp4';
  res.setHeader('Content-Disposition', `attachment; filename="${fileTitle}.${ext}"`);
  res.setHeader('Content-Type', kind === 'audio' ? 'audio/mpeg' : 'video/mp4');
  const len = upstream.headers.get('content-length');
  if (len) res.setHeader('Content-Length', len);

  const reader = upstream.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(Buffer.from(value));
  }
  res.end();
}

module.exports = { detectPlatform, resolveMeta, streamMedia, safeFileName };
