// Post-build step: generates a static index.html per indexed tool route inside dist/,
// each with a unique <title>/description and a real, crawlable content block (outside #root).

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const seoContent = JSON.parse(await readFile(path.join(rootDir, 'src/data/seoContent.json'), 'utf-8'));

const ROUTES = [
  // Transportes
  { id: 'onibus-mogi', slug: 'horarios-de-onibus-mogi', name: 'Horários de Ônibus de Mogi das Cruzes', description: 'Consulte horários, sentidos e itinerários de todas as linhas municipais SIM Mogi de Mogi das Cruzes.' },
  { id: 'onibus-sp', slug: 'horarios-de-onibus-sp', name: 'Horários de Ônibus de São Paulo (SPTrans)', description: 'Consulte linhas troncais, estruturais e interterminais da capital de São Paulo com horários atualizados.' },
  { id: 'onibus-fortaleza', slug: 'horarios-de-onibus-fortaleza', name: 'Horários de Ônibus de Fortaleza (Etufor)', description: 'Consulte horários e rotas expressas dos terminais Papicu, Messejana, Antônio Bezerra, Parangaba e Siqueira.' },
  { id: 'onibus-ceara', slug: 'horarios-de-onibus-ceara', name: 'Horários de Ônibus do Ceará (Caucaia, Juazeiro, Sobral)', description: 'Linhas urbanas e metropolitanas de Caucaia (Bora de Graça), Juazeiro do Norte (Cariri), Sobral (TranSol) e Maracanaú.' },

  // Desenvolvimento & Dev
  { id: 'formatador-json', slug: 'formatador-de-json', name: 'Formatador & Validador JSON', description: 'Indente, valide sintaxe, minifique e explore arquivos JSON em árvore.' },
  { id: 'formatador-sql', slug: 'formatador-de-sql', name: 'Formatador & Minificador SQL', description: 'Indente consultas SQL com palavras-chave em maiúsculas e minificação para código limpo.' },
  { id: 'conversor-json-yaml-csv', slug: 'conversor-json-yaml-csv', name: 'Conversor JSON ↔ YAML ↔ CSV', description: 'Transforme dados entre JSON, tabelas CSV e arquivos de configuração YAML em tempo real.' },
  { id: 'testador-regex', slug: 'testador-de-regex', name: 'Testador de Expressões Regulares (Regex)', description: 'Teste e depure expressões regulares com destaque visual de correspondências e flags.' },
  { id: 'decodificador-jwt', slug: 'decodificador-de-jwt', name: 'Decodificador de JWT (JSON Web Token)', description: 'Inspecione header, payload e datas de expiração de tokens JWT sem enviar dados para a internet.' },
  { id: 'gerador-mock-data', slug: 'gerador-de-dados-mock-faker', name: 'Gerador de Dados de Teste (Faker Mock)', description: 'Gere listas de usuários, CPFs válidos, emails, telefones e cargos em JSON, CSV ou SQL INSERTs.' },
  { id: 'conversor-cores', slug: 'conversor-de-cores', name: 'Conversor de Cores & Contraste WCAG', description: 'Converta cores entre HEX, RGB, HSL e CMYK e verifique contraste de acessibilidade para interfaces.' },
  { id: 'gerador-meta-tags', slug: 'gerador-de-meta-tags-seo', name: 'Gerador de Meta Tags SEO & Open Graph', description: 'Crie tags HTML para Google, Facebook, WhatsApp e Twitter com pré-visualização em tempo real.' },
  { id: 'formatador-xml', slug: 'formatador-de-xml', name: 'Formatador & Validador XML / HTML', description: 'Indente arquivos XML, notas fiscais eletrônicas (NF-e) e documentos HTML estruturados.' },
  { id: 'comparador-texto', slug: 'comparador-de-textos', name: 'Comparador de Textos (Diff)', description: 'Compare duas versões de um texto ou código e veja linha por linha o que foi adicionado e removido.' },
  { id: 'gerador-uuid', slug: 'gerador-de-uuid', name: 'Gerador de UUID v4', description: 'Gere identificadores únicos universais (UUIDs) em lote ou individualmente.' },
  { id: 'base64-hash', slug: 'base64-e-hash', name: 'Base64 & Gerador de Hash', description: 'Codifique/decodifique Base64, gere hashes SHA-1/SHA-256/SHA-512 de texto ou de arquivos direto no navegador.' },

  // Geradores & Validadores
  { id: 'gerador-senhas', slug: 'gerador-de-senha', name: 'Gerador de Senhas', description: 'Crie senhas ultra-seguras personalizadas com medidor de força criptográfico.' },
  { id: 'gerador-cpf', slug: 'gerador-de-cpf', name: 'Gerador de CPF', description: 'Gere CPFs válidos com ou sem pontuação para testes de software.' },
  { id: 'validador-cpf', slug: 'validador-de-cpf', name: 'Validador de CPF', description: 'Verifique a validade matemática do CPF com análise passo a passo.' },
  { id: 'gerador-cnpj', slug: 'gerador-de-cnpj', name: 'Gerador & Validador de CNPJ', description: 'Crie ou valide CNPJs de empresas formatados ou limpos para sistemas.' },
  { id: 'gerador-qrcode', slug: 'gerador-de-qr-code', name: 'Gerador de QR Code', description: 'Gere QR Codes para links, Wi-Fi, textos e WhatsApp com cores personalizadas.' },
  { id: 'gerador-pix', slug: 'gerador-de-pix-copia-e-cola', name: 'Gerador de Pix Copia e Cola', description: 'Crie o QR Code e o código Pix Copia e Cola da sua chave, com valor e descrição, tudo montado no navegador.' },
  { id: 'contador-texto', slug: 'contador-de-texto', name: 'Contador & Utilitários de Texto', description: 'Conte palavras e letras, e converta maiúsculas, minúsculas, camelCase e slug.' },
  { id: 'limpador-exif', slug: 'limpador-de-metadados-de-fotos', name: 'Limpador de Metadados de Fotos', description: 'Veja e remova dados EXIF (localização GPS, câmera, data) de fotos sem enviar a imagem para nenhum servidor.' },
  { id: 'conversor-imagem', slug: 'conversor-de-imagem', name: 'Conversor de Imagem', description: 'Converta imagens entre WebP, JPG e PNG com controle de qualidade, sem enviar o arquivo para servidor.' },
  { id: 'compressor-imagem', slug: 'compressor-de-imagem', name: 'Compressor de Imagem', description: 'Reduza o tamanho de PNG, JPG e WebP mantendo a qualidade visual no navegador.' },
  { id: 'consulta-cep', slug: 'consulta-de-cep', name: 'Consulta de CEP', description: 'Descubra rua, bairro, cidade, estado, DDD e código IBGE a partir do CEP, com dados da base dos Correios.' },
  { id: 'cofre-notas-local', slug: 'cofre-de-notas-local', name: 'Cofre de Notas Local', description: 'Guarde notas criptografadas com sua própria senha, salvas só no seu navegador, nunca no nosso servidor.' },
  { id: 'calculadora-datas', slug: 'calculadora-de-datas', name: 'Calculadora de Datas & Idade', description: 'Calcule dias corridos e úteis entre duas datas, some ou subtraia prazos e descubra a idade exata.' },
  { id: 'calculadoras', slug: 'calculadora-de-porcentagem-e-imc', name: 'Calculadora de Porcentagem & IMC', description: 'Calcule porcentagens rápidas, variação percentual e Índice de Massa Corporal.' },
  { id: 'conversor-unidades', slug: 'conversor-de-unidades', name: 'Conversor de Unidades', description: 'Converta medidas de comprimento, peso, temperatura e tamanho de arquivos.' },
  { id: 'link-whatsapp', slug: 'gerador-de-link-whatsapp', name: 'Gerador de Link WhatsApp', description: 'Crie links diretos para conversas no WhatsApp com mensagem preenchida.' },
  { id: 'gerador-curriculo', slug: 'gerador-de-curriculo', name: 'Gerador de Currículo ATS', description: 'Crie um currículo profissional formatado e otimizado para sistemas de triagem.' },

  // Páginas Institucionais & Legais
  { id: 'sobre', slug: 'sobre', name: 'Sobre o abobiferramentas', description: 'Conheça a história, princípios e missão do portal abobiferramentas.' },
  { id: 'contato', slug: 'contato', name: 'Contato & Redes Oficiais', description: 'Canais oficiais de contato com Caduco Silva: GitHub e LinkedIn.' },
  { id: 'conformidade-legal', slug: 'conformidade-legal', name: 'Bases Legais & Conformidade Jurídica', description: 'Fundamentação técnica sobre a legalidade das ferramentas, Marco Civil da Internet e LGPD.' },
];

