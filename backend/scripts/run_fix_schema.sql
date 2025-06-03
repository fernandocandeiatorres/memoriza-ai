-- ============================================
-- SCRIPT PARA CORRIGIR O SCHEMA DO BANCO
-- Execute este script no SQL Editor do Supabase Dashboard
-- ============================================

-- 1. Verificar estrutura atual das tabelas
SELECT 'ESTRUTURA ATUAL - flashcard_sets:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'flashcard_sets' 
ORDER BY ordinal_position;

SELECT 'ESTRUTURA ATUAL - flashcards:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'flashcards' 
ORDER BY ordinal_position;

-- 2. Corrigir a tabela flashcard_sets
-- Verificar se updated_at existe, se não, adicionar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='flashcard_sets' AND column_name='updated_at') THEN
        ALTER TABLE flashcard_sets 
        ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- Verificar se prompt existe, se sim, remover
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='flashcard_sets' AND column_name='prompt') THEN
        ALTER TABLE flashcard_sets DROP COLUMN prompt;
    END IF;
END $$;

-- 3. Corrigir a tabela flashcards
-- Renomear front para question_text se a coluna front existir
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='flashcards' AND column_name='front') THEN
        ALTER TABLE flashcards RENAME COLUMN front TO question_text;
    END IF;
END $$;

-- Renomear back para answer_text se a coluna back existir
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='flashcards' AND column_name='back') THEN
        ALTER TABLE flashcards RENAME COLUMN back TO answer_text;
    END IF;
END $$;

-- 4. Verificar estrutura final das tabelas
SELECT 'ESTRUTURA FINAL - flashcard_sets:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'flashcard_sets' 
ORDER BY ordinal_position;

SELECT 'ESTRUTURA FINAL - flashcards:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'flashcards' 
ORDER BY ordinal_position;

-- 5. Mensagem de sucesso
SELECT 'MIGRAÇÃO CONCLUÍDA COM SUCESSO!' as resultado; 