# 🔧 Correção do Schema do Banco de Dados

## Problema

O erro que você está enfrentando ao clicar em "ver detalhes" de um flashcard set é causado por uma incompatibilidade entre a estrutura das tabelas no banco de dados e o que o backend Go espera.

**O que está acontecendo:**

- Seu banco tem colunas `front` e `back` na tabela `flashcards`
- O backend Go espera `question_text` e `answer_text`
- Sua tabela `flashcard_sets` pode ter uma coluna extra `prompt` que não é usada
- Está faltando a coluna `updated_at` em `flashcard_sets`

## 🚀 Como Resolver

### Opção 1: Usando o Supabase Dashboard (RECOMENDADO)

1. **Acesse seu projeto no Supabase Dashboard**

   - Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecione seu projeto

2. **Abra o SQL Editor**

   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute o script de migração**

   - Copie todo o conteúdo do arquivo `backend/scripts/run_fix_schema.sql`
   - Cole no editor SQL
   - Clique em "Run" para executar

4. **Verifique os resultados**
   - O script mostrará a estrutura antes e depois
   - Você deve ver "MIGRAÇÃO CONCLUÍDA COM SUCESSO!" no final

### Opção 2: Usando psql (Se você tem PostgreSQL instalado localmente)

```bash
# Execute o script diretamente no banco
psql "your_supabase_connection_string" -f backend/scripts/run_fix_schema.sql
```

## ✅ O que a migração faz

1. **Adiciona a coluna `updated_at`** na tabela `flashcard_sets` se não existir
2. **Remove a coluna `prompt`** da tabela `flashcard_sets` se existir (não é usada)
3. **Renomeia `front` para `question_text`** na tabela `flashcards`
4. **Renomeia `back` para `answer_text`** na tabela `flashcards`
5. **Mostra a estrutura final** das tabelas para confirmação

## 🎯 Estrutura Final Esperada

**Tabela `flashcard_sets`:**

- `id` (UUID)
- `user_id` (UUID)
- `topic` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Tabela `flashcards`:**

- `id` (UUID)
- `flashcard_set_id` (UUID)
- `card_order` (INTEGER)
- `question_text` (TEXT)
- `answer_text` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## 🔄 Após a migração

1. **Reinicie o backend Go** se estiver rodando
2. **Teste novamente** clicando em "ver detalhes" de um flashcard set
3. **O erro deve ser resolvido!**

## ⚠️ Backup (Opcional mas Recomendado)

Antes de executar a migração, você pode fazer um backup:

1. No Supabase Dashboard, vá em "Settings" > "Database"
2. Clique em "Database backups"
3. Ou execute: `pg_dump "your_connection_string" > backup.sql`

---

**💡 Dica:** Após a migração, todos os flashcards existentes continuarão funcionando normalmente, apenas os nomes das colunas serão atualizados.