const SITE_URL = 'https://abobiferramentas.com';

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function buildContentBlock(name, description, entry) {
  const steps = (entry?.howItWorks ?? []).map((s) => `<li>${escapeHtml(s)}</li>`).join('');
  const faq = (entry?.faq ?? [])
    .map(
      (f) => `<details style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-top:12px;">
        <summary style="font-weight:700;cursor:pointer;">${escapeHtml(f.q)}</summary>
        <p style="margin-top:8px;color:#64748b;font-size:14px;line-height:1.6;">${escapeHtml(f.a)}</p>
      </details>`
    )
    .join('');

  return `<section id="prerendered-seo-content" style="max-width:768px;margin:0 auto;padding:32px 16px;font-family:system-ui,sans-serif;">
    <h1 style="font-size:28px;font-weight:800;margin-bottom:8px;">${escapeHtml(name)}</h1>
    <p style="color:#64748b;font-size:15px;line-height:1.6;margin-bottom:24px;">${escapeHtml(description)}</p>
    ${steps ? `<h2 style="font-size:18px;font-weight:700;margin-bottom:12px;">Como funciona</h2><ol style="padding-left:20px;color:#475569;font-size:14px;line-height:1.8;">${steps}</ol>` : ''}
    ${faq ? `<h2 style="font-size:18px;font-weight:700;margin:24px 0 4px;">Perguntas frequentes</h2>${faq}` : ''}
  </section>`;
}

