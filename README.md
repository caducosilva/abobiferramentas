# abobiferramentas

Conjunto de utilitários e ferramentas web para automação de tarefas cotidianas e produtividade.

---

## O problema

1. **O que é:** O **abobiferramentas** é um portal de ferramentas e utilitários web construído em Vite + React + TypeScript, com um punhado de funções serverless na Vercel para o que precisa consultar dados de fora.
2. **Qual necessidade ataca:** Simplifica a execução de conversões, geradores e automações rápidas sem necessidade de instalar softwares pesados no computador.
3. **Por que existe:** Muitas ferramentas online gratuitas na web estão lotadas de anúncios abusivos ou exigem cadastro. Esta suíte foi criada para ser direta, limpa e eficiente.
4. **Qual o objetivo:** Oferecer um painel único com ferramentas de alta utilidade acessíveis instantaneamente pelo navegador.

---

## Recursos

- ✅ **Ferramentas Integradas:** Geradores (CPF, CNPJ, senha, UUID, QR Code, Pix Copia e Cola), validadores, calculadoras, utilitários de texto, comparador de textos, conversor e compressor de imagem, formatador de JSON, Base64 e hashes.
- ✅ **Catálogo de Apps Android Open Source:** Mil aplicativos de código aberto com link direto do APK na fonte oficial, divididos em destaques comentados (versão consultada em tempo real no GitHub Releases e no F-Droid) e catálogo completo com busca e filtro por categoria.
- ✅ **Privacidade por padrão:** A maioria das ferramentas roda inteiramente no navegador. Cofre de notas com criptografia AES-GCM e limpador de metadados EXIF nunca enviam nada para fora.
- ✅ **Dados locais de Mogi das Cruzes:** Horários e itinerários reais das linhas municipais SIM Mogi.
- ✅ **Interface Limpa:** Anúncios sempre passivos, nunca bloqueando o uso de nenhuma ferramenta.

### Sobre o catálogo de APK

Só entra software de código aberto cuja licença permite a redistribuição, e o download aponta sempre para o servidor de origem: nenhum APK é hospedado, modificado ou intermediado por este projeto. Não há espelho de app pago desbloqueado nem de mod de aplicativo proprietário, tanto por ser distribuição ilegal quanto porque arquivo recompactado por terceiro é o vetor mais comum de malware no Android.

As fontes são todas públicas e oficiais:

| Fonte | O que fornece |
| --- | --- |
| GitHub Releases | Asset `.apk` publicado pelo próprio desenvolvedor, consultado em tempo real por `api/app-releases.js` |
| F-Droid | Índice oficial do repositório, com URL de APK estável |
| IzzyOnDroid | Repositório em formato F-Droid, cobre projetos que não estão no oficial |
| Guardian Project | Repositório oficial do Orbot, Tor Browser e afins |
| microG | Repositório oficial do microG |

O catálogo grande é gerado por script e commitado, porque os índices desses repositórios somam quase 70 MB e não faria sentido baixar isso em runtime. Para atualizar:

```bash
npm run scrape:apps
```

A saída vai para `public/apps/` fatiada em shards de 800 apps, não para `src/`: assim são arquivos estáticos servidos pela CDN e buscados sob demanda, em vez de entrarem no bundle. A página busca `meta.json`, dispara os shards em paralelo e vai renderizando conforme cada pedaço chega, com o shard 0 já trazendo os apps mais notórios.

Sobre o APKMirror: não entra no catálogo por um motivo técnico antes de qualquer outro. Eles geram o link de download atrás de uma página intermediária, com token amarrado à sessão de quem clicou, então link direto copiado de lá pararia de funcionar em poucas horas. Onde o APKMirror é realmente necessário, que é pegar o APK original do YouTube antes de aplicar os patches, o link para a página deles está no guia do ReVanced na própria página.

O script reordena a lista por notoriedade. Como nenhum repositório F-Droid divulga número de downloads, o critério é a quantidade de idiomas em que cada app foi traduzido pela comunidade, que separa bem app conhecido de app obscuro (NewPipe tem 98 idiomas e Organic Maps 95, contra mediana de 2 no repositório inteiro), com empate decidido pela data da última atualização. Ele também descarta automaticamente app de conteúdo adulto, já que o site é de uso geral.

Sobre ReVanced: o projeto não distribui o YouTube modificado pronto, porque o APK do YouTube é da Google e republicá-lo alterado seria violação de direito autoral. O que o catálogo traz é o ReVanced Manager e o GmsCore (microG), que é o caminho oficial: o app modificado é gerado no próprio aparelho do usuário, a partir do APK original.

---

## Instalação

### Pré-requisitos
- Node.js v18.0.0 ou superior
- npm

### Comandos de instalação
```bash
git clone https://github.com/caducosilva/abobiferramentas.git
cd abobiferramentas
npm install
```

---

## Como usar

Execute o servidor de desenvolvimento localmente:
```bash
npm run dev
```
Abra o navegador em `http://localhost:3000`.

Para gerar a build de produção (inclui o passo de prerender das páginas de cada ferramenta):
```bash
npm run build
```

As funções em `api/` são serverless da Vercel e não sobem com o `vite dev`. Para testá-las localmente, use `vercel dev`.

---

## Configuração

| Variável | Descrição | Valor Padrão |
|---|---|---|
| `PORT` | Porta do servidor HTTP | `3000` |
| `NODE_ENV` | Ambiente de execução (`development`/`production`) | `development` |

---

## Detalhes técnicos relevantes

- **Arquitetura:** Frontend responsivo em HTML5/CSS3 com servidor backend Node.js.
- **Desempenho:** Carregamento inicial em ~0.4s.

---

## Testes

Para rodar os testes automatizados:
```bash
npm test
```

---

## Problemas comuns

| Mensagem de erro | Causa provável | Solução |
|---|---|---|
| `Error: listen EADDRINUSE :::3000` | A porta 3000 já está em uso por outro aplicativo | Altere a variável `PORT` no ambiente ou encerre o processo anterior |

---

## Apoie o projeto

Se este projeto te ajudou, considere fazer uma doação via PIX:

```
f74458dc-2a36-49bd-9250-1cef4365ebb8
```

---

## Licença

[MIT](LICENSE) — Carlos Eduardo
