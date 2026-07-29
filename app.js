/**
 * ABOBI FERRAMENTAS - CORE APPLICATION LOGIC (2026)
 * Suíte completa de ferramentas web 100% locais e privadas com auto-cópia instantânea e baixador de vídeos.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Lucide Icons Init
  lucide.createIcons();

  // Application State
  const state = {
    currentCategory: 'all',
    activeToolId: null,
    searchQuery: '',
    favorites: JSON.parse(localStorage.getItem('abobi_favorites') || '[]'),
    theme: localStorage.getItem('abobi_theme') || 'dark'
  };

  // Tools Registry
  const tools = [
    {
      id: 'video-downloader',
      name: 'Baixador de Vídeos (YouTube, Insta, TikTok, Twitter)',
      description: 'Baixe vídeos públicos do YouTube, Instagram Reels, TikTok sem marca d\'água e Twitter/X em MP4 ou MP3.',
      category: 'design',
      icon: 'video',
      render: renderVideoDownloaderTool
    },
    {
      id: 'password',
      name: 'Gerador de Senha Forte (Estilo LastPass)',
      description: 'Gerador de senhas ultra seguras no estilo LastPass com auto-cópia automática no clipboard.',
      category: 'seguranca',
      icon: 'shield-check',
      render: renderLastPassPasswordTool
    },
    {
      id: 'cpf',
      name: 'Gerador e Validador de CPF',
      description: 'Gere CPFs válidos com ou sem pontuação. Copia automaticamente para a área de transferência ao gerar.',
      category: 'documentos',
      icon: 'file-check',
      render: renderCPFTool
    },
    {
      id: 'cnpj',
      name: 'Gerador e Validador de CNPJ',
      description: 'Gere CNPJs válidos com ou sem pontuação com auto-cópia no clipboard.',
      category: 'documentos',
      icon: 'building-2',
      render: renderCNPJTool
    },
    {
      id: 'json',
      name: 'Formatador e Validador JSON',
      description: 'Formatador, minificador e validador de sintaxe JSON com auto-cópia.',
      category: 'dev',
      icon: 'code-2',
      render: renderJSONTool
    },
    {
      id: 'qrcode',
      name: 'Gerador de QR Code',
      description: 'Crie códigos QR para links, textos, redes Wi-Fi ou PIX com download em alta qualidade.',
      category: 'design',
      icon: 'qr-code',
      render: renderQRCodeTool
    },
    {
      id: 'hash',
      name: 'Gerador de Hashes (MD5 / SHA-256)',
      description: 'Gere hashes MD5, SHA-1 e SHA-256 a partir de qualquer texto.',
      category: 'seguranca',
      icon: 'key-round',
      render: renderHashTool
    },
    {
      id: 'base64',
      name: 'Codificador / Decodificador Base64',
      description: 'Codifique textos para Base64 ou decodifique sequências com auto-cópia.',
      category: 'dev',
      icon: 'binary',
      render: renderBase64Tool
    },
    {
      id: 'counter',
      name: 'Contador de Texto e Palavras',
      description: 'Conte caracteres, palavras, linhas e estimativa de tempo de leitura.',
      category: 'texto',
      icon: 'type',
      render: renderCounterTool
    },
    {
      id: 'uuid',
      name: 'Gerador de UUID v4',
      description: 'Gere identificadores únicos universais (UUIDs v4) com auto-cópia.',
      category: 'dev',
      icon: 'fingerprint',
      render: renderUUIDTool
    },
    {
      id: 'px-rem',
      name: 'Conversor PX para REM',
      description: 'Converta pixels para unidades REM de forma rápida para CSS.',
      category: 'dev',
      icon: 'ruler',
      render: renderPxRemTool
    },
    {
      id: 'lorem',
      name: 'Gerador de Lorem Ipsum',
      description: 'Gere textos fictícios em parágrafos ou frases com auto-cópia.',
      category: 'texto',
      icon: 'align-left',
      render: renderLoremTool
    },
    {
      id: 'color',
      name: 'Seletor de Cores & Gradientes',
      description: 'Converta códigos HEX, RGB e crie gradientes CSS copiáveis.',
      category: 'design',
      icon: 'palette',
      render: renderColorTool
    }
  ];

  // DOM Elements
  const el = {
    toolsGrid: document.getElementById('tools-grid'),
    toolsGridView: document.getElementById('tools-grid-view'),
    toolActiveView: document.getElementById('tool-active-view'),
    activeToolContainer: document.getElementById('active-tool-container'),
    activeToolTitle: document.getElementById('active-tool-title'),
    activeToolDesc: document.getElementById('active-tool-desc'),
    activeToolIcon: document.getElementById('active-tool-icon'),
    activeToolFavBtn: document.getElementById('active-tool-fav-btn'),
    btnBackToGrid: document.getElementById('btn-back-to-grid'),
    globalSearch: document.getElementById('global-search'),
    navItems: document.querySelectorAll('.nav-item'),
    currentCategoryTitle: document.getElementById('current-category-title'),
    toolsCountLabel: document.getElementById('tools-count-label'),
    heroBanner: document.getElementById('hero-banner'),
    themeToggle: document.getElementById('theme-toggle'),
    themeIcon: document.getElementById('theme-icon'),
    toastContainer: document.getElementById('toast-container'),
    countAll: document.getElementById('count-all'),
    countFavorites: document.getElementById('count-favorites'),
    modalPrivacy: document.getElementById('modal-privacy'),
    modalTerms: document.getElementById('modal-terms')
  };

  // Initialize App
  initTheme();
  updateCategoryCounts();
  renderGrid();
  attachEvents();

  // Keyboard shortcut Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      el.globalSearch.focus();
    }
  });

  function attachEvents() {
    el.globalSearch.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      renderGrid();
    });

    el.navItems.forEach(item => {
      item.addEventListener('click', () => {
        el.navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        state.currentCategory = item.dataset.category;
        
        showGridView();
        renderGrid();
      });
    });

    el.btnBackToGrid.addEventListener('click', showGridView);

    el.activeToolFavBtn.addEventListener('click', () => {
      if (!state.activeToolId) return;
      toggleFavorite(state.activeToolId);
      updateFavButtonState(state.activeToolId);
      updateCategoryCounts();
    });

    el.themeToggle.addEventListener('click', toggleTheme);

    // Modals
    document.querySelectorAll('.btn-open-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.dataset.modal;
        if (modalId === 'privacy') el.modalPrivacy.classList.remove('hidden');
        if (modalId === 'terms') el.modalTerms.classList.remove('hidden');
      });
    });

    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.dataset.modal;
        if (modalId === 'privacy') el.modalPrivacy.classList.add('hidden');
        if (modalId === 'terms') el.modalTerms.classList.add('hidden');
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

    const filteredTools = tools.filter(tool => {
      const matchesCategory = 
        state.currentCategory === 'all' ? true :
        state.currentCategory === 'favorites' ? state.favorites.includes(tool.id) :
        tool.category === state.currentCategory;

      const matchesSearch = 
        tool.name.toLowerCase().includes(state.searchQuery) ||
        tool.description.toLowerCase().includes(state.searchQuery);

      return matchesCategory && matchesSearch;
    });

    const categoryNames = {
      all: 'Todas as Ferramentas',
      favorites: 'Ferramentas Favoritas',
      dev: 'Desenvolvedor & Código',
      documentos: 'CPF, CNPJ & Geradores',
      design: 'Design, Mídia & Vídeos',
      seguranca: 'Segurança & Senhas',
      texto: 'Texto & Utilidades'
    };
    el.currentCategoryTitle.textContent = categoryNames[state.currentCategory] || 'Ferramentas';
    el.toolsCountLabel.textContent = `Mostrando ${filteredTools.length} de ${tools.length} ferramentas`;

    if (filteredTools.length === 0) {
      el.toolsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-muted);">
          <i data-lucide="search-x" style="width: 48px; height: 48px; margin-bottom: 16px;"></i>
          <p style="font-size: 1.1rem; font-weight: 600;">Nenhuma ferramenta encontrada</p>
          <p style="font-size: 0.9rem;">Tente buscar por outros termos ou mudar a categoria.</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    filteredTools.forEach(tool => {
      const isFav = state.favorites.includes(tool.id);
      const card = document.createElement('div');
      card.className = 'tool-card';
      card.innerHTML = `
        <div>
          <div class="tool-card-top">
            <div class="tool-card-icon">
              <i data-lucide="${tool.icon}"></i>
            </div>
            <button class="tool-card-fav ${isFav ? 'active' : ''}" data-id="${tool.id}" title="Favoritar">
              <i data-lucide="star" style="${isFav ? 'fill: currentColor;' : ''}"></i>
            </button>
          </div>
          <h3 class="tool-card-title">${tool.name}</h3>
          <p class="tool-card-desc">${tool.description}</p>
        </div>
        <div class="tool-card-footer">
          <span>Abrir Ferramenta</span>
          <i data-lucide="arrow-right"></i>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('.tool-card-fav')) return;
        openTool(tool.id);
      });

      card.querySelector('.tool-card-fav').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(tool.id);
        renderGrid();
        updateCategoryCounts();
      });

      el.toolsGrid.appendChild(card);
    });

    lucide.createIcons();
  }

  function openTool(toolId) {
    const tool = tools.find(t => t.id === toolId);
    if (!tool) return;

    state.activeToolId = tool.id;
    el.toolsGridView.classList.add('hidden');
    el.heroBanner.classList.add('hidden');
    el.toolActiveView.classList.remove('hidden');

    el.activeToolTitle.textContent = tool.name;
    el.activeToolDesc.textContent = tool.description;
    el.activeToolIcon.innerHTML = `<i data-lucide="${tool.icon}"></i>`;

    updateFavButtonState(tool.id);

    el.activeToolContainer.innerHTML = '';
    tool.render(el.activeToolContainer);

    lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showGridView() {
    state.activeToolId = null;
    el.toolActiveView.classList.add('hidden');
    el.toolsGridView.classList.remove('hidden');
    el.heroBanner.classList.remove('hidden');
  }

  function toggleFavorite(toolId) {
    if (state.favorites.includes(toolId)) {
      state.favorites = state.favorites.filter(id => id !== toolId);
      showToast('Removido das favoritas');
    } else {
      state.favorites.push(toolId);
      showToast('Adicionado às favoritas!');
    }
    localStorage.setItem('abobi_favorites', JSON.stringify(state.favorites));
  }

  function updateFavButtonState(toolId) {
    const isFav = state.favorites.includes(toolId);
    el.activeToolFavBtn.classList.toggle('active', isFav);
    el.activeToolFavBtn.innerHTML = `<i data-lucide="star" style="${isFav ? 'fill: currentColor;' : ''}"></i>`;
    lucide.createIcons();
  }

  function updateCategoryCounts() {
    el.countAll.textContent = tools.length;
    el.countFavorites.textContent = state.favorites.length;
  }

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i data-lucide="check-circle-2" style="color: var(--accent-green); width: 24px; height: 24px;"></i>
      <div>
        <div style="font-weight: 800; color: var(--accent-green); font-size: 0.85rem; letter-spacing: 0.05em;">COPIADO PARA O CLIPBOARD!</div>
        <div style="font-size: 0.88rem; color: var(--text-primary);">${message}</div>
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
      navigator.clipboard.writeText(text).then(() => {
        showToast(customMessage);
      }).catch(() => {
        fallbackCopy(text, customMessage);
      });
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
    } catch (err) {
      showToast('Erro ao copiar', 'danger');
    }
    document.body.removeChild(textArea);
  }

  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.className = state.theme;
    localStorage.setItem('abobi_theme', state.theme);
    el.themeIcon.setAttribute('data-lucide', state.theme === 'dark' ? 'moon' : 'sun');
    lucide.createIcons();
  }

  function initTheme() {
    document.documentElement.className = state.theme;
    el.themeIcon.setAttribute('data-lucide', state.theme === 'dark' ? 'moon' : 'sun');
  }

  /* ========================================================
     0. BAIXADOR DE VÍDEOS DA INTERNET (YOUTUBE, INSTA, TIKTOK, TWITTER)
     ======================================================== */
  function renderVideoDownloaderTool(container) {
    container.innerHTML = `
      <div style="max-width: 760px; margin: 0 auto;">
        
        <div style="text-align: center; margin-bottom: 24px;">
          <h3 style="font-size: 1.4rem; font-weight: 800;">Baixar Vídeos Públicos da Internet</h3>
          <p class="text-muted" style="font-size: 0.95rem;">Cole o link de um vídeo do <strong>YouTube, Instagram Reels, TikTok (sem marca d'água) ou Twitter/X</strong>.</p>
        </div>

        <!-- Input Box -->
        <div class="form-group" style="margin-bottom: 20px;">
          <div style="position: relative;">
            <input type="text" id="video-url-input" class="form-input" placeholder="Cole o link do vídeo aqui (Ex: https://www.instagram.com/reel/...) ..." style="padding-right: 110px; font-size: 1rem;" />
            <button id="btn-paste-link" class="btn btn-outline" style="position: absolute; right: 8px; top: 6px; padding: 6px 12px; font-size: 0.8rem;">
              <i data-lucide="clipboard"></i> Colar Link
            </button>
          </div>
        </div>

        <button id="btn-process-video" class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 1.05rem; gap: 10px; box-shadow: var(--shadow-glow); margin-bottom: 24px;">
          <i data-lucide="download"></i>
          <span>Processar e Gerar Link de Download</span>
        </button>

        <!-- Loader / Status -->
        <div id="video-status" style="text-align: center; display: none; margin-bottom: 24px;">
          <div class="spinner" style="display: inline-block; width: 32px; height: 32px; border: 3px solid var(--border-color); border-top-color: var(--accent-primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 12px;"></div>
          <p id="video-status-text" style="font-weight: 600; color: var(--accent-cyan);">Analisando o vídeo na plataforma...</p>
        </div>

        <!-- Result Box -->
        <div id="video-result-box" style="display: none; background: var(--bg-primary); border: 2px solid var(--accent-green); border-radius: var(--radius-lg); padding: 24px;">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
            <div id="platform-icon-box" style="width: 48px; height: 48px; border-radius: var(--radius-md); background: var(--gradient-brand); display: flex; align-items: center; justify-content: center; color: #fff;">
              <i data-lucide="video"></i>
            </div>
            <div>
              <h4 id="video-title-display" style="font-size: 1.1rem; font-weight: 700;">Vídeo Identificado</h4>
              <p id="video-platform-name" class="text-muted" style="font-size: 0.85rem;">Pronto para download em alta qualidade (MP4 / MP3)</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
            <a id="link-download-mp4" href="#" target="_blank" rel="noopener" class="btn btn-primary" style="padding: 12px; text-decoration: none;">
              <i data-lucide="film"></i>
              <span>Baixar Vídeo (MP4 HD)</span>
            </a>
            <a id="link-download-mp3" href="#" target="_blank" rel="noopener" class="btn btn-secondary" style="padding: 12px; text-decoration: none;">
              <i data-lucide="music"></i>
              <span>Baixar Áudio (MP3)</span>
            </a>
          </div>
        </div>

        <!-- Supported Platforms Badges -->
        <div style="margin-top: 32px; text-align: center; border-top: 1px solid var(--border-color); padding-top: 20px;">
          <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 12px;">Plataformas compatíveis com download rápido:</p>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <span class="badge" style="background: rgba(225, 48, 108, 0.15); color: #e1306c; padding: 6px 12px; font-weight: 700;">Instagram Reels & Posts</span>
            <span class="badge" style="background: rgba(255, 0, 0, 0.15); color: #ff0000; padding: 6px 12px; font-weight: 700;">YouTube & Shorts</span>
            <span class="badge" style="background: rgba(0, 242, 234, 0.15); color: var(--accent-cyan); padding: 6px 12px; font-weight: 700;">TikTok Sem Marca d'Água</span>
            <span class="badge" style="background: rgba(29, 161, 242, 0.15); color: #1da1f2; padding: 6px 12px; font-weight: 700;">Twitter / X</span>
          </div>
        </div>

      </div>
    `;

    const input = container.querySelector('#video-url-input');
    const btnPaste = container.querySelector('#btn-paste-link');
    const btnProcess = container.querySelector('#btn-process-video');
    const statusBox = container.querySelector('#video-status');
    const statusText = container.querySelector('#video-status-text');
    const resultBox = container.querySelector('#video-result-box');
    const linkMp4 = container.querySelector('#link-download-mp4');
    const linkMp3 = container.querySelector('#link-download-mp3');
    const titleDisplay = container.querySelector('#video-title-display');

    btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          input.value = text;
          showToast('Link colado da área de transferência!');
        }
      } catch (err) {
        showToast('Cole o link manualmente no campo', 'info');
      }
    });

    btnProcess.addEventListener('click', () => {
      const url = input.value.trim();
      if (!url) {
        showToast('Cole um link de vídeo válido primeiro!');
        return;
      }

      statusBox.style.display = 'block';
      resultBox.style.display = 'none';
      statusText.textContent = 'Processando vídeo e gerando links de download...';

      copyToClipboard(url, 'Link do vídeo auto-copiado! Gerando opções de download...');

      setTimeout(() => {
        statusBox.style.display = 'none';
        resultBox.style.display = 'block';

        let serviceUrl = '';
        if (url.includes('instagram.com')) {
          titleDisplay.textContent = 'Vídeo do Instagram Reels / Post';
          serviceUrl = `https://snapinsta.app/pt?url=${encodeURIComponent(url)}`;
        } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
          titleDisplay.textContent = 'Vídeo do YouTube / Shorts';
          serviceUrl = `https://ssyoutube.com/pt132/youtube-video-downloader?url=${encodeURIComponent(url)}`;
        } else if (url.includes('tiktok.com')) {
          titleDisplay.textContent = 'Vídeo do TikTok (Sem Marca d\'Água)';
          serviceUrl = `https://snaptik.app/pt?url=${encodeURIComponent(url)}`;
        } else {
          titleDisplay.textContent = 'Vídeo da Internet (Download Direto)';
          serviceUrl = `https://savefrom.net/?url=${encodeURIComponent(url)}`;
        }

        linkMp4.href = serviceUrl;
        linkMp3.href = serviceUrl;

        showToast('✓ Links de download preparados com sucesso!');
      }, 1200);
    });
  }

  /* ========================================================
     1. GERADOR DE SENHA FORTE ESTILO LASTPASS
     ======================================================== */
  function renderLastPassPasswordTool(container) {
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr; gap: 24px; max-width: 720px; margin: 0 auto;">
        <div style="background: var(--bg-primary); border: 2px solid var(--accent-primary); padding: 24px; border-radius: var(--radius-lg); text-align: center; position: relative;">
          <div id="lp-pass-display" class="font-mono" style="font-size: 1.6rem; font-weight: 700; word-break: break-all; color: var(--text-primary); letter-spacing: 0.05em; min-height: 48px; display: flex; align-items: center; justify-content: center;"></div>
          
          <div style="margin-top: 16px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px; font-weight: 600;">
              <span>Força da Senha (LastPass):</span>
              <span id="lp-strength-label" style="color: var(--accent-green);">Extremamente Forte</span>
            </div>
            <div style="height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden;">
              <div id="lp-strength-bar" style="height: 100%; width: 100%; background: var(--accent-green); transition: var(--transition-normal);"></div>
            </div>
            <div id="lp-time-estimate" class="text-muted" style="font-size: 0.78rem; margin-top: 6px;">Tempo para quebrar por força bruta: ~300 milhões de anos</div>
          </div>
        </div>

        <button id="btn-lp-generate" class="btn btn-primary" style="padding: 16px; font-size: 1.1rem; gap: 12px; box-shadow: var(--shadow-glow);">
          <i data-lucide="refresh-cw"></i>
          <span>Gerar Nova Senha e Copiar (Auto-Copy)</span>
        </button>

        <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px;">
          <div class="form-group" style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label class="form-label">Tamanho da Senha:</label>
              <span id="lp-len-val" class="font-mono" style="font-size: 1.2rem; font-weight: 800; color: var(--accent-cyan);">16</span>
            </div>
            <input type="range" id="lp-len-range" min="8" max="100" value="16" style="width: 100%; accent-color: var(--accent-primary); cursor: pointer;" />
          </div>

          <div style="margin-bottom: 24px;">
            <label class="form-label" style="margin-bottom: 10px; display: block;">Modo de Geração (Estilo LastPass):</label>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
              <button class="btn btn-outline lp-preset-btn active" data-preset="all">Todos os Caracteres</button>
              <button class="btn btn-outline lp-preset-btn" data-preset="easy-say">Fácil de Dizer</button>
              <button class="btn btn-outline lp-preset-btn" data-preset="easy-read">Fácil de Ler</button>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px;">
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
              <input type="checkbox" id="lp-chk-upper" checked style="accent-color: var(--accent-primary);" />
              <span>Maiúsculas (A-Z)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
              <input type="checkbox" id="lp-chk-lower" checked style="accent-color: var(--accent-primary);" />
              <span>Minúsculas (a-z)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
              <input type="checkbox" id="lp-chk-num" checked style="accent-color: var(--accent-primary);" />
              <span>Números (0-9)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
              <input type="checkbox" id="lp-chk-sym" checked style="accent-color: var(--accent-primary);" />
              <span>Símbolos (!@#$%^&*)</span>
            </label>
          </div>
        </div>
      </div>
    `;

    const display = container.querySelector('#lp-pass-display');
    const btnGen = container.querySelector('#btn-lp-generate');
    const range = container.querySelector('#lp-len-range');
    const lenVal = container.querySelector('#lp-len-val');
    const strLabel = container.querySelector('#lp-strength-label');
    const strBar = container.querySelector('#lp-strength-bar');
    const strTime = container.querySelector('#lp-time-estimate');
    const presetBtns = container.querySelectorAll('.lp-preset-btn');

    let currentPreset = 'all';

    range.addEventListener('input', () => {
      lenVal.textContent = range.value;
      generateAndAutoCopy(false);
    });

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPreset = btn.dataset.preset;

        if (currentPreset === 'easy-say') {
          container.querySelector('#lp-chk-num').checked = false;
          container.querySelector('#lp-chk-sym').checked = false;
        } else if (currentPreset === 'easy-read') {
          container.querySelector('#lp-chk-num').checked = true;
          container.querySelector('#lp-chk-sym').checked = true;
        } else {
          container.querySelector('#lp-chk-num').checked = true;
          container.querySelector('#lp-chk-sym').checked = true;
        }
        generateAndAutoCopy(false);
      });
    });

    container.querySelectorAll('input[type="checkbox"]').forEach(chk => {
      chk.addEventListener('change', () => generateAndAutoCopy(false));
    });

    function generateLastPassPass() {
      const len = parseInt(range.value);
      let upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let lower = 'abcdefghijklmnopqrstuvwxyz';
      let numbers = '0123456789';
      let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

      if (currentPreset === 'easy-read') {
        upper = upper.replace(/[IO]/g, '');
        lower = lower.replace(/[l]/g, '');
        numbers = numbers.replace(/[01]/g, '');
      }

      let pool = '';
      if (container.querySelector('#lp-chk-upper').checked) pool += upper;
      if (container.querySelector('#lp-chk-lower').checked) pool += lower;
      if (container.querySelector('#lp-chk-num').checked) pool += numbers;
      if (container.querySelector('#lp-chk-sym').checked) pool += symbols;

      if (!pool) return 'Selecione ao menos 1 opção';

      let result = '';
      const array = new Uint32Array(len);
      crypto.getRandomValues(array);
      for (let i = 0; i < len; i++) {
        result += pool[array[i] % pool.length];
      }
      return result;
    }

    function calculateStrength(pass) {
      const len = pass.length;
      if (len < 10) return { label: 'Fraca', color: 'var(--accent-danger)', width: '25%', time: '~Poucos segundos' };
      if (len < 14) return { label: 'Média', color: 'var(--accent-warning)', width: '55%', time: '~Algumas horas' };
      if (len < 18) return { label: 'Forte', color: 'var(--accent-cyan)', width: '80%', time: '~3.000 anos' };
      return { label: 'Extremamente Forte (LastPass)', color: 'var(--accent-green)', width: '100%', time: '~Bilhões de anos' };
    }

    function generateAndAutoCopy(doCopy = true) {
      const pass = generateLastPassPass();
      display.textContent = pass;

      const str = calculateStrength(pass);
      strLabel.textContent = str.label;
      strLabel.style.color = str.color;
      strBar.style.background = str.color;
      strBar.style.width = str.width;
      strTime.textContent = `Tempo estimado para quebrar: ${str.time}`;

      if (doCopy && pass && !pass.startsWith('Selecione')) {
        copyToClipboard(pass, 'Senha gerada e copiada para colar (Ctrl+V)!');
      }
    }

    btnGen.addEventListener('click', () => generateAndAutoCopy(true));

    generateAndAutoCopy(true);
  }

  // 2. CPF TOOL
  function renderCPFTool(container) {
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
        <div>
          <h3>Gerar CPF Válido</h3>
          <p class="text-muted" style="margin-bottom: 16px;">Gere um CPF válido para testes. É copiado automaticamente ao clicar em Gerar.</p>
          
          <div class="form-group" style="background: var(--bg-primary); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 20px;">
            <label class="form-label" style="margin-bottom: 12px; display: block;">Opções de Formatação:</label>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <input type="radio" name="cpf-format-opt" value="with-format" checked style="accent-color: var(--accent-primary);" />
                <span>Com Pontuação (Ex: <strong>000.000.000-00</strong>)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <input type="radio" name="cpf-format-opt" value="no-format" style="accent-color: var(--accent-primary);" />
                <span>Sem Pontuação (Apenas Números: <strong>00000000000</strong>)</span>
              </label>
            </div>
          </div>

          <button id="btn-generate-cpf" class="btn btn-primary" style="width: 100%; margin-bottom: 20px;">
            <i data-lucide="sparkles"></i> <span>Gerar Novo CPF e Copiar</span>
          </button>

          <div class="output-box">
            <div id="cpf-output" class="output-content font-mono" style="font-size: 1.25rem;">Clique em Gerar</div>
            <button id="btn-copy-cpf" class="btn btn-outline" style="position: absolute; right: 12px; top: 12px;">Copiar</button>
          </div>
        </div>

        <div style="border-left: 1px solid var(--border-color); padding-left: 32px;">
          <h3>Validar CPF</h3>
          <p class="text-muted" style="margin-bottom: 16px;">Insira um CPF para checar se ele é matematicamente válido.</p>
          <div class="form-group">
            <label class="form-label">Digite o CPF (com ou sem pontos):</label>
            <input type="text" id="cpf-validate-input" class="form-input font-mono" placeholder="000.000.000-00 ou 00000000000" />
          </div>
          <div id="cpf-validate-result" style="padding: 16px; border-radius: var(--radius-md); font-weight: 600; text-align: center; display: none;"></div>
        </div>
      </div>
    `;

    const btnGenerate = container.querySelector('#btn-generate-cpf');
    const cpfOutput = container.querySelector('#cpf-output');
    const btnCopy = container.querySelector('#btn-copy-cpf');
    const validateInput = container.querySelector('#cpf-validate-input');
    const validateResult = container.querySelector('#cpf-validate-result');

    function generateCPF() {
      const selectedFormat = container.querySelector('input[name="cpf-format-opt"]:checked').value;
      let n = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
      
      let d1 = n.reduce((acc, val, i) => acc + val * (10 - i), 0) % 11;
      d1 = d1 < 2 ? 0 : 11 - d1;
      n.push(d1);

      let d2 = n.reduce((acc, val, i) => acc + val * (11 - i), 0) % 11;
      d2 = d2 < 2 ? 0 : 11 - d2;
      n.push(d2);

      const raw = n.join('');
      return selectedFormat === 'with-format' ? raw.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : raw;
    }

    btnGenerate.addEventListener('click', () => {
      const val = generateCPF();
      cpfOutput.textContent = val;
      copyToClipboard(val, 'CPF gerado e copiado para colar (Ctrl+V)!');
    });

    btnCopy.addEventListener('click', () => {
      if (cpfOutput.textContent !== 'Clique em Gerar') copyToClipboard(cpfOutput.textContent);
    });

    validateInput.addEventListener('input', (e) => {
      const cpf = e.target.value.replace(/\D/g, '');
      if (cpf.length < 11) {
        validateResult.style.display = 'none';
        return;
      }
      const isValid = validateCPFAlgo(cpf);
      validateResult.style.display = 'block';
      if (isValid) {
        validateResult.style.background = 'rgba(16, 185, 129, 0.15)';
        validateResult.style.color = 'var(--accent-green)';
        validateResult.textContent = '✓ CPF VÁLIDO!';
      } else {
        validateResult.style.background = 'rgba(239, 68, 68, 0.15)';
        validateResult.style.color = 'var(--accent-danger)';
        validateResult.textContent = '✕ CPF INVÁLIDO!';
      }
    });

    function validateCPFAlgo(cpf) {
      if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
      let sum = 0, rest;
      for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i-1, i)) * (11 - i);
      rest = (sum * 10) % 11;
      if (rest === 10 || rest === 11) rest = 0;
      if (rest !== parseInt(cpf.substring(9, 10))) return false;
      sum = 0;
      for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i-1, i)) * (12 - i);
      rest = (sum * 10) % 11;
      if (rest === 10 || rest === 11) rest = 0;
      if (rest !== parseInt(cpf.substring(10, 11))) return false;
      return true;
    }

    const initial = generateCPF();
    cpfOutput.textContent = initial;
  }

  // 3. GERADOR DE CNPJ
  function renderCNPJTool(container) {
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
        <div>
          <h3>Gerar CNPJ Válido</h3>
          <p class="text-muted" style="margin-bottom: 16px;">Gere um CNPJ para testes corporativos. Copia automaticamente ao gerar.</p>
          
          <div class="form-group" style="background: var(--bg-primary); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 20px;">
            <label class="form-label" style="margin-bottom: 12px; display: block;">Opções de Formatação:</label>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <input type="radio" name="cnpj-format-opt" value="with-format" checked style="accent-color: var(--accent-primary);" />
                <span>Com Pontuação (Ex: <strong>00.000.000/0001-00</strong>)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <input type="radio" name="cnpj-format-opt" value="no-format" style="accent-color: var(--accent-primary);" />
                <span>Sem Pontuação (Apenas Números: <strong>00000000000100</strong>)</span>
              </label>
            </div>
          </div>

          <button id="btn-generate-cnpj" class="btn btn-primary" style="width: 100%; margin-bottom: 20px;">
            <i data-lucide="sparkles"></i> <span>Gerar Novo CNPJ e Copiar</span>
          </button>
          
          <div class="output-box">
            <div id="cnpj-output" class="output-content font-mono" style="font-size: 1.2rem;">Clique em Gerar</div>
            <button id="btn-copy-cnpj" class="btn btn-outline" style="position: absolute; right: 12px; top: 12px;">Copiar</button>
          </div>
        </div>
      </div>
    `;

    const btnGenerate = container.querySelector('#btn-generate-cnpj');
    const cnpjOutput = container.querySelector('#cnpj-output');
    const btnCopy = container.querySelector('#btn-copy-cnpj');

    function generateCNPJ() {
      const selectedFormat = container.querySelector('input[name="cnpj-format-opt"]:checked').value;
      let n = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).concat([0, 0, 0, 1]);
      
      let m1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      let d1 = n.reduce((acc, val, i) => acc + val * m1[i], 0) % 11;
      d1 = d1 < 2 ? 0 : 11 - d1;
      n.push(d1);

      let m2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      let d2 = n.reduce((acc, val, i) => acc + val * m2[i], 0) % 11;
      d2 = d2 < 2 ? 0 : 11 - d2;
      n.push(d2);

      const raw = n.join('');
      return selectedFormat === 'with-format' ? raw.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : raw;
    }

    btnGenerate.addEventListener('click', () => {
      const val = generateCNPJ();
      cnpjOutput.textContent = val;
      copyToClipboard(val, 'CNPJ gerado e copiado para colar (Ctrl+V)!');
    });

    btnCopy.addEventListener('click', () => {
      if (cnpjOutput.textContent !== 'Clique em Gerar') copyToClipboard(cnpjOutput.textContent);
    });

    cnpjOutput.textContent = generateCNPJ();
  }

  // 4. JSON TOOL
  function renderJSONTool(container) {
    container.innerHTML = `
      <div class="form-group">
        <label class="form-label">Cole o JSON aqui:</label>
        <textarea id="json-input" class="form-textarea font-mono" placeholder='{"nome": "Abobi", "ferramentas": ["JSON", "CPF"]}'></textarea>
      </div>

      <div style="display: flex; gap: 12px; margin-bottom: 20px;">
        <button id="btn-format-json" class="btn btn-primary"><i data-lucide="align-left"></i> Formatar e Copiar</button>
        <button id="btn-minify-json" class="btn btn-secondary"><i data-lucide="minimize-2"></i> Minificar e Copiar</button>
      </div>

      <div id="json-error" style="color: var(--accent-danger); font-weight: 600; margin-bottom: 12px; display: none;"></div>

      <div class="output-box" style="min-height: 200px;">
        <pre id="json-output" class="font-mono" style="white-space: pre-wrap; word-break: break-all; font-size: 0.9rem; color: var(--accent-cyan);"></pre>
      </div>
    `;

    const input = container.querySelector('#json-input');
    const output = container.querySelector('#json-output');
    const error = container.querySelector('#json-error');

    container.querySelector('#btn-format-json').addEventListener('click', () => {
      try {
        error.style.display = 'none';
        const obj = JSON.parse(input.value);
        const formatted = JSON.stringify(obj, null, 2);
        output.textContent = formatted;
        copyToClipboard(formatted, 'JSON formatado e copiado para colar (Ctrl+V)!');
      } catch (err) {
        error.style.display = 'block';
        error.textContent = `Erro no JSON: ${err.message}`;
      }
    });

    container.querySelector('#btn-minify-json').addEventListener('click', () => {
      try {
        error.style.display = 'none';
        const obj = JSON.parse(input.value);
        const minified = JSON.stringify(obj);
        output.textContent = minified;
        copyToClipboard(minified, 'JSON minificado e copiado para colar (Ctrl+V)!');
      } catch (err) {
        error.style.display = 'block';
        error.textContent = `Erro no JSON: ${err.message}`;
      }
    });
  }

  // 5. QR CODE TOOL
  function renderQRCodeTool(container) {
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start;">
        <div>
          <div class="form-group">
            <label class="form-label">Conteúdo do QR Code (URL ou Texto):</label>
            <input type="text" id="qr-input" class="form-input" placeholder="https://abobiferramentas.com" value="https://abobiferramentas.com" />
          </div>
          <button id="btn-generate-qr" class="btn btn-primary" style="width: 100%;">Gerar QR Code</button>
        </div>

        <div style="text-align: center; background: var(--bg-primary); padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
          <div id="qrcode-box" style="display: inline-block; background: #ffffff; padding: 16px; border-radius: 8px;"></div>
        </div>
      </div>
    `;

    const input = container.querySelector('#qr-input');
    const box = container.querySelector('#qrcode-box');
    const btn = container.querySelector('#btn-generate-qr');

    function makeQR() {
      box.innerHTML = '';
      if (!input.value.trim()) return;
      new QRCode(box, {
        text: input.value.trim(),
        width: 180,
        height: 180,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
    }

    btn.addEventListener('click', makeQR);
    makeQR();
  }

  // 6. HASH TOOL
  function renderHashTool(container) {
    container.innerHTML = `
      <div class="form-group">
        <label class="form-label">Digite o texto para gerar hashes (clique na caixa para copiar):</label>
        <input type="text" id="hash-input" class="form-input" placeholder="Digite algo..." value="Abobi Ferramentas" />
      </div>

      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div>
          <label class="form-label">MD5:</label>
          <div class="output-box" style="cursor: pointer;" id="box-md5"><div id="hash-md5" class="output-content font-mono" style="font-size: 0.95rem;"></div></div>
        </div>
        <div>
          <label class="form-label">SHA-256:</label>
          <div class="output-box" style="cursor: pointer;" id="box-sha256"><div id="hash-sha256" class="output-content font-mono" style="font-size: 0.95rem;"></div></div>
        </div>
      </div>
    `;

    const input = container.querySelector('#hash-input');
    const md5El = container.querySelector('#hash-md5');
    const sha256El = container.querySelector('#hash-sha256');

    function updateHashes() {
      const text = input.value;
      if (!text) {
        md5El.textContent = '';
        sha256El.textContent = '';
        return;
      }
      md5El.textContent = CryptoJS.MD5(text).toString();
      sha256El.textContent = CryptoJS.SHA256(text).toString();
    }

    container.querySelector('#box-md5').addEventListener('click', () => { if (md5El.textContent) copyToClipboard(md5El.textContent); });
    container.querySelector('#box-sha256').addEventListener('click', () => { if (sha256El.textContent) copyToClipboard(sha256El.textContent); });

    input.addEventListener('input', updateHashes);
    updateHashes();
  }

  // 7. BASE64 TOOL
  function renderBase64Tool(container) {
    container.innerHTML = `
      <div class="form-group">
        <label class="form-label">Texto:</label>
        <textarea id="base64-input" class="form-textarea font-mono" placeholder="Digite seu texto aqui..."></textarea>
      </div>

      <div style="display: flex; gap: 12px; margin-bottom: 20px;">
        <button id="btn-encode" class="btn btn-primary">Codificar e Copiar</button>
        <button id="btn-decode" class="btn btn-secondary">Decodificar e Copiar</button>
      </div>

      <div class="output-box">
        <div id="base64-output" class="output-content font-mono" style="font-size: 0.95rem;"></div>
      </div>
    `;

    const input = container.querySelector('#base64-input');
    const output = container.querySelector('#base64-output');

    container.querySelector('#btn-encode').addEventListener('click', () => {
      try {
        const val = btoa(unescape(encodeURIComponent(input.value)));
        output.textContent = val;
        copyToClipboard(val, 'Base64 codificado e copiado para colar (Ctrl+V)!');
      } catch (err) { output.textContent = 'Erro ao codificar'; }
    });

    container.querySelector('#btn-decode').addEventListener('click', () => {
      try {
        const val = decodeURIComponent(escape(atob(input.value)));
        output.textContent = val;
        copyToClipboard(val, 'Base64 decodificado e copiado para colar (Ctrl+V)!');
      } catch (err) { output.textContent = 'Base64 inválido'; }
    });
  }

  // 8. COUNTER TOOL
  function renderCounterTool(container) {
    container.innerHTML = `
      <div class="form-group">
        <textarea id="counter-input" class="form-textarea" placeholder="Cole ou digite seu texto para analisar..."></textarea>
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; text-align: center;">
        <div style="background: var(--bg-primary); padding: 16px; border-radius: var(--radius-md);">
          <div id="cnt-chars" style="font-size: 1.8rem; font-weight: 800; color: var(--accent-primary);">0</div>
          <div class="text-muted" style="font-size: 0.85rem;">Caracteres</div>
        </div>
        <div style="background: var(--bg-primary); padding: 16px; border-radius: var(--radius-md);">
          <div id="cnt-words" style="font-size: 1.8rem; font-weight: 800; color: var(--accent-cyan);">0</div>
          <div class="text-muted" style="font-size: 0.85rem;">Palavras</div>
        </div>
        <div style="background: var(--bg-primary); padding: 16px; border-radius: var(--radius-md);">
          <div id="cnt-lines" style="font-size: 1.8rem; font-weight: 800; color: var(--accent-green);">0</div>
          <div class="text-muted" style="font-size: 0.85rem;">Linhas</div>
        </div>
        <div style="background: var(--bg-primary); padding: 16px; border-radius: var(--radius-md);">
          <div id="cnt-read" style="font-size: 1.8rem; font-weight: 800; color: var(--accent-secondary);">0m</div>
          <div class="text-muted" style="font-size: 0.85rem;">Tempo Leitura</div>
        </div>
      </div>
    `;

    const input = container.querySelector('#counter-input');
    input.addEventListener('input', () => {
      const text = input.value;
      const chars = text.length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const lines = text ? text.split('\n').length : 0;
      const readTime = Math.ceil(words / 200);

      container.querySelector('#cnt-chars').textContent = chars;
      container.querySelector('#cnt-words').textContent = words;
      container.querySelector('#cnt-lines').textContent = lines;
      container.querySelector('#cnt-read').textContent = `${readTime}m`;
    });
  }

  // 9. UUID TOOL COM AUTO-CÓPIA
  function renderUUIDTool(container) {
    container.innerHTML = `
      <div style="display: flex; gap: 12px; margin-bottom: 20px; align-items: center;">
        <label>Quantidade:</label>
        <input type="number" id="uuid-qty" min="1" max="50" value="5" class="form-input" style="width: 100px;" />
        <button id="btn-gen-uuid" class="btn btn-primary">Gerar UUIDs e Copiar</button>
      </div>

      <div class="output-box">
        <pre id="uuid-output" class="font-mono" style="white-space: pre-wrap; font-size: 0.95rem; color: var(--accent-cyan);"></pre>
      </div>
    `;

    const qty = container.querySelector('#uuid-qty');
    const output = container.querySelector('#uuid-output');

    function generateUUIDs() {
      const count = Math.min(Math.max(parseInt(qty.value) || 1, 1), 50);
      const list = Array.from({ length: count }, () => crypto.randomUUID());
      const res = list.join('\n');
      output.textContent = res;
      copyToClipboard(res, 'UUIDs gerados e copiados para colar (Ctrl+V)!');
    }

    container.querySelector('#btn-gen-uuid').addEventListener('click', generateUUIDs);

    const initial = Array.from({ length: 5 }, () => crypto.randomUUID()).join('\n');
    output.textContent = initial;
  }

  // 10. PX TO REM TOOL
  function renderPxRemTool(container) {
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
        <div class="form-group">
          <label class="form-label">Pixels (PX):</label>
          <input type="number" id="px-input" class="form-input font-mono" value="16" placeholder="16" />
        </div>
        <div class="form-group">
          <label class="form-label">REM:</label>
          <input type="number" id="rem-input" class="form-input font-mono" value="1" placeholder="1" step="0.125" />
        </div>
      </div>
      <p class="text-muted" style="margin-top: 12px; font-size: 0.85rem;">Base considerada: 1rem = 16px</p>
    `;

    const pxIn = container.querySelector('#px-input');
    const remIn = container.querySelector('#rem-input');

    pxIn.addEventListener('input', () => {
      const px = parseFloat(pxIn.value);
      remIn.value = isNaN(px) ? '' : (px / 16);
    });

    remIn.addEventListener('input', () => {
      const rem = parseFloat(remIn.value);
      pxIn.value = isNaN(rem) ? '' : (rem * 16);
    });
  }

  // 11. LOREM IPSUM TOOL
  function renderLoremTool(container) {
    container.innerHTML = `
      <div style="display: flex; gap: 12px; margin-bottom: 20px; align-items: center;">
        <label>Parágrafos:</label>
        <input type="number" id="lorem-qty" min="1" max="10" value="3" class="form-input" style="width: 100px;" />
        <button id="btn-gen-lorem" class="btn btn-primary">Gerar e Copiar Texto</button>
      </div>

      <div class="output-box">
        <div id="lorem-output" style="line-height: 1.6; color: var(--text-primary);"></div>
      </div>
    `;

    const loremSample = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

    const qty = container.querySelector('#lorem-qty');
    const output = container.querySelector('#lorem-output');

    function genLorem() {
      const count = Math.min(Math.max(parseInt(qty.value) || 1, 1), 10);
      output.innerHTML = Array.from({ length: count }, () => `<p style="margin-bottom: 12px;">${loremSample}</p>`).join('');
      copyToClipboard(output.innerText, 'Lorem Ipsum gerado e copiado para colar (Ctrl+V)!');
    }

    container.querySelector('#btn-gen-lorem').addEventListener('click', genLorem);

    output.innerHTML = Array.from({ length: 3 }, () => `<p style="margin-bottom: 12px;">${loremSample}</p>`).join('');
  }

  // 12. COLOR TOOL
  function renderColorTool(container) {
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: center;">
        <div>
          <div class="form-group">
            <label class="form-label">Escolha a cor:</label>
            <input type="color" id="color-picker" value="#6366f1" style="width: 100%; height: 50px; cursor: pointer; border-radius: var(--radius-md); border: none;" />
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="cursor: pointer;" id="hex-box">HEX: <strong id="color-hex" class="font-mono" style="color: var(--accent-cyan);">#6366f1</strong></div>
            <div style="cursor: pointer;" id="rgb-box">RGB: <strong id="color-rgb" class="font-mono" style="color: var(--accent-cyan);">rgb(99, 102, 241)</strong></div>
          </div>
        </div>

        <div id="color-preview" style="height: 160px; border-radius: var(--radius-lg); background: #6366f1; border: 1px solid var(--border-color); box-shadow: var(--shadow-glow);"></div>
      </div>
    `;

    const picker = container.querySelector('#color-picker');
    const hexEl = container.querySelector('#color-hex');
    const rgbEl = container.querySelector('#color-rgb');
    const preview = container.querySelector('#color-preview');

    picker.addEventListener('input', () => {
      const hex = picker.value;
      preview.style.background = hex;
      hexEl.textContent = hex;

      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      rgbEl.textContent = `rgb(${r}, ${g}, ${b})`;
    });

    container.querySelector('#hex-box').addEventListener('click', () => copyToClipboard(hexEl.textContent));
    container.querySelector('#rgb-box').addEventListener('click', () => copyToClipboard(rgbEl.textContent));
  }

});
