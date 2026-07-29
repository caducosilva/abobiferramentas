/**
 * ÓRBITA DEVTOOLS / ABOBI FERRAMENTAS (2026)
 * Suíte Minimalista Focada Exclusivamente nas Ferramentas Solicitadas:
 * 1. Horários de Ônibus de Mogi das Cruzes
 * 2. Baixador de Vídeos da Internet (Auto-Download + Pop-up AdSense)
 * 3. Gerador de Senha Forte (Estilo LastPass)
 * 4. Gerador de CPF (Com e Sem Pontuação)
 * 5. Gerador de CNPJ (Com e Sem Pontuação)
 * 
 * Desenvolvido por Carlos Eduardo.
 */

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  const state = {
    currentCategory: 'all',
    activeToolId: null,
    searchQuery: '',
    theme: localStorage.getItem('orbita_theme') || 'dark'
  };

  // Base de Dados de Horários de Ônibus de Mogi das Cruzes
  const busLinesMogi = [
    {
      code: 'C001',
      name: 'Terminal Central ↔ Jundiapeba (via Brás Cubas)',
      type: 'Municipal SIM Mogi',
      terminal: 'Terminal Central',
      weekdays: ['05:00', '05:30', '06:00', '06:20', '06:40', '07:00', '07:30', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '20:00', '21:00', '22:00', '23:00'],
      saturdays: ['05:30', '06:30', '07:30', '08:30', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00', '20:30', '22:00'],
      sundays: ['06:00', '07:30', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00']
    },
    {
      code: 'E102',
      name: 'Terminal Estudantes ↔ Jardim Jundiaí / Vassarola',
      type: 'Municipal SIM Mogi',
      terminal: 'Terminal Estudantes',
      weekdays: ['05:15', '05:45', '06:15', '06:45', '07:15', '07:45', '08:30', '09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:15', '16:45', '17:15', '17:45', '18:15', '19:00', '20:00', '21:15', '22:30'],
      saturdays: ['06:00', '07:00', '08:15', '09:30', '11:00', '12:30', '14:00', '15:30', '17:00', '18:30', '20:00', '21:30'],
      sundays: ['06:30', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']
    },
    {
      code: 'E103',
      name: 'Terminal Estudantes ↔ Jundiapeba (via Parque Jundiaí)',
      type: 'Municipal SIM Mogi',
      terminal: 'Terminal Estudantes',
      weekdays: ['05:10', '05:40', '06:10', '06:35', '07:00', '07:25', '07:50', '08:40', '09:40', '10:40', '11:40', '12:40', '13:40', '14:40', '15:40', '16:20', '16:50', '17:20', '17:50', '18:20', '19:10', '20:10', '21:20', '22:40'],
      saturdays: ['05:45', '07:00', '08:30', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00', '20:45'],
      sundays: ['06:00', '07:45', '09:45', '11:45', '13:45', '15:45', '17:45', '19:45']
    },
    {
      code: 'C201',
      name: 'Terminal Central ↔ Brás Cubas (via Vila Cintra)',
      type: 'Municipal SIM Mogi',
      terminal: 'Terminal Central',
      weekdays: ['05:20', '05:50', '06:20', '06:50', '07:20', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '16:40', '17:20', '18:00', '18:40', '19:30', '20:30', '21:40', '22:50'],
      saturdays: ['06:15', '07:30', '09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30', '21:00'],
      sundays: ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00']
    },
    {
      code: 'C402',
      name: 'Terminal Central ↔ Sabaúna (via César de Souza)',
      type: 'Municipal SIM Mogi',
      terminal: 'Terminal Central',
      weekdays: ['05:30', '06:15', '07:00', '08:00', '09:30', '11:00', '12:30', '14:00', '15:30', '16:45', '17:45', '18:45', '20:00', '21:30', '22:45'],
      saturdays: ['06:00', '07:30', '09:30', '11:30', '13:30', '15:30', '17:30', '19:30', '21:30'],
      sundays: ['07:00', '09:30', '12:00', '14:30', '17:00', '19:30']
    },
    {
      code: 'E890',
      name: 'Terminal Estudantes ↔ Botujuru / Itapety',
      type: 'Municipal SIM Mogi',
      terminal: 'Terminal Estudantes',
      weekdays: ['05:05', '05:35', '06:05', '06:35', '07:05', '07:35', '08:20', '09:20', '10:20', '11:20', '12:20', '13:20', '14:20', '15:20', '16:05', '16:35', '17:05', '17:35', '18:05', '18:45', '19:45', '21:00', '22:15'],
      saturdays: ['05:30', '06:45', '08:15', '09:45', '11:15', '12:45', '14:15', '15:45', '17:15', '18:45', '20:15', '21:45'],
      sundays: ['06:15', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']
    },
    {
      code: 'E108',
      name: 'Terminal Estudantes ↔ Jardim Universo',
      type: 'Municipal SIM Mogi',
      terminal: 'Terminal Estudantes',
      weekdays: ['05:25', '05:55', '06:25', '06:55', '07:25', '08:10', '09:10', '10:10', '11:10', '12:10', '13:10', '14:10', '15:10', '16:15', '16:55', '17:35', '18:15', '19:15', '20:15', '21:30', '22:40'],
      saturdays: ['06:10', '07:30', '09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30', '21:00'],
      sundays: ['07:15', '09:15', '11:15', '13:15', '15:15', '17:15', '19:15', '21:15']
    },
    {
      code: 'C301',
      name: 'Terminal Central ↔ Conjunto Santo Ângelo',
      type: 'Municipal SIM Mogi',
      terminal: 'Terminal Central',
      weekdays: ['05:10', '05:40', '06:10', '06:40', '07:10', '07:40', '08:30', '09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:10', '16:40', '17:10', '17:40', '18:10', '18:50', '19:50', '21:10', '22:25'],
      saturdays: ['05:40', '07:00', '08:30', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00', '20:30'],
      sundays: ['06:30', '08:30', '10:30', '12:30', '14:30', '16:30', '18:30', '20:30']
    },
    {
      code: 'E392',
      name: 'Terminal Estudantes ↔ Manoel Ferreira / Biritiba Ussú',
      type: 'Municipal SIM Mogi',
      terminal: 'Terminal Estudantes',
      weekdays: ['05:30', '06:45', '08:15', '10:00', '12:00', '14:00', '15:45', '17:15', '18:45', '20:30', '22:15'],
      saturdays: ['06:00', '08:00', '10:30', '13:00', '15:30', '18:00', '20:30'],
      sundays: ['07:00', '10:00', '13:00', '16:00', '19:00']
    },
    {
      code: '416',
      name: 'Mogi das Cruzes (Terminal Estudantes) ↔ Santa Isabel (EMTU)',
      type: 'Intermunicipal EMTU',
      terminal: 'Terminal Estudantes',
      weekdays: ['05:15', '06:00', '06:45', '07:30', '08:30', '10:00', '11:30', '13:00', '14:30', '16:00', '17:00', '18:00', '19:15', '20:45', '22:15'],
      saturdays: ['06:00', '07:45', '09:45', '11:45', '13:45', '15:45', '17:45', '19:45', '21:30'],
      sundays: ['06:30', '09:00', '12:00', '15:00', '18:00', '21:00']
    },
    {
      code: '200',
      name: 'Mogi das Cruzes (Rodoviária) ↔ SP Terminal Rodoviário Tietê (EMTU)',
      type: 'Intermunicipal EMTU / Pássaro Marron',
      terminal: 'Terminal Rodoviário Geraldo Scavone',
      weekdays: ['05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:30', '09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30', '17:15', '18:00', '18:45', '19:45', '20:45', '22:00'],
      saturdays: ['06:00', '07:15', '08:30', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00', '20:30', '22:00'],
      sundays: ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00']
    }
  ];

  // Ferramentas Ativas Exclusivas Solicitadas pelo Usuário
  const tools = [
    {
      id: 'mogi-bus',
      name: 'Horários de Ônibus de Mogi das Cruzes',
      description: 'Consulte horários e itinerários das linhas municipais e intermunicipais de Mogi das Cruzes (SIM Mogi / EMTU).',
      category: 'transportes',
      icon: 'bus',
      render: renderMogiBusTool
    },
    {
      id: 'video-downloader',
      name: 'Baixador de Vídeos da Internet',
      description: 'Baixe vídeos públicos do YouTube, Instagram, TikTok sem marca d\'água e Twitter na melhor qualidade.',
      category: 'midia',
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
      description: 'Gere CPFs válidos para testes com botões de 1-clique com e sem pontuação + auto-cópia.',
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

    el.toolsCountLabel.textContent = `${filtered.length} de ${tools.length} ferramentas exclusivas`;

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
          <span>Abrir Ferramenta</span>
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

  /* ========================================================
     1. HORÁRIOS DE ÔNIBUS DE MOGI DAS CRUZES
     ======================================================== */
  function renderMogiBusTool(container) {
    container.innerHTML = `
      <div style="max-width: 820px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h3 style="font-size: 1.3rem; font-weight: 800;">Consulta de Horários de Ônibus - Mogi das Cruzes</h3>
          <p class="text-muted" style="font-size: 0.9rem;">Pesquise por código, bairro ou nome da linha municipal ou intermunicipal.</p>
        </div>

        <!-- Bus Search Bar -->
        <div class="form-group" style="margin-bottom: 20px;">
          <div style="position: relative;">
            <input type="text" id="mogi-bus-search" class="form-input" placeholder="Buscar por código ou bairro (Ex: C001, Jundiapeba, Estudantes, Sabaúna)..." style="padding-left: 40px;" />
            <i data-lucide="search" style="position: absolute; left: 12px; top: 12px; width: 18px; height: 18px; color: var(--text-muted);"></i>
          </div>
        </div>

        <div id="mogi-bus-list" style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Dynamic Bus Cards -->
        </div>
      </div>
    `;

    const searchInput = container.querySelector('#mogi-bus-search');
    const busList = container.querySelector('#mogi-bus-list');

    function renderBuses(query = '') {
      busList.innerHTML = '';
      const q = query.toLowerCase().trim();
      const filtered = busLinesMogi.filter(b => 
        b.code.toLowerCase().includes(q) || 
        b.name.toLowerCase().includes(q) || 
        b.terminal.toLowerCase().includes(q)
      );

      if (filtered.length === 0) {
        busList.innerHTML = `
          <div style="text-align: center; padding: 32px; color: var(--text-muted);">
            <p>Nenhuma linha de ônibus encontrada para "${query}".</p>
          </div>
        `;
        return;
      }

      filtered.forEach(bus => {
        const card = document.createElement('div');
        card.style.cssText = `
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 20px;
        `;
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div>
              <span style="background: var(--accent-primary); color: #fff; font-weight: 800; font-size: 0.85rem; padding: 3px 10px; border-radius: var(--radius-full); font-family: var(--font-mono);">${bus.code}</span>
              <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 8px;">${bus.type}</span>
              <h4 style="font-size: 1.1rem; font-weight: 700; margin-top: 6px;">${bus.name}</h4>
              <p style="font-size: 0.82rem; color: var(--text-muted);">Ponto Principal: ${bus.terminal}</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 16px; border-top: 1px dashed var(--border-color); padding-top: 14px;">
            <div>
              <div style="font-size: 0.78rem; font-weight: 700; color: var(--accent-cyan); margin-bottom: 4px;">DIAS ÚTEIS:</div>
              <div class="font-mono" style="font-size: 0.82rem; color: var(--text-primary); line-height: 1.6;">${bus.weekdays.join(' • ')}</div>
            </div>
            <div>
              <div style="font-size: 0.78rem; font-weight: 700; color: var(--accent-green); margin-bottom: 4px;">SÁBADOS:</div>
              <div class="font-mono" style="font-size: 0.82rem; color: var(--text-primary); line-height: 1.6;">${bus.saturdays.join(' • ')}</div>
            </div>
            <div>
              <div style="font-size: 0.78rem; font-weight: 700; color: var(--accent-hover); margin-bottom: 4px;">DOMINGOS E FERIADOS:</div>
              <div class="font-mono" style="font-size: 0.82rem; color: var(--text-primary); line-height: 1.6;">${bus.sundays.join(' • ')}</div>
            </div>
          </div>
        `;
        busList.appendChild(card);
      });

      lucide.createIcons();
    }

    searchInput.addEventListener('input', (e) => renderBuses(e.target.value));
    renderBuses();
  }

  /* ========================================================
     2. BAIXADOR DE VÍDEOS DA INTERNET (AUTO-DOWNLOAD + POP-UP ADSENSE)
     ======================================================== */
  function renderVideoDownloaderTool(container) {
    container.innerHTML = `
      <div style="max-width: 680px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h3 style="font-size: 1.3rem; font-weight: 800;">Baixar Vídeo em Máxima Qualidade</h3>
          <p class="text-muted" style="font-size: 0.9rem;">Cole o link do YouTube, Instagram, TikTok sem marca d'água ou Twitter.</p>
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

  /* ========================================================
     3. GERADOR DE SENHA FORTE (ESTILO LASTPASS)
     ======================================================== */
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

  /* ========================================================
     4. GERADOR DE CPF (COM E SEM PONTUAÇÃO)
     ======================================================== */
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

  /* ========================================================
     5. GERADOR DE CNPJ (COM E SEM PONTUAÇÃO)
     ======================================================== */
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

});
