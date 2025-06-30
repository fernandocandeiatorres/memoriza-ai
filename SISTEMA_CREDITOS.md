# Sistema de Créditos - Memoriza AI

## 📋 Visão Geral

O sistema de créditos foi implementado para controlar o uso da aplicação. Cada usuário recebe 1 crédito ao se cadastrar, e 1 crédito permite gerar 1 conjunto de flashcards (10 flashcards).

## 🏗️ Arquitetura

### Backend (Go)

**Migração de Banco:**

- Adicionada coluna `credits` na tabela `users`
- Valor padrão: 1 crédito para novos usuários
- Usuários existentes recebem 1 crédito automaticamente

**Modelos Atualizados:**

- `model/user.go`: Campo `Credits int` adicionado
- Repository: Métodos para gerenciar créditos
- Service: Lógica de negócio de créditos
- Handler: Verificação antes da geração

**Endpoints:**

- `GET /api/v1/users/credits` - Obter créditos do usuário
- `POST /api/v1/flashcards/generate` - Consome 1 crédito
- `POST /api/v1/flashcards/generate-from-summary` - Consome 1 crédito

### Frontend (React/TypeScript)

**Hook Personalizado:**

- `useCredits()`: Gerencia estado dos créditos
- Funções: `fetchCredits`, `updateCredits`, `hasInsufficientCredits`

**UI Atualizada:**

- Dashboard: Card de créditos nas estatísticas
- Generator: Indicador de créditos + verificação
- SummaryGenerator: Indicador de créditos + verificação

## 🔄 Fluxo de Funcionamento

### 1. Novo Usuário

```
Usuário se registra → Recebe 1 crédito automaticamente
```

### 2. Geração de Flashcards

```
Frontend verifica créditos →
Se suficiente: Envia request →
Backend verifica novamente →
Gera flashcards →
Consome 1 crédito →
Retorna flashcards + créditos restantes
```

### 3. Créditos Insuficientes

```
Frontend verifica créditos →
Se insuficiente: Mostra erro →
Não permite geração
```

## 📁 Arquivos Modificados

### Backend

- `supabase/migrations/20250110_add_credits_system.sql`
- `internal/model/user.go`
- `internal/repository/user.go`
- `internal/services/user.go`
- `internal/handler/flashcards.go`
- `internal/api/router.go`

### Frontend

- `lib/goBackendApi.ts`
- `hooks/useCredits.ts`
- `pages/Dashboard.tsx`
- `pages/Generator.tsx`
- `pages/SummaryGenerator.tsx`
- `shared/schema.ts`

## 🚀 Deploy

### 1. Banco de Dados

Execute a migração no Supabase:

```sql
-- No Supabase SQL Editor
ALTER TABLE users
ADD COLUMN credits INTEGER NOT NULL DEFAULT 1;

UPDATE users SET credits = 1 WHERE credits = 0;
```

### 2. Backend

- Deploy normalmente (Railway/Docker)
- As mudanças são backward compatible

### 3. Frontend

- Deploy normalmente (Vercel)
- Interface atualizada automaticamente

## 🎯 Funcionalidades

### ✅ Implementado

- [x] 1 crédito por usuário novo
- [x] 1 crédito = 1 conjunto de flashcards
- [x] Verificação no frontend e backend
- [x] UI com indicador de créditos
- [x] Atualização em tempo real
- [x] Mensagens de erro amigáveis

### 🔮 Futuras Expansões

- [ ] Compra de créditos
- [ ] Créditos diários
- [ ] Diferentes custos por tipo
- [ ] Sistema de assinatura
- [ ] Histórico de uso

## 🛡️ Segurança

1. **Dupla Verificação**: Frontend + Backend
2. **Transações Atômicas**: Não gera sem créditos
3. **Validação de Token**: Autenticação obrigatória
4. **Logs**: Registro de consumo de créditos

## 🧪 Testes

### Manual Testing

```bash
# 1. Criar usuário novo
# 2. Verificar se recebe 1 crédito
# 3. Gerar flashcards
# 4. Verificar se crédito foi consumido
# 5. Tentar gerar novamente (deve falhar)
```

### Cenários de Teste

- ✅ Usuário novo recebe 1 crédito
- ✅ Geração consome 1 crédito
- ✅ Sem créditos = erro amigável
- ✅ UI atualiza em tempo real
- ✅ Backend valida créditos

## 📊 Monitoramento

- Logs de consumo de créditos
- Erro logs para transações falhadas
- Métricas de usuários sem créditos

---

**Sistema implementado em:** Janeiro 2025  
**Status:** ✅ Ativo  
**Versão:** 1.0.0
