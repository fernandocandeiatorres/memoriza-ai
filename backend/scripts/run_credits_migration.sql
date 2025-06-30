-- Script para aplicar migração de créditos
-- Execute este script no Supabase SQL Editor

-- Migração para adicionar sistema de créditos
-- Data: 2025-01-10
-- Descrição: Adiciona campo de créditos para usuários

-- Adicionar coluna credits à tabela users
ALTER TABLE users 
ADD COLUMN credits INTEGER NOT NULL DEFAULT 1;

-- Atualizar usuários existentes para terem 1 crédito (caso não tenham sido criados com default)
UPDATE users SET credits = 1 WHERE credits = 0; 