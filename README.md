# Regitech - Sistema de Controle de Equipamentos de TI

Sistema web para gerenciamento de ativos de TI, com autenticação de usuários e assistente de inteligência artificial integrado via Google Gemini.

## Funcionalidades

### Controle de Equipamentos
- Cadastro de equipamentos: computadores, monitores, impressoras e periféricos
- Campos: número de patrimônio, usuário responsável, localização e status
- Status disponíveis: Em Uso, Manutenção e Disponível
- Busca em tempo real e filtros por tipo e status
- Exclusão de equipamentos com confirmação
- Dados salvos localmente no navegador (localStorage)

### Autenticação
- Página de login com validação de credenciais
- Cadastro de novos usuários (nome, email e senha)
- Proteção de rotas — acesso ao sistema apenas com login ativo
- Dados de usuários salvos localmente no navegador

### Assistente IA (Google Gemini)
- Analisar Equipamentos: insights sobre o inventário atual
- Gerar Relatório: relatório executivo exportável em CSV
- Previsões: alertas preventivos e recomendações de manutenção
- Chat Inteligente: chat em tela cheia com contexto do inventário
- API Key configurável pelo próprio usuário, salva no localStorage

## Tecnologias

- HTML, CSS e JavaScript puro (sem frameworks)
- localStorage para persistência de dados
- Google Gemini API (`gemini-2.5-flash`) para IA
- Hospedagem via GitHub Pages

## Como usar

1. Acesse a página de cadastro e crie sua conta
2. Faça login com email e senha cadastrados
3. Cadastre os equipamentos pelo formulário
4. Use o painel **IA Gemini** (canto superior direito) para análises
5. Para o chat, clique em **Chat Inteligente** — abre em tela cheia

## Configuração da IA

1. Acesse [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Gere uma API Key gratuita
3. No sistema, clique em **IA Gemini** → cole a key → clique **Salvar**

## Estrutura de arquivos

```
├── index.html          # Sistema principal
├── login.html          # Página de login
├── register.html       # Cadastro de usuários
├── script.js           # Lógica dos equipamentos
├── login.js            # Lógica de autenticação
├── register.js         # Lógica de cadastro
├── ai-assistant.js     # Assistente IA Gemini
├── styles.css          # Estilos do sistema
├── login-styles.css    # Estilos de login/cadastro
├── ai-styles.css       # Estilos do assistente IA
└── Reigtech.png        # Logo
```

## Desenvolvido por

Talisson — [github.com/TalissonLeandro](https://github.com/TalissonLeandro)
