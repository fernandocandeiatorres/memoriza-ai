#!/bin/bash

# Definir cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================"
echo "   Iniciando Memoriza.ai - Full Stack   "
echo -e "========================================${NC}"

# Configurar variáveis de ambiente
export $(grep -v '^#' .env | xargs)

# Verificar se as variáveis necessárias estão definidas
echo -e "${YELLOW}Verificando variáveis de ambiente...${NC}"
if [ -z "$DEEPISEEK_API_KEY" ]; then
    echo -e "${RED}⚠️ AVISO: DEEPISEEK_API_KEY não está definida!${NC}"
else
    echo -e "${GREEN}✓ DEEPISEEK_API_KEY encontrada${NC}"
fi

if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${RED}⚠️ AVISO: SUPABASE_DB_URL não está definida!${NC}"
else
    echo -e "${GREEN}✓ SUPABASE_DB_URL encontrada${NC}"
fi

# Preparar DATABASE_URL para o backend Go
if [ ! -z "$SUPABASE_DB_URL" ]; then
    export DATABASE_URL="$SUPABASE_DB_URL"
    echo -e "${GREEN}✓ DATABASE_URL configurada para backend Go${NC}"
fi

# Iniciar o backend Go em segundo plano
echo -e "${YELLOW}Iniciando o backend Go...${NC}"
cd backend && go run cmd/server/main.go &
GO_PID=$!
cd ..

# Aguardar um pouco para o servidor Go iniciar
echo -e "${YELLOW}Aguardando o backend Go iniciar...${NC}"
sleep 5

# Verificar se o servidor Go está rodando
if ps -p $GO_PID > /dev/null; then
    echo -e "${GREEN}✓ Backend Go iniciado com sucesso (PID: $GO_PID)${NC}"
else
    echo -e "${RED}⚠️ ERRO: Backend Go não iniciou corretamente${NC}"
fi

# Iniciar o servidor frontend
echo -e "${YELLOW}Iniciando o frontend React + Express...${NC}"
npm run dev

# Cleanup ao finalizar - garantir que o processo Go seja encerrado
cleanup() {
  echo -e "${YELLOW}Encerrando servidores...${NC}"
  if ps -p $GO_PID > /dev/null; then
    kill $GO_PID
    echo -e "${GREEN}Backend Go finalizado.${NC}"
  fi
  echo -e "${GREEN}Memoriza.ai encerrado.${NC}"
}

# Registrar a função de cleanup para ser executada ao finalizar
trap cleanup EXIT

# Aguardar o processo npm
wait