/**
 * ABOBI FERRAMENTAS - CORE APPLICATION LOGIC (2026)
 * Suíte completa de ferramentas web 100% locais e privadas.
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
      id: 'cpf',
      name: 'Gerador e Validador de CPF',
      description: 'Gere CPFs válidos com ou sem pontuação para testes, e valide números existentes.',
      category: 'documentos',
      icon: 'file-check',
      render: renderCPFTool
    },
    {
      id: 'cnpj',
      name: 'Gerador e Validador de CNPJ',
      description: 'Gere CNPJs válidos com ou sem pontuação para testes empresariais.',
      category: 'documentos',
      icon: 'building-2',
      render: renderCNPJTool
    },
    {
      id: 'json',
      name: 'Formatador e Validador JSON',
      description: 'Formatador, minificador e validador de sintaxe JSON com suporte a cópia.',
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
      id: 'password',
      name: 'Gerador de Senhas Seguras',
      description: 'Crie senhas fortes e aleatórias com controle de tamanho, caracteres e símbolos.',
      category: 'seguranca',
      icon: 'shield-check',
      render: renderPasswordTool
    },
    {
      id: 'hash',
      name: 'Gerador de Hashes (MD5 / SHA-256)',
      description: 'Gere hashes MD5, SHA-1, SHA-256 e SHA-512 a partir de qualquer texto.',
      category: 'seguranca',
      icon: 'key-round',
      render: renderHashTool
    },
    {
      id: 'base64',
      name: 'Codificador / Decodificador Base64',
      description: 'Codifique textos para Base64 ou decodifique sequências existentes.',
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
      description: 'Gere identificadores únicos universais (UUIDs v4) em lote.',
      category: 'dev',
      icon: 'fingerprint',
      render: renderUUIDTool
    },
    {
      id: 'px-rem',
      name: 'Conversor PX para REM',
      description: 'Converta pixels para unidades REM de forma rápida para CSS e Front-end.',
      category: 'dev',
      icon: 'ruler',
      render: renderPxRemTool
    },
    {
      id: 'lorem',
      name: 'Gerador de Lorem Ipsum',
      description: 'Gere textos fictícios em parágrafos ou frases para layouts.',
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
    countFavorites: document.getElementById('count-favorites')
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

  // Attach Event Listeners
  function attachEvents() {
    // Search Filter
    el.globalSearch.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      renderGrid();
    });

    // Category Sidebar Navigation
    el.navItems.forEach(item => {
      item.addEventListener('click', () => {
        el.navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        state.currentCategory = item.dataset.category;
        
        showGridView();
        renderGrid();
      });
    });

    // Back to Grid Button
    el.btnBackToGrid.addEventListener('click', showGridView);

    // Active Tool Favorite Toggle
    el.activeToolFavBtn.addEventListener('click', () => {
      if (!state.activeToolId) return;
      toggleFavorite(state.activeToolId);
      updateFavButtonState(state.activeToolId);
      updateCategoryCounts();
    });

    // Theme Toggle
    el.themeToggle.addEventListener('click', toggleTheme);
  }

  // Render Tools Grid
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
      documentos: 'Documentos & Geradores',
      design: 'Design & Mídia',
      seguranca: 'Segurança & Cripto',
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

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i data-lucide="check-circle" style="color: var(--accent-green);"></i>
      <span>${message}</span>
    `;
    el.toastContainer.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 250);
    }, 2500);
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copiado para a área de transferência!');
    }).catch(() => {
      showToast('Erro ao copiar');
    });
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
     INDIVIDUAL TOOL RENDER FUNCTIONS
     ======================================================== */

  // 1. GERADOR E VALIDADOR DE CPF (COM / SEM PONTUAÇÃO)
  function renderCPFTool(container) {
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
        <!-- Gerador -->
        <div>
          <h3>Gerar CPF Válido</h3>
          <p class="text-muted" style="margin-bottom: 16px;">Gere um CPF válido para testes com a opção de formato desejada.</p>
          
          <div class="form-group" style="background: var(--bg-primary); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 20px;">
            <label class="form-label" style="margin-bottom: 12px; display: block;">Opções de Formatacão:</label>
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

          <div style="display: flex; gap: 10px; margin-bottom: 20px;">
            <button id="btn-generate-cpf" class="btn btn-primary" style="flex: 1;">
              <i data-lucide="sparkles"></i> <span>Gerar Novo CPF</span>
            </button>
          </div>

          <div class="output-box">
            <div id="cpf-output" class="output-content font-mono" style="font-size: 1.25rem;">Clique em Gerar</div>
            <button id="btn-copy-cpf" class="btn btn-outline" style="position: absolute; right: 12px; top: 12px;">Copiar</button>
          </div>
        </div>

        <!-- Validador -->
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
      cpfOutput.textContent = generateCPF();
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

    // Auto Generate initial
    cpfOutput.textContent = generateCPF();
  }

  // 2. GERADOR E VALIDADOR DE CNPJ (COM / SEM PONTUAÇÃO)
  function renderCNPJTool(container) {
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
        <div>
          <h3>Gerar CNPJ Válido</h3>
          <p class="text-muted" style="margin-bottom: 16px;">Gere um CNPJ para testes corporativos.</p>
          
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
            <i data-lucide="sparkles"></i> <span>Gerar Novo CNPJ</span>
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
      cnpjOutput.textContent = generateCNPJ();
    });

    btnCopy.addEventListener('click', () => {
      if (cnpjOutput.textContent !== 'Clique em Gerar') copyToClipboard(cnpjOutput.textContent);
    });

    cnpjOutput.textContent = generateCNPJ();
  }

  // 3. JSON TOOL
  function renderJSONTool(container) {
    container.innerHTML = `
      <div class="form-group">
        <label class="form-label">Cole o JSON aqui:</label>
        <textarea id="json-input" class="form-textarea font-mono" placeholder='{"nome": "Abobi", "ferramentas": ["JSON", "CPF"]}'></textarea>
      </div>

      <div style="display: flex; gap: 12px; margin-bottom: 20px;">
        <button id="btn-format-json" class="btn btn-primary"><i data-lucide="align-left"></i> Formatar JSON</button>
        <button id="btn-minify-json" class="btn btn-secondary"><i data-lucide="minimize-2"></i> Minificar</button>
        <button id="btn-copy-json" class="btn btn-outline"><i data-lucide="copy"></i> Copiar Resultado</button>
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
        output.textContent = JSON.stringify(obj, null, 2);
      } catch (err) {
        error.style.display = 'block';
        error.textContent = `Erro no JSON: ${err.message}`;
      }
    });

    container.querySelector('#btn-minify-json').addEventListener('click', () => {
      try {
        error.style.display = 'none';
        const obj = JSON.parse(input.value);
        output.textContent = JSON.stringify(obj);
      } catch (err) {
        error.style.display = 'block';
        error.textContent = `Erro no JSON: ${err.message}`;
      }
    });

    container.querySelector('#btn-copy-json').addEventListener('click', () => {
      if (output.textContent) copyToClipboard(output.textContent);
    });
  }

  // 4. QR CODE TOOL
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

  // 5. PASSWORD TOOL
  function renderPasswordTool(container) {
    container.innerHTML = `
      <div>
        <div class="form-group">
          <label class="form-label">Tamanho da Senha: <span id="pass-len-val">16</span> caracteres</label>
          <input type="range" id="pass-len" min="8" max="64" value="16" style="width: 100%; accent-color: var(--accent-primary);" />
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
          <label><input type="checkbox" id="chk-upper" checked /> Letras Maiúsculas (A-Z)</label>
          <label><input type="checkbox" id="chk-lower" checked /> Letras Minúsculas (a-z)</label>
          <label><input type="checkbox" id="chk-num" checked /> Números (0-9)</label>
          <label><input type="checkbox" id="chk-sym" checked /> Símbolos (!@#$%^&*)</label>
        </div>

        <button id="btn-gen-pass" class="btn btn-primary" style="width: 100%; margin-bottom: 20px;">Gerar Nova Senha</button>

        <div class="output-box">
          <div id="pass-output" class="output-content font-mono"></div>
          <button id="btn-copy-pass" class="btn btn-outline" style="position: absolute; right: 12px; top: 12px;">Copiar</button>
        </div>
      </div>
    `;

    const lenSlider = container.querySelector('#pass-len');
    const lenVal = container.querySelector('#pass-len-val');
    const output = container.querySelector('#pass-output');
    const btnGen = container.querySelector('#btn-gen-pass');
    const btnCopy = container.querySelector('#btn-copy-pass');

    lenSlider.addEventListener('input', () => { lenVal.textContent = lenSlider.value; });

    function genPass() {
      const len = parseInt(lenSlider.value);
      let chars = '';
      if (container.querySelector('#chk-upper').checked) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (container.querySelector('#chk-lower').checked) chars += 'abcdefghijklmnopqrstuvwxyz';
      if (container.querySelector('#chk-num').checked) chars += '0123456789';
      if (container.querySelector('#chk-sym').checked) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

      if (!chars) return 'Selecione ao menos 1 opção';

      let pass = '';
      const array = new Uint32Array(len);
      crypto.getRandomValues(array);
      for (let i = 0; i < len; i++) {
        pass += chars[array[i] % chars.length];
      }
      return pass;
    }

    btnGen.addEventListener('click', () => { output.textContent = genPass(); });
    btnCopy.addEventListener('click', () => { if (output.textContent) copyToClipboard(output.textContent); });

    output.textContent = genPass();
  }

  // 6. HASH TOOL
  function renderHashTool(container) {
    container.innerHTML = `
      <div class="form-group">
        <label class="form-label">Digite o texto para gerar hashes:</label>
        <input type="text" id="hash-input" class="form-input" placeholder="Digite algo..." value="Abobi Ferramentas" />
      </div>

      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div>
          <label class="form-label">MD5:</label>
          <div class="output-box"><div id="hash-md5" class="output-content font-mono" style="font-size: 0.95rem;"></div></div>
        </div>
        <div>
          <label class="form-label">SHA-256:</label>
          <div class="output-box"><div id="hash-sha256" class="output-content font-mono" style="font-size: 0.95rem;"></div></div>
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
        <button id="btn-encode" class="btn btn-primary">Codificar para Base64</button>
        <button id="btn-decode" class="btn btn-secondary">Decodificar de Base64</button>
      </div>

      <div class="output-box">
        <div id="base64-output" class="output-content font-mono" style="font-size: 0.95rem;"></div>
      </div>
    `;

    const input = container.querySelector('#base64-input');
    const output = container.querySelector('#base64-output');

    container.querySelector('#btn-encode').addEventListener('click', () => {
      try {
        output.textContent = btoa(unescape(encodeURIComponent(input.value)));
      } catch (err) { output.textContent = 'Erro ao codificar'; }
    });

    container.querySelector('#btn-decode').addEventListener('click', () => {
      try {
        output.textContent = decodeURIComponent(escape(atob(input.value)));
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

  // 9. UUID TOOL
  function renderUUIDTool(container) {
    container.innerHTML = `
      <div style="display: flex; gap: 12px; margin-bottom: 20px; align-items: center;">
        <label>Quantidade:</label>
        <input type="number" id="uuid-qty" min="1" max="50" value="5" class="form-input" style="width: 100px;" />
        <button id="btn-gen-uuid" class="btn btn-primary">Gerar UUIDs</button>
        <button id="btn-copy-uuid" class="btn btn-outline">Copiar Todos</button>
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
      output.textContent = list.join('\n');
    }

    container.querySelector('#btn-gen-uuid').addEventListener('click', generateUUIDs);
    container.querySelector('#btn-copy-uuid').addEventListener('click', () => { if (output.textContent) copyToClipboard(output.textContent); });

    generateUUIDs();
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
        <button id="btn-gen-lorem" class="btn btn-primary">Gerar Lorem Ipsum</button>
        <button id="btn-copy-lorem" class="btn btn-outline">Copiar Texto</button>
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
    }

    container.querySelector('#btn-gen-lorem').addEventListener('click', genLorem);
    container.querySelector('#btn-copy-lorem').addEventListener('click', () => { if (output.textContent) copyToClipboard(output.innerText); });

    genLorem();
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
            <div>HEX: <strong id="color-hex" class="font-mono" style="color: var(--accent-cyan);">#6366f1</strong></div>
            <div>RGB: <strong id="color-rgb" class="font-mono" style="color: var(--accent-cyan);">rgb(99, 102, 241)</strong></div>
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
  }

});
