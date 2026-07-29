/**
 * Página dedicada: Baixar Vídeo do Instagram.
 * Reutiliza os mesmos endpoints reais (/api/resolve, /api/download) já
 * testados no app principal, sem trazer o roteador da SPA inteira.
 */
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const toastContainer = document.getElementById('toast-container');
  let theme = localStorage.getItem('abobi_theme') || 'dark';

  function applyTheme() {
    document.documentElement.className = theme;
    themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'moon' : 'sun');
    lucide.createIcons();
  }
  applyTheme();
  themeToggle.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('abobi_theme', theme);
    applyTheme();
  });

  function showToast(message, title = 'PRONTO!', variant = 'success') {
    const color = variant === 'error' ? 'var(--accent-danger)' : 'var(--accent-green)';
    const icon = variant === 'error' ? 'alert-triangle' : 'check-circle-2';
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderColor = color;
    toast.innerHTML = `
      <i data-lucide="${icon}" style="color: ${color}; width: 24px; height: 24px; flex-shrink: 0;"></i>
      <div>
        <div style="font-weight: 900; color: ${color}; font-size: 0.85rem;">${title}</div>
        <div style="font-size: 0.85rem; color: var(--text-primary); font-weight: 700;">${message}</div>
      </div>
    `;
    toastContainer.appendChild(toast);
    lucide.createIcons();
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }

  const container = document.getElementById('ig-tool-container');
  container.innerHTML = `
    <div class="form-group" style="margin-bottom: 20px;">
      <div style="position: relative;">
        <input type="text" id="ig-url-input" class="form-input case-normal" placeholder="COLE O LINK DO REEL, POST OU IGTV..." style="padding-right: 120px;" />
        <button id="ig-btn-paste" class="btn btn-outline" style="position: absolute; right: 6px; top: 5px; padding: 6px 12px; font-size: 0.75rem;">COLAR LINK</button>
      </div>
    </div>

    <button id="ig-btn-process" class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 0.95rem;">
      <i data-lucide="instagram"></i>
      <span>BUSCAR VÍDEO</span>
    </button>

    <div id="ig-status" style="text-align: center; display: none; margin-top: 20px;">
      <div style="display: inline-block; width: 28px; height: 28px; border: 3px solid var(--border-color); border-top-color: var(--accent-primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 8px;"></div>
      <p style="font-weight: 900; color: var(--accent-primary); font-size: 0.85rem;">BUSCANDO O VÍDEO NO INSTAGRAM...</p>
    </div>

    <div id="ig-error" style="display: none; margin-top: 20px; background: var(--bg-input); border: 1px solid var(--accent-danger); border-radius: var(--radius-md); padding: 16px; color: var(--accent-danger); font-weight: 800; font-size: 0.85rem;"></div>

    <div id="ig-progress" style="display: none; margin-top: 20px; background: var(--bg-input); border: 1px solid var(--accent-primary); border-radius: var(--radius-md); padding: 16px; text-align: center;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-weight: 900; font-size: 0.85rem; color: var(--accent-primary);">BAIXANDO ARQUIVO REAL...</span>
        <span id="ig-progress-pct" class="font-mono" style="font-weight: 900; color: var(--accent-green);">0%</span>
      </div>
      <div style="width: 100%; background: var(--bg-card); height: 12px; border-radius: var(--radius-full); overflow: hidden; border: 1px solid var(--border-color);">
        <div id="ig-progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, var(--accent-primary), var(--accent-hover)); transition: width 0.2s ease;"></div>
      </div>
    </div>

    <div id="ig-result" style="display: none; margin-top: 24px; background: var(--bg-input); border: 1px solid var(--accent-green); border-radius: var(--radius-md); padding: 20px;">
      <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 16px; flex-wrap: wrap;">
        <img id="ig-thumb" src="" style="width: 140px; height: 90px; object-fit: cover; border-radius: var(--radius-sm); background: var(--bg-card);" />
        <div style="flex: 1;">
          <span style="background: var(--accent-primary); color: #fff; font-size: 0.7rem; padding: 2px 6px; font-weight: 900; border-radius: 4px;">INSTAGRAM</span>
          <h4 id="ig-title" style="font-size: 1.05rem; font-weight: 900; margin-top: 4px; text-transform: none;">MÍDIA ENCONTRADA</h4>
        </div>
      </div>
      <button id="ig-btn-download" class="btn btn-primary" style="width: 100%;">
        <i data-lucide="download"></i>
        <span>BAIXAR VÍDEO</span>
      </button>
    </div>
  `;

  const input = container.querySelector('#ig-url-input');
  const btnPaste = container.querySelector('#ig-btn-paste');
  const btnProcess = container.querySelector('#ig-btn-process');
  const statusBox = container.querySelector('#ig-status');
  const errorBox = container.querySelector('#ig-error');
  const progressBox = container.querySelector('#ig-progress');
  const progressBar = container.querySelector('#ig-progress-bar');
  const progressPct = container.querySelector('#ig-progress-pct');
  const resultBox = container.querySelector('#ig-result');
  const thumb = container.querySelector('#ig-thumb');
  const titleEl = container.querySelector('#ig-title');
  const btnDownload = container.querySelector('#ig-btn-download');

  let currentSourceUrl = '';
  let currentTitle = '';

  btnPaste.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) { input.value = text; process(); }
    } catch (e) {}
  });

  btnProcess.addEventListener('click', process);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') process(); });
  btnDownload.addEventListener('click', () => triggerDownload(currentSourceUrl, currentTitle));

  async function process() {
    const url = input.value.trim();
    if (!url) return;
    if (!url.includes('instagram.com')) {
      showError('COLE UM LINK DO INSTAGRAM (instagram.com/reel/... OU /p/...).');
      return;
    }

    statusBox.style.display = 'block';
    errorBox.style.display = 'none';
    resultBox.style.display = 'none';
    progressBox.style.display = 'none';

    try {
      const resp = await fetch('/api/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await resp.json();
      statusBox.style.display = 'none';

      if (!data.ok) {
        showError(data.error || 'NÃO FOI POSSÍVEL PROCESSAR ESTE LINK.');
        return;
      }

      currentSourceUrl = data.sourceUrl;
      currentTitle = data.title;
      thumb.src = data.thumbnail || '';
      titleEl.textContent = data.title || 'MÍDIA ENCONTRADA';
      resultBox.style.display = 'block';
    } catch (err) {
      statusBox.style.display = 'none';
      showError('ERRO DE CONEXÃO. TENTE NOVAMENTE.');
    }
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.style.display = 'block';
  }

  async function triggerDownload(sourceUrl, titleHint) {
    progressBox.style.display = 'block';
    progressBar.style.width = '0%';
    progressPct.textContent = '0%';

    try {
      const resp = await fetch(`/api/download?url=${encodeURIComponent(sourceUrl)}&kind=video`);
      if (!resp.ok || !resp.body) {
        let msg = 'FALHA AO BAIXAR ESTE ARQUIVO.';
        try { const j = await resp.json(); if (j.error) msg = j.error; } catch (e) {}
        throw new Error(msg);
      }

      const total = Number(resp.headers.get('content-length')) || 0;
      const disposition = resp.headers.get('content-disposition') || '';
      const fnMatch = disposition.match(/filename="([^"]+)"/);
      const fileName = fnMatch ? fnMatch[1] : `${titleHint || 'video-instagram'}.mp4`;

      const reader = resp.body.getReader();
      const chunks = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total > 0) {
          const pct = Math.min(100, Math.round((received / total) * 100));
          progressBar.style.width = pct + '%';
          progressPct.textContent = pct + '%';
        } else {
          progressPct.textContent = `${(received / 1024 / 1024).toFixed(1)} MB`;
        }
      }

      progressBar.style.width = '100%';
      progressPct.textContent = '100%';

      const blob = new Blob(chunks);
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objUrl);

      showToast(fileName, 'DOWNLOAD CONCLUÍDO!', 'success');
    } catch (err) {
      showToast(err.message || 'ERRO AO BAIXAR ESTE ARQUIVO.', 'FALHA NO DOWNLOAD', 'error');
    } finally {
      setTimeout(() => { progressBox.style.display = 'none'; }, 2000);
    }
  }
});
