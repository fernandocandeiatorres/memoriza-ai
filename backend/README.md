# Memoriza AI Backend

Backend API desenvolvido em Go usando Gin framework.

## 🚀 Deploy no Railway

### Configuração do Projeto

1. **Root Directory**: `backend`
2. **Runtime**: Go
3. **Build Command**: `go build -o main cmd/server/main.go`
4. **Start Command**: `./main`

### Variáveis de Ambiente Obrigatórias

Configure as seguintes variáveis no Railway:

```env
# API Keys
DEEPISEEK_API_KEY=your_deepseek_api_key

# Database
SUPABASE_DB_URL=postgresql://user:password@host:port/database
DATABASE_URL=postgresql://user:password@host:port/database

# Server
PORT=8080

# CORS (opcional)
ALLOWED_ORIGIN=https://memoriza-ai.vercel.app
RAILWAY_STATIC_URL=your-app-name.up.railway.app
```

### Deploy Automático

O Railway detectará automaticamente o projeto Go e fará o build usando:

- `go.mod` na raiz do diretório backend
- Comando de entrada: `cmd/server/main.go`

### Deploy Manual via CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link do projeto
railway link

# Deploy
railway up
```

## 🐳 Deploy com Docker (Opcional)

Se preferir usar Docker no Railway:

1. O Railway detectará automaticamente o `Dockerfile`
2. Ou você pode especificar nas configurações do projeto

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
go mod tidy

# Executar servidor
go run cmd/server/main.go

# Ou usar o script
../start-go-backend.sh
```

## 📁 Estrutura do Projeto

```
backend/
├── cmd/
│   └── server/
│       └── main.go          # Ponto de entrada
├── internal/
│   ├── api/                 # Rotas e middleware
│   ├── handler/             # Handlers HTTP
│   ├── services/            # Lógica de negócio
│   ├── repository/          # Acesso a dados
│   └── model/               # Modelos de dados
├── go.mod                   # Dependências
├── Dockerfile              # Configuração Docker
└── railway.json            # Configuração Railway
```

## 🔗 Endpoints da API

- `GET /health` - Health check
- `POST /api/v1/flashcards/generate` - Gerar flashcards
- `POST /api/v1/flashcards/generate-from-summary` - Gerar a partir de resumo
- `GET /api/v1/flashcardsets/:id` - Obter conjunto de flashcards
- `GET /api/v1/users/:id/flashcardsets` - Listar conjuntos do usuário

## 🔐 Autenticação

O backend usa autenticação via Supabase JWT tokens.
