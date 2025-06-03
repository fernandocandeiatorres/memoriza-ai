-- Script para verificar se o schema está correto
-- Execute este script para confirmar que a migração funcionou

SELECT 'VERIFICAÇÃO DO SCHEMA - flashcard_sets' as titulo;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'flashcard_sets' 
ORDER BY ordinal_position;

SELECT 'VERIFICAÇÃO DO SCHEMA - flashcards' as titulo;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'flashcards' 
ORDER BY ordinal_position;

-- Verificações específicas
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='flashcard_sets' AND column_name='updated_at') 
    THEN '✅ flashcard_sets.updated_at existe'
    ELSE '❌ flashcard_sets.updated_at NÃO existe'
  END as verificacao_1;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='flashcards' AND column_name='question_text') 
    THEN '✅ flashcards.question_text existe'
    ELSE '❌ flashcards.question_text NÃO existe'
  END as verificacao_2;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='flashcards' AND column_name='answer_text') 
    THEN '✅ flashcards.answer_text existe'
    ELSE '❌ flashcards.answer_text NÃO existe'
  END as verificacao_3;

SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name='flashcards' AND column_name='front') 
    THEN '✅ flashcards.front foi removido'
    ELSE '❌ flashcards.front ainda existe'
  END as verificacao_4;

SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name='flashcards' AND column_name='back') 
    THEN '✅ flashcards.back foi removido'
    ELSE '❌ flashcards.back ainda existe'
  END as verificacao_5; 