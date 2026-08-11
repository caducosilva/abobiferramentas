# abobiferramentas

Conjunto de utilitários e ferramentas web para automação de tarefas cotidianas e produtividade.

---

## O problema

1. **O que é:** O **abobiferramentas** é um portal de ferramentas e utilitários web construído em HTML/Node.js.
2. **Qual necessidade ataca:** Simplifica a execução de conversões, geradores e automações rápidas sem necessidade de instalar softwares pesados no computador.
3. **Por que existe:** Muitas ferramentas online gratuitas na web estão lotadas de anúncios abusivos ou exigem cadastro. Esta suíte foi criada para ser direta, limpa e eficiente.
4. **Qual o objetivo:** Oferecer um painel único com ferramentas de alta utilidade acessíveis instantaneamente pelo navegador.

---

## Recursos

- ✅ **Ferramentas Integradas:** Utilitários de texto, geradores e calculadoras acessíveis em um só lugar.
- ✅ **Interface Limpa:** Sem propagandas, pop-ups ou distrações.
- ✅ **Execução Local/Servidor:** Processamento rápido no cliente e backend Node.js.

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

Execute o servidor localmente:
```bash
npm start
```
Abra o navegador em `http://localhost:3000`.

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
