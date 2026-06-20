# 📤 Como Exportar e Rodar no seu Computador

## 🎯 Resumo Rápido

1. Copie todos os arquivos do projeto para seu computador
2. Instale o Node.js e pnpm
3. Execute `pnpm install`
4. Execute `pnpm run dev`
5. Acesse `http://localhost:5173`

---

## 📋 Lista de Arquivos para Copiar

Certifique-se de copiar TODA a estrutura de pastas:

```
recife-trafego/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── components/
│   │       ├── Header.tsx
│   │       ├── Navigation.tsx
│   │       ├── Dashboard.tsx
│   │       ├── Mapa.tsx
│   │       ├── AnaliseIA.tsx
│   │       ├── Alertas.tsx
│   │       ├── BoardRequisitos.tsx
│   │       └── StatCard.tsx
│   ├── styles/
│   │   ├── theme.css
│   │   └── fonts.css
│   └── main.tsx
├── index.html
├── package.json
├── .gitignore
├── README.md
├── INSTRUCOES_INSTALACAO.md
└── COMO_EXPORTAR.md (este arquivo)
```

## 💾 Opções de Download

### Opção 1: Download Manual (Mais Simples)

1. Crie uma pasta no seu computador (ex: `C:\projetos\recife-trafego`)
2. Copie e cole TODOS os arquivos e pastas listados acima
3. Mantenha a mesma estrutura de pastas

### Opção 2: Compactar e Transferir

1. Compacte toda a pasta do projeto em um arquivo .zip
2. Transfira o .zip para seu computador
3. Extraia o .zip mantendo a estrutura de pastas

### Opção 3: Via Git (Avançado)

Se você tiver acesso ao Git:

```bash
git init
git add .
git commit -m "Initial commit"
# Depois push para seu repositório e clone no computador local
```

## ✅ Verificação Antes de Começar

Antes de instalar, verifique se você tem estes arquivos:

- [ ] `package.json` (arquivo de configuração)
- [ ] `index.html` (ponto de entrada HTML)
- [ ] `src/main.tsx` (ponto de entrada React)
- [ ] `src/app/App.tsx` (componente principal)
- [ ] Pasta `src/app/components/` com todos os componentes
- [ ] Pasta `src/styles/` com arquivos CSS

## 🚀 Instalação Rápida

### Windows (PowerShell ou CMD):

```cmd
cd C:\projetos\recife-trafego
npm install -g pnpm
pnpm install
pnpm run dev
```

### Mac/Linux (Terminal):

```bash
cd ~/projetos/recife-trafego
npm install -g pnpm
pnpm install
pnpm run dev
```

## 🌐 Após Iniciar

1. Aguarde a mensagem no terminal:
   ```
   ➜  Local:   http://localhost:5173/
   ```

2. Abra o navegador em `http://localhost:5173`

3. Você verá a aplicação rodando! 🎉

## 📱 URLs Disponíveis

- **Aplicação Principal**: `http://localhost:5173`
- **Board de Requisitos**: Clique na aba "Board de Requisitos MVP"

## 🔧 Comandos Úteis

```bash
# Iniciar servidor de desenvolvimento
pnpm run dev

# Criar build de produção
pnpm run build

# Testar build de produção
pnpm run preview

# Parar servidor (no terminal)
Ctrl + C
```

## 📊 O que Esperar

Ao abrir `http://localhost:5173`, você verá:

✅ **Aba "Aplicação"** com 4 telas:
   - Dashboard (estatísticas e gráficos)
   - Mapa (visualização geográfica)
   - Análise IA (previsões e métricas)
   - Alertas (sistema de alertas)

✅ **Aba "Board de Requisitos MVP"**:
   - Requisitos Funcionais (8 requisitos)
   - Requisitos Não Funcionais (8 requisitos)
   - Sistema CRUD completo
   - Entidades do sistema

## ⚡ Dica de Performance

Para instalação mais rápida, use pnpm ao invés de npm:

- pnpm é até 2x mais rápido
- Economiza espaço em disco
- Já está configurado no projeto

## 🆘 Precisa de Ajuda?

1. Leia o arquivo `INSTRUCOES_INSTALACAO.md` (passo a passo detalhado)
2. Leia o arquivo `README.md` (documentação completa)
3. Verifique a seção "Problemas Comuns" no INSTRUCOES_INSTALACAO.md

## 🎯 Checklist Final

Antes de considerar a exportação bem-sucedida:

- [ ] Todos os arquivos foram copiados
- [ ] Node.js instalado (versão 18+)
- [ ] pnpm instalado
- [ ] `pnpm install` executado sem erros
- [ ] `pnpm run dev` executado com sucesso
- [ ] Aplicação aberta no navegador
- [ ] Consegue navegar entre as abas
- [ ] Gráficos sendo exibidos corretamente
- [ ] Design responsivo funcionando (redimensione a janela)

---

**✨ Parabéns! Seu projeto está pronto para rodar localmente! ✨**
