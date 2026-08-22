# abobiferramentas

Suíte de ferramentas web gratuitas, abertas e utilitários para desenvolvedores e cidadãos, com execução 100% no navegador (client-side), sem coleta de dados e sem anúncios.

---

## O que é o projeto

O **abobiferramentas** é um portal construído em React 19 + TypeScript + Vite + Tailwind CSS, projetado para oferecer ferramentas essenciais de desenvolvimento de software, validação de dados, manipulação de texto e consulta de mobilidade urbana (São Paulo, Mogi das Cruzes, Fortaleza e cidades do Ceará) com privacidade total e carregamento instantâneo.

---

## Recursos & Ferramentas Integradas

### Desenvolvimento & Engenharia de Software
- **Formatador & Validador JSON:** Indentação, visualização em árvore e minificação rápida.
- **Formatador & Minificador SQL:** Indentação de queries SQL com palavras-chave em maiúsculas.
- **Conversor JSON ↔ YAML ↔ CSV:** Conversão bidirecional entre estruturas de dados e tabelas.
- **Testador de Expressões Regulares (Regex):** Teste com flags (g, i, m, s) e destaque visual de matches em tempo real.
- **Decodificador de JWT (JSON Web Token):** Inspeção local de header, payload e datas de expiração.
- **Gerador de Massa de Dados (Faker Mock):** Criação de listas de usuários para testes em JSON, CSV e SQL INSERTs.
- **Conversor de Cores & WCAG:** Conversão HEX, RGB, HSL, CMYK e índice de contraste de acessibilidade.
- **Gerador de Meta Tags SEO & Open Graph:** Criação de tags com prévia em tempo real para Google e redes sociais.
- **Formatador & Validador XML / HTML:** Estruturação hierárquica de arquivos XML e notas fiscais eletrônicas (NF-e).
- **Comparador de Textos (Diff):** Comparação linha a linha (algoritmo LCS / git diff).
- **Gerador de UUID v4:** Geração em lote via Web Crypto API nativa.
- **Base64 & Hashes Criptográficos:** Codificação/decodificação e cálculo de SHA-1, SHA-256 e SHA-512 de textos ou arquivos.

### Geradores, Validadores & Finanças
- **Gerador de Senhas Seguras:** Geração com medidor de força e entropia criptográfica.
- **Gerador & Validador de CPF e CNPJ:** Fórmulas matemáticas de Módulo 11 para testes unitários e homologação de sistemas.
- **Gerador de QR Code:** Criação personalizável para links, textos, Wi-Fi e WhatsApp.
- **Gerador de Pix Copia e Cola:** Montagem de BR Code estático do Banco Central direto no navegador.
- **Consulta de CEP:** Integração direta com a base pública aberta do ViaCEP.

### Utilidades & Imagem
- **Contador & Manipulador de Texto:** Contagem de palavras/caracteres e conversão de caixas (camelCase, slug, etc.).
- **Limpador de Metadados EXIF:** Visualização e remoção de dados de geolocalização (GPS) de fotos no navegador.
- **Conversor & Compressor de Imagens:** Suporte a WebP, JPG e PNG com ajuste de qualidade local.
- **Cofre de Notas Local:** Criptografia AES-GCM com senha mestra salva exclusivamente no dispositivo.
- **Calculadoras:** Datas, idade, porcentagem e IMC.
- **Gerador de Currículo ATS:** Modelo formatado e otimizado para triagem automatizada.

### Mobilidade Urbana & Horários de Ônibus
- **Mogi das Cruzes (SIM Mogi):** Grade horária completa das 83 linhas municipais.
- **São Paulo (SPTrans):** Linhas estruturais, troncais e interterminais da capital.
- **Fortaleza (Etufor / Sindiônibus):** Linhas expressas dos terminais Papicu, Messejana, Antônio Bezerra, Parangaba e Siqueira.
- **Ceará Regional:** Linhas de Caucaia (Bora de Graça com Tarifa Zero), Juazeiro do Norte (Cariri) e Sobral (TranSol).

---

## Privacidade & Conformidade Jurídica

- **Zero Coleta em Servidores:** Todas as operações ocorrem na memória volátil do navegador ou no cache local.
- **Conformidade Legal:** Amparado pela LGPD (Lei nº 13.709/2018), Marco Civil da Internet (Lei nº 12.965/2014) e Lei de Acesso à Informação (Lei nº 12.527/2011).
- **Sem Anúncios:** Experiência limpa sem banners, popups ou rastreadores de terceiros.

---

## Como Executar Localmente

### Pré-requisitos
- Node.js 18+
- npm

```bash
# Clonar o repositório
git clone https://github.com/caducosilva/abobiferramentas.git
cd abobiferramentas

# Instalar dependências
npm install

# Iniciar ambiente de desenvolvimento
npm run dev

# Gerar build de produção com pré-renderização estática (36 rotas)
npm run build
```

---

## Contato & Autor

Desenvolvido por **Caduco Silva**:
- **GitHub:** [github.com/caducosilva](https://github.com/caducosilva)
- **LinkedIn:** [linkedin.com/in/caducosilva](https://linkedin.com/in/caducosilva)

---

## Licença

[MIT](LICENSE) — Software Livre para a comunidade.