function replaceTag(html, identifyingAttr, replacementTag) {
  const pattern = new RegExp(`<(meta|link)\\s[^>]*${identifyingAttr}[\\s\\S]*?\\/>`, '');
  return html.replace(pattern, replacementTag);
}

function patchHead(html, { title, description, canonicalPath }) {
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const fullTitle = `${escapeHtml(title)} | abobiferramentas`;
  const desc = escapeHtml(description);

  let out = html.replace(/<title>[^<]*<\/title>/, `<title>${fullTitle}</title>`);
  out = replaceTag(out, 'name="description"', `<meta name="description" content="${desc}" />`);
  out = replaceTag(out, 'rel="canonical"', `<link rel="canonical" href="${canonicalUrl}" />`);
  out = replaceTag(out, 'property="og:url"', `<meta property="og:url" content="${canonicalUrl}" />`);
  out = replaceTag(out, 'property="og:title"', `<meta property="og:title" content="${fullTitle}" />`);
  out = replaceTag(out, 'property="og:description"', `<meta property="og:description" content="${desc}" />`);
  out = replaceTag(out, 'name="twitter:url"', `<meta name="twitter:url" content="${canonicalUrl}" />`);
  out = replaceTag(out, 'name="twitter:title"', `<meta name="twitter:title" content="${fullTitle}" />`);
  out = replaceTag(out, 'name="twitter:description"', `<meta name="twitter:description" content="${desc}" />`);
  return out;
}

function injectContentAfterRoot(html, contentBlock) {
  return html.replace('<div id="root"></div>', `<div id="root"></div>\n${contentBlock}`);
}

function buildFaqStructuredData(canonicalUrl, faq) {
  if (!faq || faq.length === 0) return '';
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
}

function injectFaqSchema(html, scriptTag) {
  if (!scriptTag) return html;
  return html.replace('</head>', `${scriptTag}\n</head>`);
}

async function main() {
  const templatePath = path.join(distDir, 'index.html');
  const template = await readFile(templatePath, 'utf-8');

  // 1. Homepage
  const homeEntry = seoContent.home;
  let homeHtml = patchHead(template, {
    title: homeEntry?.title ?? 'abobiferramentas | Ferramentas Dev, Horários de Ônibus & Utilitários',
    description: homeEntry?.description ?? '',
    canonicalPath: '/',
  });
  const homeBlock = buildContentBlock('abobiferramentas', homeEntry?.description ?? '', homeEntry);
  homeHtml = injectContentAfterRoot(homeHtml, homeBlock);
  const homeFaqScript = buildFaqStructuredData(SITE_URL, homeEntry?.faq);
  homeHtml = injectFaqSchema(homeHtml, homeFaqScript);
  await writeFile(templatePath, homeHtml, 'utf-8');

  // 2. Tool routes
  for (const route of ROUTES) {
    const routeDir = path.join(distDir, route.slug);
    await mkdir(routeDir, { recursive: true });

    const entry = seoContent[route.id];
    let pageHtml = patchHead(template, {
      title: route.name,
      description: route.description,
      canonicalPath: `/${route.slug}`,
    });

    const contentBlock = buildContentBlock(route.name, route.description, entry);
    pageHtml = injectContentAfterRoot(pageHtml, contentBlock);

    const faqScript = buildFaqStructuredData(`${SITE_URL}/${route.slug}`, entry?.faq);
    pageHtml = injectFaqSchema(pageHtml, faqScript);

    await writeFile(path.join(routeDir, 'index.html'), pageHtml, 'utf-8');
  }

  console.log(`[prerender] generated ${ROUTES.length} static tool pages + homepage teaser in dist/`);
}

main().catch((err) => {
  console.error('[prerender] failed:', err);
  process.exit(1);
});
