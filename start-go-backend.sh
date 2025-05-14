#!/bin/bash

# Define cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se Go está instalado
if ! command -v go &> /dev/null; then
    echo -e "${RED}Go não está instalado. Por favor, instale Go antes de continuar.${NC}"
    exit 1
fi

# Mostrar banner
echo -e "${GREEN}"
echo "========================================"
echo "       Iniciando Backend Go             "
echo "========================================"
echo -e "${NC}"

# Encerrar qualquer processo existente na porta 8080
echo -e "${YELLOW}Verificando se há processos usando a porta 8080...${NC}"
fuser -k 8080/tcp 2>/dev/null

# Instalar dependências se necessário
echo -e "${YELLOW}Verificando dependências...${NC}"
cd backend
if [ ! -d "vendor" ]; then
    echo -e "${YELLOW}Instalando dependências do projeto...${NC}"
    go mod tidy
    go mod vendor
fi

# Encontrar variáveis disponíveis no arquivo .env
echo -e "${YELLOW}Carregando variáveis de ambiente...${NC}"
if [ -f "../.env" ]; then
    # Exportar variáveis do .env
    export $(grep -v '^#' ../.env | xargs)
    echo -e "${GREEN}Variáveis de ambiente carregadas com sucesso!${NC}"
    
    # Verificar se as variáveis obrigatórias estão definidas
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
    
    # Exportar DATABASE_URL baseado em SUPABASE_DB_URL para o backend Go
    if [ ! -z "$SUPABASE_DB_URL" ]; then
        export DATABASE_URL="$SUPABASE_DB_URL"
        echo -e "${GREEN}✓ DATABASE_URL configurada${NC}"
    fi
else
    echo -e "${RED}Arquivo .env não encontrado!${NC}"
    exit 1
fi

# Iniciar o servidor Go
echo -e "${GREEN}Iniciando o servidor Go...${NC}"
go run cmd/server/main.go