"""
Camada de fallback usando yt-dlp (o extrator open source mais mantido que existe,
suporta 1800+ sites). So e chamado quando os extratores leves em JS (mais rapidos)
falham. Nao usa cookies nem login - respeita o mesmo limite de "so conteudo publico"
do resto do site. Quando o proprio yt-dlp precisa de login, retorna erro real.
"""

import json
import re
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs, unquote
import urllib.request

import yt_dlp

COMMON_OPTS = {
    "quiet": True,
    "no_warnings": True,
    "skip_download": True,
    "noplaylist": True,
}


def safe_filename(name):
    name = re.sub(r'[\\/:*?"<>|]', "", name or "abobi-video").strip()
    return (name[:120] or "abobi-video")


def pick_best_format(info, kind):
    fmts = info.get("formats") or []
    if kind == "audio":
        audio_only = [f for f in fmts if f.get("vcodec") == "none" and f.get("acodec") != "none"]
        audio_only.sort(key=lambda f: f.get("abr") or 0, reverse=True)
        if audio_only:
            return audio_only[0]
    else:
        combined = [f for f in fmts if f.get("vcodec") != "none" and f.get("acodec") != "none"]
        combined.sort(key=lambda f: (f.get("height") or 0), reverse=True)
        if combined:
            return combined[0]
        video_only = [f for f in fmts if f.get("vcodec") != "none"]
        video_only.sort(key=lambda f: (f.get("height") or 0), reverse=True)
        if video_only:
            return video_only[0]
    if info.get("url"):
        return {"url": info["url"], "ext": info.get("ext", "mp4")}
    return None


def extract(url, kind):
    with yt_dlp.YoutubeDL(COMMON_OPTS) as ydl:
        info = ydl.extract_info(url, download=False)
    fmt = pick_best_format(info, kind)
    if not fmt or not fmt.get("url"):
        raise RuntimeError("NENHUM FORMATO DE MIDIA DISPONIVEL PARA ESTE LINK (FALLBACK YT-DLP).")
    return info, fmt


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        # Modo resolve: metadados apenas (rapido)
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length) if length else b"{}"
        try:
            body = json.loads(raw or b"{}")
        except Exception:
            body = {}
        url = (body.get("url") or "").strip()
        kind = "audio" if body.get("kind") == "audio" else "video"

        if not url:
            self._send_json(400, {"ok": False, "error": "LINK AUSENTE."})
            return

        try:
            info, fmt = extract(url, kind)
            self._send_json(200, {
                "ok": True,
                "kind": "video",
                "platform": (info.get("extractor_key") or "DESCONHECIDA").upper(),
                "title": info.get("title") or "MIDIA PUBLICA",
                "thumbnail": info.get("thumbnail"),
                "duration": info.get("duration"),
                "qualityLabel": f"{fmt.get('height')}P" if fmt.get("height") else "MELHOR DISPONIVEL",
                "sourceUrl": url,
            })
        except Exception as e:
            self._send_json(200, {"ok": False, "error": self._friendly_error(str(e))})

    def do_GET(self):
        # Modo download: resolve de novo e faz proxy real dos bytes
        qs = parse_qs(urlparse(self.path).query)
        url = unquote((qs.get("url") or [""])[0])
        kind = "audio" if (qs.get("kind") or ["video"])[0] == "audio" else "video"

        if not url:
            self._send_json(400, {"ok": False, "error": "LINK AUSENTE."})
            return

        try:
            info, fmt = extract(url, kind)
        except Exception as e:
            self._send_json(500, {"ok": False, "error": self._friendly_error(str(e))})
            return

        title = safe_filename(info.get("title"))
        ext = fmt.get("ext") or ("m4a" if kind == "audio" else "mp4")
        direct_url = fmt["url"]

        req = urllib.request.Request(direct_url, headers={
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15"
        })

        try:
            upstream = urllib.request.urlopen(req, timeout=45)
        except Exception:
            self._send_json(502, {"ok": False, "error": "O SERVIDOR DE ORIGEM RECUSOU O DOWNLOAD DESTE ARQUIVO."})
            return

        self.send_response(200)
        self.send_header("Content-Type", "audio/mpeg" if kind == "audio" else "video/mp4")
        self.send_header("Content-Disposition", f'attachment; filename="{title}.{ext}"')
        content_length = upstream.headers.get("Content-Length")
        if content_length:
            self.send_header("Content-Length", content_length)
        self.end_headers()

        while True:
            chunk = upstream.read(65536)
            if not chunk:
                break
            try:
                self.wfile.write(chunk)
            except Exception:
                break

    def _friendly_error(self, msg):
        if "logged-in" in msg.lower() or "cookies" in msg.lower() or "login" in msg.lower():
            return "ESTE CONTEUDO EXIGE UMA CONTA LOGADA NO INSTAGRAM/REDE SOCIAL PARA SER ACESSADO (COMUM EM POSTS COM AUDIO LICENCIADO). NAO CONSEGUIMOS BAIXAR SEM LOGIN."
        if "private" in msg.lower():
            return "ESTE PERFIL OU POST E PRIVADO."
        return "NAO FOI POSSIVEL PROCESSAR ESTE LINK (FALLBACK YT-DLP TAMBEM FALHOU)."
