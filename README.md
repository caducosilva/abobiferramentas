# abobiferramentas (abobiferramentas.com)

Suíte completa de ferramentas web gratuitas, rápidas e privadas.

## Ferramentas

- Baixador de vídeos (YouTube, YouTube Music, TikTok, Instagram, Facebook, Twitter/X) com download real via `/api/resolve` e `/api/download`
- Horários de ônibus de Mogi das Cruzes (SIM Mogi / EMTU)
- Gerador e validador de CPF / CNPJ
- Gerador de senhas fortes
- Compressor de imagem
- Contador e utilitários de texto
- Gerador de currículo ATS
- Gerador de QR Code
- Formatador e validador de JSON
- Gerador de UUID v4
- Gerador de link do WhatsApp
- Calculadora de porcentagem e IMC
- Conversor de unidades
- Base64 e gerador de hash (MD5/SHA-1/SHA-256)

Todas as ferramentas client-side rodam inteiramente no navegador — nenhum dado é enviado a servidores. O baixador de vídeos é a exceção: o link informado é processado por funções serverless (`/api`) para localizar e transmitir o arquivo de mídia pública diretamente ao seu dispositivo; o arquivo não fica armazenado no servidor.

## Stack

- Frontend: [Vite](https://vitejs.dev/) + [React 19](https://react.dev/) + TypeScript + [Tailwind CSS 4](https://tailwindcss.com/)
- Backend: funções serverless da Vercel (`/api`) em Node.js (`@distube/ytdl-core`, `@distube/ytpl`, `fluent-ffmpeg`) com fallback em Python (`yt-dlp`)
- Página estática dedicada de SEO em `/baixar-video-instagram`

## Rodando localmente

Pré-requisito: Node.js 18+

```bash
npm install
npm run dev
```

As funções em `/api` só rodam em ambiente Vercel (`vercel dev`) ou em produção — o `npm run dev` sobe apenas o frontend.

## Build de produção

```bash
npm run build
npm run preview
```

O deploy é feito automaticamente pela Vercel a cada push na branch `main`.

## Contato

Autor: Carlos Eduardo

- LinkedIn: https://www.linkedin.com/in/carlos-da-silva20ba5740a
- Instagram: https://www.instagram.com/caducosilva
- GitHub: https://github.com/caducosilva
