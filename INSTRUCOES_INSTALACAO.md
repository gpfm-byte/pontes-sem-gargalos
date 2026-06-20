# 📦 Instruções de Instalação - Passo a Passo

## ✅ Checklist de Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [ ] **Node.js** versão 18 ou superior
- [ ] **pnpm** (gerenciador de pacotes)

### Como Instalar os Pré-requisitos

#### 1. Instalar Node.js

**Windows:**
1. Acesse https://nodejs.org
2. Baixe a versão LTS (recomendada)
3. Execute o instalador
4. Verifique a instalação:
   ```cmd
   node --version
   ```

**Mac:**
```bash
# Usando Homebrew
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 2. Instalar pnpm

Após instalar o Node.js, execute:

```bash
npm install -g pnpm
```

Verifique a instalação:
```bash
pnpm --version
```

## 🚀 Instalação do Projeto

### Passo 1: Baixar os Arquivos

Você tem duas opções:

**Opção A: Download Manual**
1. Copie todos os arquivos do projeto
2. Cole em uma pasta no seu computador (ex: `C:\projetos\recife-trafego`)

**Opção B: Via Git (se disponível)**
```bash
git clone [URL_DO_REPOSITORIO]
cd recife-trafego
```

### Passo 2: Abrir Terminal na Pasta do Projeto

**Windows:**
1. Abra a pasta do projeto no Explorer
2. Clique com botão direito em uma área vazia
3. Selecione "Abrir no Terminal" ou "Git Bash Here"

**Mac/Linux:**
```bash
cd /caminho/para/recife-trafego
```

### Passo 3: Instalar Dependências

No terminal, execute:

```bash
pnpm install
```

⏱️ Este processo pode levar alguns minutos...

Você verá algo como:
```
Progress: resolved 234, reused 187, downloaded 47, added 234, done
```

### Passo 4: Iniciar o Servidor

Após a instalação, execute:

```bash
pnpm run dev
```

Você verá no terminal:

```
  VITE v6.3.5  ready in 523 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Passo 5: Abrir no Navegador

1. Abra seu navegador (Chrome, Firefox, Edge, Safari)
2. Acesse: `http://localhost:5173`
3. Pronto! A aplicação está rodando! 🎉

## 🔍 Verificação

Você deve ver:
- ✅ Cabeçalho "Controle de Tráfego - Recife"
- ✅ Duas abas principais: "Aplicação" e "Board de Requisitos MVP"
- ✅ 4 sub-abas na Aplicação: Dashboard, Mapa, Análise IA, Alertas
- ✅ Gráficos e dados sendo exibidos

## ❌ Problemas Comuns

### Erro: "command not found: pnpm"

**Solução:**
```bash
npm install -g pnpm
```

### Erro: "Port 5173 is already in use"

**Solução:**
O projeto tentará usar outra porta automaticamente (5174, 5175, etc).
Ou feche o processo usando a porta 5173.

### Erro: "Cannot find module"

**Solução:**
```bash
# Limpe e reinstale
rm -rf node_modules
pnpm install
```

### Página em branco no navegador

**Solução:**
1. Verifique o terminal - pode haver erros
2. Abra o Console do navegador (F12)
3. Procure por erros em vermelho

## 🛑 Parar o Servidor

Para parar o servidor de desenvolvimento:
- Pressione `Ctrl + C` no terminal
- Confirme com `Y` (se solicitado)

## ♻️ Reiniciar o Servidor

```bash
# Parar (Ctrl + C)
# Depois executar novamente:
pnpm run dev
```

## 📱 Acessar de Outros Dispositivos

Para acessar de celular/tablet na mesma rede:

```bash
pnpm run dev --host
```

O terminal mostrará:
```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.10:5173/
```

Use o IP "Network" no dispositivo móvel.

## 🏗️ Build de Produção

Para gerar versão otimizada para produção:

```bash
pnpm run build
```

Os arquivos estarão em `dist/`

Para testar a build local:

```bash
pnpm run preview
```

## 📞 Ajuda Adicional

Se continuar com problemas:

1. Verifique as versões:
   ```bash
   node --version  # Deve ser >= 18
   pnpm --version  # Deve estar instalado
   ```

2. Limpe o cache:
   ```bash
   pnpm store prune
   ```

3. Reinstale tudo:
   ```bash
   rm -rf node_modules
   rm pnpm-lock.yaml
   pnpm install
   ```

---

**Pronto! Seu sistema está rodando localmente! 🚀**
