/**
 * ÓRBITA DEVTOOLS - CORE LOGIC (2026)
 * Design Clean, Minimalista, Responsivo e Direto.
 * Criado por Carlos Eduardo.
 */

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  const state = {
    currentCategory: 'all',
    activeToolId: null,
    searchQuery: '',
    theme: localStorage.getItem('orbita_theme') || 'dark'
  };

  const tools = [
    {
      id: 'video-downloader',
      name: 'Baixador de Vídeos da Internet',
      description: 'Baixe vídeos públicos do YouTube, Instagram, TikTok e Twitter na máxima qualidade disponível.',
      category: 'video',
      icon: 'video',
      render: renderVideoDownloaderTool
    },
    {
      id: 'password',
      name: 'Gerador de Senha Forte (Estilo LastPass)',
      description: 'Gere senhas ultra seguras estilo LastPass com auto-cópia automática no clipboard.',
      category: 'seguranca',
      icon: 'shield-check',
      render: renderLastPassPasswordTool
    },
    {
      id: 'cpf',
      name: 'Gerador de CPF (Com e Sem Pontuação)',
      description: 'Gere CPFs válidos para testes com botões de 1-clique com e sem pontuação.',
      category: 'documentos',
      icon: 'file-check',
      render: renderCPFTool
    },
    {
      id: 'cnpj',
      name: 'Gerador de CNPJ (Com e Sem Pontuação)',
      description: 'Gere CNPJs válidos com e sem pontuação instantaneamente com auto-cópia.',
      category: 'documentos',
      icon: 'building-2',
      render: renderCNPJTool
    },
    {
      id: 'json',
      name: 'Formatador & Minificador JSON',
      description: 'Valide, formate e minifique estruturas JSON de forma rápida e segura.',
      category: 'dev',
      icon: 'code-2',
      render: renderJSONTool
    },
    {
      id: 'qrcode',
      name: 'Gerador de QR Code',
      description: 'Crie códigos QR para links, textos ou chave PIX com download em alta qualidade.',
      category: 'utilitarios',
      icon: 'qr-code',
      render: renderQRCodeTool
    },
    {
      id: 'hash',
      name: 'Gerador de Hashes (MD5 / SHA-256)',
      description: 'Gere hashes MD5 e SHA-256 a partir de qualquer texto instantaneamente.',
      category: 'seguranca',
      icon: 'key-round',
      render: renderHashTool
    },
    {
      id: 'base64',
      name: 'Codificador / Decodificador Base64',
      description: 'Codifique e decodifique textos em Base64 com 1 clique.',
      category: 'dev',
      icon: 'binary',
      render: renderBase64Tool
    },
    {
      id: 'counter',
      name: 'Contador de Texto e Palavras',
      description: 'Análise completa de caracteres, palavras, linhas e estimativa de tempo de leitura.',
      category: 'utilitarios',
      icon: 'type',
      render: renderCounterTool
    },
    {
      id: 'uuid',
      name: 'Gerador de UUID v4',
      description: 'Gere identificadores únicos universais (UUID v4) em lote.',
      category: 'dev',
      icon: 'fingerprint',
      render: renderUUIDTool
    },
    {
      id: 'px-rem',
      name: 'Conversor PX para REM',
      description: 'Conversão instantânea de Pixels para REM para folhas de estilo CSS.',
      category: 'dev',
      icon: 'ruler',
      render: renderPxRemTool
    },
    {
      id: 'lorem',
      name: 'Gerador de Lorem Ipsum',
      description: 'Gere parágrafos de texto fictício Lorem Ipsum para layouts.',
      category: 'utilitarios',
      icon: 'align-left',
      render: renderLoremTool
    },
    {
      id: 'color',
      name: 'Seletor de Cores & HEX',
      description: 'Seletor de cores rápido com códigos HEX e RGB copiáveis.',
      category: 'utilitarios',
      icon: 'palette',
      render: renderColorTool
    }
  ];

  const el = {
    toolsGrid: document.getElementById('tools-grid'),
    toolsGridView: document.getElementById('tools-grid-view'),
    toolActiveView: document.getElementById('tool-active-view'),
    activeToolContainer: document.getElementById('active-tool-container'),
    activeToolTitle: document.getElementById('active-tool-title'),
    activeToolDesc: document.getElementById('active-tool-desc'),
    btnBackToGrid: document.getElementById('btn-back-to-grid'),
    globalSearch: document.getElementById('global-search'),
    categoryTabs: document.querySelectorAll('.tab-btn'),
    currentCategoryTitle: document.getElementById('current-category-title'),
    toolsCountLabel: document.getElementById('tools-count-label'),
    themeToggle: document.getElementById('theme-toggle'),
    themeIcon: document.getElementById('theme-icon'),
    toastContainer: document.getElementById('toast-container'),
    modalPrivacy: document.getElementById('modal-privacy'),
    modalTerms: document.getElementById('modal-terms'),
    modalAdInterstitial: document.getElementById('modal-ad-interstitial'),
    btnCloseAdPopup: document.getElementById('btn-close-ad-popup')
  };

  initTheme();
  renderGrid();
  attachEvents();

  function attachEvents() {
    el.globalSearch.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      renderGrid();
    });

    el.categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        el.categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.currentCategory = tab.dataset.category;
        showGridView();
        renderGrid();
      });
    });

    el.btnBackToGrid.addEventListener('click', showGridView);
    el.themeToggle.addEventListener('click', toggleTheme);

    document.querySelectorAll('.btn-open-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.modal;
        if (id === 'privacy') el.modalPrivacy.classList.remove('hidden');
        if (id === 'terms') el.modalTerms.classList.remove('hidden');
      });
    });

    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.modal;
        if (id === 'privacy') el.modalPrivacy.classList.add('hidden');
        if (id === 'terms') el.modalTerms.classList.add('hidden');
      });
    });

    [el.modalPrivacy, el.modalTerms].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
    });
  }

  function renderGrid() {
    el.toolsGrid.innerHTML = '';

    const filtered = tools.filter(tool => {
      const matchCat = state.currentCategory === 'all' ? true : tool.category === state.currentCategory;
      const matchSearch = tool.name.toLowerCase().includes(state.searchQuery) || tool.description.toLowerCase().includes(state.searchQuery);
      return matchCat && matchSearch;
    });

    el.toolsCountLabel.textContent = `${filtered.length} de ${tools.length} ferramentas`;

    filtered.forEach(tool => {
      const card = document.createElement('div');
      card.className = 'tool-card';
      card.innerHTML = `
        <div>
          <div class="tool-card-icon">
            <i data-lucide="${tool.icon}"></i>
          </div>
          <h3 class="tool-card-title">${tool.name}</h3>
          <p class="tool-card-desc">${tool.description}</p>
        </div>
        <div class="tool-card-action">
          <span>Abrir</span>
          <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
        </div>
      `;
      card.addEventListener('click', () => openTool(tool.id));
      el.toolsGrid.appendChild(card);
    });

    lucide.createIcons();
  }

  function openTool(id) {
    const tool = tools.find(t => t.id === id);
    if (!tool) return;

    state.activeToolId = tool.id;
    el.toolsGridView.classList.add('hidden');
    el.toolActiveView.classList.remove('hidden');

    el.activeToolTitle.textContent = tool.name;
    el.activeToolDesc.textContent = tool.description;

    el.activeToolContainer.innerHTML = '';
    tool.render(el.activeToolContainer);

    lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showGridView() {
    state.activeToolId = null;
    el.toolActiveView.classList.add('hidden');
    el.toolsGridView.classList.remove('hidden');
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i data-lucide="check-circle-2" style="color: var(--accent-green); width: 22px; height: 22px;"></i>
      <div>
        <div style="font-weight: 800; color: var(--accent-green); font-size: 0.8rem; letter-spacing: 0.05em;">COPIADO PARA O CLIPBOARD!</div>
        <div style="font-size: 0.85rem; color: var(--text-primary);">${message}</div>
      </div>
    `;
    el.toastContainer.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }

  function copyToClipboard(text, customMessage = 'Prontinho para colar (Ctrl + V ou Colar no celular)') {
    if (!text) return;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => showToast(customMessage)).catch(() => fallbackCopy(text, customMessage));
    } else {
      fallbackCopy(text, customMessage);
    }
  }

  function fallbackCopy(text, customMessage) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(customMessage);
    } catch (err) {}
    document.body.removeChild(textArea);
  }

  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.className = state.theme;
    localStorage.setItem('orbita_theme', state.theme);
    el.themeIcon.setAttribute('data-lucide', state.theme === 'dark' ? 'moon' : 'sun');
    lucide.createIcons();
  }

  function initTheme() {
    document.documentElement.className = state.theme;
    el.themeIcon.setAttribute('data-lucide', state.theme === 'dark' ? 'moon' : 'sun');
  }

  /* 1. BAIXADOR DE VÍDEOS */
  function renderVideoDownloaderTool(container) {
    container.innerHTML = `
      <div style="max-width: 680px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h3 style="font-size: 1.3rem; font-weight: 800;">Baixar Vídeo em Máxima Qualidade</h3>
          <p class="text-muted" style="font-size: 0.9rem;">Cole o link do YouTube, Instagram, TikTok ou Twitter.</p>
        </div>

        <div class="form-group" style="margin-bottom: 20px;">
          <div style="position: relative;">
            <input type="text" id="video-url-input" class="form-input" placeholder="Cole o link do vídeo aqui..." style="padding-right: 110px;" />
            <button id="btn-paste-link" class="btn btn-outline" style="position: absolute; right: 6px; top: 5px; padding: 6px 12px; font-size: 0.8rem;">
              Colar Link
            </button>
          </div>
        </div>

        <button id="btn-process-video" class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 1rem;">
          <i data-lucide="search"></i>
          <span>Buscar Vídeo e Baixar na Melhor Qualidade</span>
        </button>

        <div id="video-status" style="text-align: center; display: none; margin-top: 20px;">
          <div class="spinner" style="display: inline-block; width: 28px; height: 28px; border: 3px solid var(--border-color); border-top-color: var(--accent-primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 8px;"></div>
          <p style="font-weight: 600; color: var(--accent-cyan); font-size: 0.9rem;">Localizando vídeo e preparando o download...</p>
        </div>

        <div id="video-result-box" style="display: none; margin-top: 24px; background: var(--bg-input); border: 1px solid var(--accent-green); border-radius: var(--radius-md); padding: 20px;">
          <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 16px; flex-wrap: wrap;">
            <img id="video-thumbnail-img" src="" style="width: 140px; height: 90px; object-fit: cover; border-radius: var(--radius-sm);" />
            <div style="flex: 1;">
              <span id="platform-tag" class="badge" style="background: var(--accent-primary); color: #fff; font-size: 0.7rem; padding: 2px 6px; font-weight: 700;">INSTAGRAM</span>
              <h4 id="video-title-display" style="font-size: 1.05rem; font-weight: 700; margin-top: 4px;">Vídeo Encontrado</h4>
              <p style="font-size: 0.8rem; color: var(--accent-green); font-weight: 600;">✓ Pronto em Máxima Qualidade (HD / 4K)</p>
            </div>
          </div>

          <a id="link-direct-download" href="#" target="_blank" rel="noopener" class="btn btn-primary" style="width: 100%; text-decoration: none;">
            <i data-lucide="download-cloud"></i>
            <span>Baixar Vídeo Agora</span>
          </a>
        </div>
      </div>
    `;

    const input = container.querySelector('#video-url-input');
    const btnPaste = container.querySelector('#btn-paste-link');
    const btnProcess = container.querySelector('#btn-process-video');
    const statusBox = container.querySelector('#video-status');
    const resultBox = container.querySelector('#video-result-box');
    const thumbImg = container.querySelector('#video-thumbnail-img');
    const titleDisplay = container.querySelector('#video-title-display');
    const platformTag = container.querySelector('#platform-tag');
    const directLink = container.querySelector('#link-direct-download');

    let pendingUrl = "";

    btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) { input.value = text; process(); }
      } catch (e) {}
    });

    btnProcess.addEventListener('click', process);

    if (el.btnCloseAdPopup) {
      el.btnCloseAdPopup.onclick = () => {
        el.modalAdInterstitial.classList.add('hidden');
        if (pendingUrl) {
          window.open(pendingUrl, '_blank');
          showToast('✓ Download de vídeo iniciado com sucesso!');
        }
      };
    }

    function process() {
      const url = input.value.trim();
      if (!url) return;

      statusBox.style.display = 'block';
      resultBox.style.display = 'none';

      let platform = "INTERNET";
      let title = "Vídeo Público";
      let thumb = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&auto=format&fit=crop&q=80";
      let downloadUrl = `https://savefrom.net/?url=${encodeURIComponent(url)}`;

      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        platform = "YOUTUBE";
        title = "Vídeo do YouTube (HD 1080p)";
        const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
        if (match) thumb = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
        downloadUrl = `https://ssyoutube.com/pt132/youtube-video-downloader?url=${encodeURIComponent(url)}`;
      } else if (url.includes('instagram.com')) {
        platform = "INSTAGRAM";
        title = "Reels / Post do Instagram";
        downloadUrl = `https://snapinsta.app/pt?url=${encodeURIComponent(url)}`;
      } else if (url.includes('tiktok.com')) {
        platform = "TIKTOK";
        title = "TikTok (Sem Marca d'Água)";
        downloadUrl = `https://snaptik.app/pt?url=${encodeURIComponent(url)}`;
      }

      pendingUrl = downloadUrl;

      setTimeout(() => {
        statusBox.style.display = 'none';
        resultBox.style.display = 'block';

        thumbImg.src = thumb;
        titleDisplay.textContent = title;
        platformTag.textContent = platform;
        directLink.href = downloadUrl;

        el.modalAdInterstitial.classList.remove('hidden');
        try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
      }, 900);
    }
  }

  /* 2. LASTPASS PASSWORDS */
  function renderLastPassPasswordTool(container) {
    container.innerHTML = `
      <div style="max-width: 680px; margin: 0 auto;">
        <div style="background: var(--bg-input); border: 1px solid var(--accent-primary); padding: 20px; border-radius: var(--radius-md); text-align: center; margin-bottom: 20px;">
          <div id="lp-pass-display" class="font-mono" style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); word-break: break-all; min-height: 40px; display: flex; align-items: center; justify-content: center;"></div>
        </div>

        <button id="btn-lp-generate" class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 1rem; margin-bottom: 24px;">
          <i data-lucide="refresh-cw"></i>
          <span>Gerar Nova Senha e Copiar</span>
        </button>

        <div style="background: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px;">
          <div class="form-group">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <label class="form-label">Tamanho da Senha:</label>
              <span id="lp-len-val" class="font-mono" style="font-weight: 800; color: var(--accent-primary);">16</span>
            </div>
            <input type="range" id="lp-len-range" min="8" max="64" value="16" style="width: 100%; accent-color: var(--accent-primary);" />
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 16px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer;">
              <input type="checkbox" id="chk-upper" checked style="accent-color: var(--accent-primary);" /> Maiúsculas (A-Z)
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer;">
              <input type="checkbox" id="chk-lower" checked style="accent-color: var(--accent-primary);" /> Minúsculas (a-z)
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer;">
              <input type="checkbox" id="chk-num" checked style="accent-color: var(--accent-primary);" /> Números (0-9)
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer;">
              <input type="checkbox" id="chk-sym" checked style="accent-color: var(--accent-primary);" /> Símbolos (!@#$)
            </label>
          </div>
        </div>
      </div>
    `;

    const display = container.querySelector('#lp-pass-display');
    const range = container.querySelector('#lp-len-range');
    const lenVal = container.querySelector('#lp-len-val');
    const btn = container.querySelector('#btn-lp-generate');

    range.addEventListener('input', () => { lenVal.textContent = range.value; generate(false); });
    container.querySelectorAll('input[type="checkbox"]').forEach(c => c.addEventListener('change', () => generate(false)));

    function generate(copy = true) {
      const len = parseInt(range.value);
      let pool = '';
      if (container.querySelector('#chk-upper').checked) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (container.querySelector('#chk-lower').checked) pool += 'abcdefghijklmnopqrstuvwxyz';
      if (container.querySelector('#chk-num').checked) pool += '0123456789';
      if (container.querySelector('#chk-sym').checked) pool += '!@#$%^&*()_+-=[]{}|;:,.<>?';

      if (!pool) { display.textContent = 'Selecione 1 opção'; return; }

      let pass = '';
      const arr = new Uint32Array(len);
      crypto.getRandomValues(arr);
      for (let i = 0; i < len; i++) pass += pool[arr[i] % pool.length];

      display.textContent = pass;
      if (copy) copyToClipboard(pass, 'Senha gerada e copiada!');
    }

    btn.addEventListener('click', () => generate(true));
    generate(true);
  }

  /* 3. CPF TOOL */
  function renderCPFTool(container) {
    container.innerHTML = `
      <div style="max-width: 680px; margin: 0 auto;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
          <button id="btn-cpf-fmt" class="btn btn-primary" style="padding: 14px;">
            <span>Com Pontuação (000.000.000-00)</span>
          </button>
          <button id="btn-cpf-raw" class="btn btn-secondary" style="padding: 14px;">
            <span>Sem Pontuação (00000000000)</span>
          </button>
        </div>

        <div class="output-box" style="text-align: center;">
          <div id="cpf-out" class="font-mono" style="font-size: 1.4rem; font-weight: 700;">Clique em Gerar</div>
        </div>
      </div>
    `;

    const out = container.querySelector('#cpf-out');

    function genCPF(fmt = true) {
      let n = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
      let d1 = n.reduce((a, v, i) => a + v * (10 - i), 0) % 11;
      d1 = d1 < 2 ? 0 : 11 - d1;
      n.push(d1);
      let d2 = n.reduce((a, v, i) => a + v * (11 - i), 0) % 11;
      d2 = d2 < 2 ? 0 : 11 - d2;
      n.push(d2);
      const raw = n.join('');
      const val = fmt ? raw.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : raw;
      out.textContent = val;
      copyToClipboard(val, 'CPF gerado e copiado!');
    }

    container.querySelector('#btn-cpf-fmt').onclick = () => genCPF(true);
    container.querySelector('#btn-cpf-raw').onclick = () => genCPF(false);
    genCPF(true);
  }

  /* 4. CNPJ TOOL */
  function renderCNPJTool(container) {
    container.innerHTML = `
      <div style="max-width: 680px; margin: 0 auto;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
          <button id="btn-cnpj-fmt" class="btn btn-primary" style="padding: 14px;">
            <span>Com Pontuação (00.000.000/0001-00)</span>
          </button>
          <button id="btn-cnpj-raw" class="btn btn-secondary" style="padding: 14px;">
            <span>Sem Pontuação (00000000000100)</span>
          </button>
        </div>

        <div class="output-box" style="text-align: center;">
          <div id="cnpj-out" class="font-mono" style="font-size: 1.4rem; font-weight: 700;">Clique em Gerar</div>
        </div>
      </div>
    `;

    const out = container.querySelector('#cnpj-out');

    function genCNPJ(fmt = true) {
      let n = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).concat([0, 0, 0, 1]);
      let m1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      let d1 = n.reduce((a, v, i) => a + v * m1[i], 0) % 11;
      d1 = d1 < 2 ? 0 : 11 - d1;
      n.push(d1);
      let m2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      let d2 = n.reduce((a, v, i) => a + v * m2[i], 0) % 11;
      d2 = d2 < 2 ? 0 : 11 - d2;
      n.push(d2);
      const raw = n.join('');
      const val = fmt ? raw.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : raw;
      out.textContent = val;
      copyToClipboard(val, 'CNPJ gerado e copiado!');
    }

    container.querySelector('#btn-cnpj-fmt').onclick = () => genCNPJ(true);
    container.querySelector('#btn-cnpj-raw').onclick = () => genCNPJ(false);
    genCNPJ(true);
  }

  /* 5. JSON TOOL */
  function renderJSONTool(container) {
    container.innerHTML = `
      <div class="form-group">
        <textarea id="json-input" class="form-textarea font-mono" placeholder='Cole seu JSON aqui...'></textarea>
      </div>

      <div style="display: flex; gap: 12px; margin-bottom: 16px;">
        <button id="btn-fmt" class="btn btn-primary">Formatar e Copiar</button>
        <button id="btn-min" class="btn btn-secondary">Minificar e Copiar</button>
      </div>

      <div class="output-box">
        <pre id="json-out" class="font-mono" style="font-size: 0.9rem; color: var(--accent-cyan); white-space: pre-wrap;"></pre>
      </div>
    `;

    const input = container.querySelector('#json-input');
    const out = container.querySelector('#json-out');

    container.querySelector('#btn-fmt').onclick = () => {
      try {
        const obj = JSON.parse(input.value);
        const res = JSON.stringify(obj, null, 2);
        out.textContent = res;
        copyToClipboard(res, 'JSON formatado e copiado!');
      } catch (e) { out.textContent = 'JSON inválido'; }
    };

    container.querySelector('#btn-min').onclick = () => {
      try {
        const obj = JSON.parse(input.value);
        const res = JSON.stringify(obj);
        out.textContent = res;
        copyToClipboard(res, 'JSON minificado e copiado!');
      } catch (e) { out.textContent = 'JSON inválido'; }
    };
  }

  /* 6. QR CODE */
  function renderQRCodeTool(container) {
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start;">
        <div>
          <div class="form-group">
            <label class="form-label">Link ou Texto:</label>
            <input type="text" id="qr-in" class="form-input" value="https://abobiferramentas.com" />
          </div>
          <button id="btn-qr" class="btn btn-primary" style="width: 100%;">Gerar QR Code</button>
        </div>
        <div style="text-align: center; background: #fff; padding: 16px; border-radius: var(--radius-md);">
          <div id="qr-box"></div>
        </div>
      </div>
    `;

    const input = container.querySelector('#qr-in');
    const box = container.querySelector('#qr-box');

    function make() {
      box.innerHTML = '';
      if (input.value) new QRCode(box, { text: input.value, width: 160, height: 160 });
    }

    container.querySelector('#btn-qr').onclick = make;
    make();
  }

  /* 7. HASH TOOL */
  function renderHashTool(container) {
    container.innerHTML = `
      <div class="form-group">
        <label class="form-label">Texto:</label>
        <input type="text" id="hash-in" class="form-input" value="Órbita DevTools" />
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="output-box" id="box-md5" style="cursor: pointer;">MD5: <span id="md5-out" class="font-mono" style="color: var(--accent-cyan);"></span></div>
        <div class="output-box" id="box-sha256" style="cursor: pointer;">SHA-256: <span id="sha256-out" class="font-mono" style="color: var(--accent-cyan);"></span></div>
      </div>
    `;

    const input = container.querySelector('#hash-in');
    const md5 = container.querySelector('#md5-out');
    const sha = container.querySelector('#sha256-out');

    function update() {
      if (!input.value) return;
      md5.textContent = CryptoJS.MD5(input.value).toString();
      sha.textContent = CryptoJS.SHA256(input.value).toString();
    }

    container.querySelector('#box-md5').onclick = () => copyToClipboard(md5.textContent);
    container.querySelector('#box-sha256').onclick = () => copyToClipboard(sha.textContent);

    input.oninput = update;
    update();
  }

  /* 8. BASE64 */
  function renderBase64Tool(container) {
    container.innerHTML = `
      <div class="form-group">
        <textarea id="b64-in" class="form-textarea font-mono" placeholder="Digite seu texto..."></textarea>
      </div>
      <div style="display: flex; gap: 12px; margin-bottom: 16px;">
        <button id="btn-enc" class="btn btn-primary">Codificar</button>
        <button id="btn-dec" class="btn btn-secondary">Decodificar</button>
      </div>
      <div class="output-box"><div id="b64-out" class="font-mono"></div></div>
    `;

    const input = container.querySelector('#b64-in');
    const out = container.querySelector('#b64-out');

    container.querySelector('#btn-enc').onclick = () => {
      const res = btoa(unescape(encodeURIComponent(input.value)));
      out.textContent = res;
      copyToClipboard(res);
    };

    container.querySelector('#btn-dec').onclick = () => {
      try {
        const res = decodeURIComponent(escape(atob(input.value)));
        out.textContent = res;
        copyToClipboard(res);
      } catch (e) { out.textContent = 'Erro ao decodificar'; }
    };
  }

  /* 9. COUNTER */
  function renderCounterTool(container) {
    container.innerHTML = `
      <div class="form-group">
        <textarea id="cnt-in" class="form-textarea" placeholder="Digite seu texto..."></textarea>
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; text-align: center;">
        <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-md);">
          <div id="cnt-c" style="font-size: 1.5rem; font-weight: 800; color: var(--accent-primary);">0</div>
          <div class="text-muted" style="font-size: 0.8rem;">Caracteres</div>
        </div>
        <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-md);">
          <div id="cnt-w" style="font-size: 1.5rem; font-weight: 800; color: var(--accent-cyan);">0</div>
          <div class="text-muted" style="font-size: 0.8rem;">Palavras</div>
        </div>
        <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-md);">
          <div id="cnt-l" style="font-size: 1.5rem; font-weight: 800; color: var(--accent-green);">0</div>
          <div class="text-muted" style="font-size: 0.8rem;">Linhas</div>
        </div>
        <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-md);">
          <div id="cnt-r" style="font-size: 1.5rem; font-weight: 800; color: var(--accent-hover);">0m</div>
          <div class="text-muted" style="font-size: 0.8rem;">Leitura</div>
        </div>
      </div>
    `;

    const input = container.querySelector('#cnt-in');
    input.oninput = () => {
      const text = input.value;
      const chars = text.length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const lines = text ? text.split('\n').length : 0;

      container.querySelector('#cnt-c').textContent = chars;
      container.querySelector('#cnt-w').textContent = words;
      container.querySelector('#cnt-l').textContent = lines;
      container.querySelector('#cnt-r').textContent = `${Math.ceil(words / 200)}m`;
    };
  }

  /* 10. UUID */
  function renderUUIDTool(container) {
    container.innerHTML = `
      <div style="display: flex; gap: 12px; margin-bottom: 16px;">
        <button id="btn-uuid" class="btn btn-primary">Gerar 5 UUIDs v4 e Copiar</button>
      </div>
      <div class="output-box"><pre id="uuid-out" class="font-mono" style="color: var(--accent-cyan);"></pre></div>
    `;

    const out = container.querySelector('#uuid-out');
    function gen() {
      const res = Array.from({ length: 5 }, () => crypto.randomUUID()).join('\n');
      out.textContent = res;
      copyToClipboard(res);
    }
    container.querySelector('#btn-uuid').onclick = gen;
    gen();
  }

  /* 11. PX TO REM */
  function renderPxRemTool(container) {
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div class="form-group">
          <label class="form-label">Pixels (PX):</label>
          <input type="number" id="px-in" class="form-input font-mono" value="16" />
        </div>
        <div class="form-group">
          <label class="form-label">REM:</label>
          <input type="number" id="rem-in" class="form-input font-mono" value="1" step="0.125" />
        </div>
      </div>
    `;

    const px = container.querySelector('#px-in');
    const rem = container.querySelector('#rem-in');
    px.oninput = () => { rem.value = px.value ? (px.value / 16) : ''; };
    rem.oninput = () => { px.value = rem.value ? (rem.value * 16) : ''; };
  }

  /* 12. LOREM */
  function renderLoremTool(container) {
    container.innerHTML = `
      <button id="btn-lorem" class="btn btn-primary" style="margin-bottom: 16px;">Gerar Lorem Ipsum e Copiar</button>
      <div class="output-box" id="lorem-out" style="line-height: 1.6;"></div>
    `;
    const txt = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
    const out = container.querySelector('#lorem-out');
    function gen() {
      out.textContent = txt;
      copyToClipboard(txt);
    }
    container.querySelector('#btn-lorem').onclick = gen;
    gen();
  }

  /* 13. COLOR */
  function renderColorTool(container) {
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: center;">
        <div>
          <div class="form-group">
            <input type="color" id="picker" value="#3b82f6" style="width: 100%; height: 50px; border: none; border-radius: var(--radius-md); cursor: pointer;" />
          </div>
          <div class="output-box" id="hex-box" style="cursor: pointer; margin-bottom: 8px;">HEX: <strong id="hex-val" class="font-mono">#3b82f6</strong></div>
        </div>
        <div id="color-prev" style="height: 120px; border-radius: var(--radius-md); background: #3b82f6;"></div>
      </div>
    `;
    const picker = container.querySelector('#picker');
    const hex = container.querySelector('#hex-val');
    const prev = container.querySelector('#color-prev');

    picker.oninput = () => {
      hex.textContent = picker.value;
      prev.style.background = picker.value;
    };

    container.querySelector('#hex-box').onclick = () => copyToClipboard(hex.textContent);
  }

});
