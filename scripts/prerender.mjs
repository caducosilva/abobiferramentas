// Post-build step: generates a static index.html per indexed tool route inside dist/,
// each with a unique <title>/description and a real, crawlable content block (outside #root).
//
// Why: this is a client-rendered SPA — every route used to serve the exact same generic
// dist/index.html until React ran. Crawlers with weaker JS support (notably Google's AdSense
// crawler, Mediapartners-Google) could see near-identical, low-content pages across all 16
// indexed URLs, which is a known trigger for "low value content" / "ads on screens without
// publisher content" policy flags. This script fixes that at the HTML level, with zero
// runtime cost for real users (React still mounts into #root exactly as before).
//
// Keep the ROUTES list in sync with src/data/toolsData.ts (slug/name/description) whenever
// a tool is added, renamed, or removed.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const seoContent = JSON.parse(await readFile(path.join(rootDir, 'src/data/seoContent.json'), 'utf-8'));

const ROUTES = [
  { id: 'apps-android', slug: 'apps-android-open-source', name: 'Apps Android Open Source', description: 'Baixe o APK de apps de código aberto direto do GitHub Releases e do F-Droid, com a versão mais recente conferida na hora.' },
  { id: 'onibus-mogi', slug: 'horarios-de-onibus-mogi', name: 'Horários de Ônibus de Mogi das Cruzes', description: 'Consulte horários, sentidos e itinerários de todas as linhas municipais SIM Mogi de Mogi das Cruzes.' },
  { id: 'gerador-cpf', slug: 'gerador-de-cpf', name: 'Gerador de CPF', description: 'Gere CPFs válidos com ou sem pontuação para testes de software.' },
  { id: 'validador-cpf', slug: 'validador-de-cpf', name: 'Validador de CPF', description: 'Verifique a validade matemática do CPF com análise passo a passo.' },
  { id: 'gerador-cnpj', slug: 'gerador-de-cnpj', name: 'Gerador & Validador de CNPJ', description: 'Crie ou valide CNPJs de empresas formatados ou limpos para sistemas.' },
  { id: 'gerador-senhas', slug: 'gerador-de-senha', name: 'Gerador de Senhas', description: 'Crie senhas ultra-seguras personalizadas com medidor de força.' },
  { id: 'compressor-imagem', slug: 'compressor-de-imagem', name: 'Compressor de Imagem', description: 'Reduza o tamanho de PNG, JPG e WebP mantendo a qualidade visual no navegador.' },
  { id: 'contador-texto', slug: 'contador-de-texto', name: 'Contador & Utilitários de Texto', description: 'Conte palavras e letras, e converta maiúsculas, minúsculas, camelCase e slug.' },
  { id: 'gerador-curriculo', slug: 'gerador-de-curriculo', name: 'Gerador de Currículo ATS', description: 'Crie um currículo profissional formatado e otimizado para sistemas de triagem.' },
  { id: 'gerador-qrcode', slug: 'gerador-de-qr-code', name: 'Gerador de QR Code', description: 'Gere QR Codes para links, Wi-Fi, textos e WhatsApp com cores personalizadas.' },
  { id: 'formatador-json', slug: 'formatador-de-json', name: 'Formatador & Validador JSON', description: 'Indente, valide sintaxe, minifique e explore arquivos JSON em árvore.' },
  { id: 'gerador-uuid', slug: 'gerador-de-uuid', name: 'Gerador de UUID v4', description: 'Gere identificadores únicos universais (UUIDs) em lote ou individualmente.' },
  { id: 'link-whatsapp', slug: 'gerador-de-link-whatsapp', name: 'Gerador de Link WhatsApp', description: 'Crie links diretos para conversas no WhatsApp com mensagem preenchida.' },
  { id: 'calculadoras', slug: 'calculadora-de-porcentagem-e-imc', name: 'Calculadora de Porcentagem & IMC', description: 'Calcule porcentagens rápidas, variação percentual e Índice de Massa Corporal.' },
  { id: 'conversor-unidades', slug: 'conversor-de-unidades', name: 'Conversor de Unidades', description: 'Converta medidas de comprimento, peso, temperatura e tamanho de arquivos.' },
  { id: 'base64-hash', slug: 'base64-e-hash', name: 'Base64 & Gerador de Hash', description: 'Codifique/decodifique Base64, gere hashes SHA-1/SHA-256/SHA-512 de texto ou de arquivos direto no navegador.' },
  { id: 'cofre-notas-local', slug: 'cofre-de-notas-local', name: 'Cofre de Notas Local', description: 'Guarde notas criptografadas com sua própria senha, salvas só no seu navegador, nunca no nosso servidor.' },
  { id: 'limpador-exif', slug: 'limpador-de-metadados-de-fotos', name: 'Limpador de Metadados de Fotos', description: 'Veja e remova dados EXIF (localização GPS, câmera, data) de fotos sem enviar a imagem para nenhum servidor.' },
  { id: 'gerador-pix', slug: 'gerador-de-pix-copia-e-cola', name: 'Gerador de Pix Copia e Cola', description: 'Crie o QR Code e o código Pix Copia e Cola da sua chave, com valor e descrição, tudo montado no navegador.' },
  { id: 'calculadora-datas', slug: 'calculadora-de-datas', name: 'Calculadora de Datas & Idade', description: 'Calcule dias corridos e úteis entre duas datas, some ou subtraia prazos e descubra a idade exata.' },
  { id: 'conversor-imagem', slug: 'conversor-de-imagem', name: 'Conversor de Imagem', description: 'Converta imagens entre WebP, JPG e PNG com controle de qualidade, sem enviar o arquivo para servidor.' },
  { id: 'consulta-cep', slug: 'consulta-de-cep', name: 'Consulta de CEP', description: 'Descubra rua, bairro, cidade, estado, DDD e código IBGE a partir do CEP, com dados da base dos Correios.' },
  { id: 'comparador-texto', slug: 'comparador-de-textos', name: 'Comparador de Textos (Diff)', description: 'Compare duas versões de um texto ou código e veja linha por linha o que foi adicionado e removido.' },
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

// Matches the whole tag by its identifying attribute regardless of attribute order or
// whether the tag is written on one line or split across several (index.html has both).
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

async function main() {
  const template = await readFile(path.join(distDir, 'index.html'), 'utf-8');

  // Homepage: inject a static teaser too, so "/" itself isn't blank pre-hydration.
  const homeEntry = seoContent.home;
  const homeBlock = buildContentBlock('abobiferramentas', homeEntry?.description ?? '', homeEntry);
  const homeHtml = injectContentAfterRoot(template, homeBlock);
  await writeFile(path.join(distDir, 'index.html'), homeHtml, 'utf-8');

  for (const route of ROUTES) {
    const entry = seoContent[route.id];
    const contentBlock = buildContentBlock(route.name, route.description, entry);
    const patched = patchHead(template, {
      title: route.name,
      description: route.description,
      canonicalPath: `/${route.slug}`,
    });
    const html = injectContentAfterRoot(patched, contentBlock);

    const outDir = path.join(distDir, route.slug);
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, 'index.html'), html, 'utf-8');
  }

  console.log(`[prerender] generated ${ROUTES.length} static tool pages + homepage teaser in dist/`);
}

main().catch((err) => {
  console.error('[prerender] failed:', err);
  process.exit(1);
});
