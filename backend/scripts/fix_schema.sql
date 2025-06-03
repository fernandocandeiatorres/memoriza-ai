-- Script para corrigir a estrutura das tabelas para corresponder ao modelo Go
-- Execute este script para alinhar o banco de dados com o backend

-- 1. Corrigir a tabela flashcard_sets
-- Adicionar updated_at se não existir
ALTER TABLE flashcard_sets 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Remover a coluna prompt se existir (ela não é usada no modelo Go)
ALTER TABLE flashcard_sets 
DROP COLUMN IF EXISTS prompt;

-- 2. Corrigir a tabela flashcards
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

-- Verificar a estrutura final das tabelas
SELECT 'flashcard_sets structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'flashcard_sets' 
ORDER BY ordinal_position;

SELECT 'flashcards structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'flashcards' 
ORDER BY ordinal_position; 