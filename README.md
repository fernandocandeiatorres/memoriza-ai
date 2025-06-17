# Memoriza.ai - Gerador de Flashcards para Medicina

Aplicação web moderna que gera automaticamente flashcards para estudantes de medicina, com capacidade de selecionar o nível de dificuldade dos flashcards.

![Memoriza.ai](./generated-icon.png)

## Guia Rápido de Inicialização

Siga estes passos para executar a aplicação em seu ambiente Replit:

1. **Inicie a Aplicação**

   - Clique no botão ▶️ (Run) no topo da página Replit
   - Ou execute o workflow via terminal: `npm run dev`
   - A aplicação ficará disponível em poucos segundos no painel da web
   - Para iniciar backend Go real: `go run cmd/server/main.go`

2. **Configure a API DeepSeek (Opcional para modo real)**

   - Se desejar usar o backend Go com a API DeepSeek para geração real de flashcards, adicione a chave no painel "Secrets" no Replit:
     - Nome: `DEEPISEEK_API_KEY`
     - Valor: Sua chave da API DeepSeek

3. **Alternar Entre Modo Real e Modo Demo**
   - Por padrão, a aplicação usa dados de demonstração (mock)
   - Para usar o backend real (requer `DEEPISEEK_API_KEY`), edite o arquivo `client/src/pages/Generator.tsx` e altere a constante `USE_GO_BACKEND = true`

## Estrutura do Projeto

```
memoriza-ai/
│
├── backend/              # Servidor Go para geração de flashcards
│   └── ...               # Código em Go (Gin framework)
│
├── client/               # Frontend React
│   ├── src/
│   │   ├── components/   # Componentes de UI
│   │   ├── lib/          # Utilitários e API clients
│   │   ├── pages/        # Páginas da aplicação
│   │   └── ...           # Arquivos de configuração React
│   └── ...
│
├── server/               # Servidor Express (proxy e servidor estático)
│   └── ...
│
├── shared/               # Código compartilhado entre frontend e backend
│   └── schema.ts         # Esquemas de dados e tipos
│
├── package.json          # Dependências e scripts
├── start-go-backend.sh   # Script para iniciar o backend Go
├── start-servers.sh      # Script para iniciar ambos os servidores
└── README.md             # Este arquivo
```

## Funcionalidades Principais

- 🔍 **Geração de Flashcards por Tópico**: Insira um tópico médico e selecione o nível de dificuldade
- 📄 **Geração de Flashcards por Resumo**: Envie resumos, PDFs ou imagens para gerar flashcards baseados no conteúdo
- 📱 **Responsivo**: Interface adaptada para dispositivos móveis e desktop
- 📊 **Indicadores Visuais**: Cada nível de dificuldade utiliza cores distintas
- 🔄 **Navegação Intuitiva**: Controles para navegar entre os flashcards gerados
- 📁 **Suporte a Múltiplos Formatos**: Texto, PDF e imagens (JPG, PNG, WebP)

## Modos de Geração

### 1. Geração por Tópico

- Insira um tópico específico (ex: "Cardiologia", "Farmacologia")
- Selecione o nível de dificuldade (Iniciante, Intermediário, Avançado)
- Gera 10 flashcards focados no tópico escolhido

### 2. Geração por Resumo (NOVA FUNCIONALIDADE)

- **Texto**: Cole seus resumos, anotações ou material de estudo
- **PDF**: Faça upload de documentos PDF com conteúdo médico
- **Imagem**: Envie fotos de livros, slides ou anotações manuscritas
- Selecione o nível de dificuldade desejado
- Gera 10 flashcards baseados no conteúdo fornecido

### Formatos Suportados

- **Texto**: Qualquer texto colado diretamente
- **PDF**: Arquivos PDF até 10MB
- **Imagens**: JPG, PNG, WebP até 10MB

## Desenvolvimento

### Servidor Frontend (Express + React)

O servidor Express é iniciado automaticamente quando você executa `npm run dev` e serve:

- O aplicativo React compilado pelo Vite
- Um proxy para o backend Go (quando ativado)

### Backend Go

O backend Go é responsável por:

- Processamento das solicitações de geração de flashcards
- Comunicação com a API DeepSeek
- Armazenamento de dados (opcional, via Supabase)

### Variáveis de Ambiente

- `DEEPISEEK_API_KEY`: Chave para a API DeepSeek (necessária para o modo real)
- `FRONTEND_GO_BACKEND_URL`: URL para o backend Go (padrão: http://localhost:8080/api/v1)

## Modo de Demonstração vs. Modo Real

A aplicação pode funcionar em dois modos:

1. **Modo Demonstração** (padrão):

   - Usa dados fictícios gerados localmente
   - Não requer API DeepSeek
   - Ótimo para testes rápidos da interface

2. **Modo Real**:
   - Usa o backend Go para gerar flashcards via API DeepSeek
   - Requer uma chave de API DeepSeek válida
   - Produz flashcards mais relevantes e precisos

Para alternar entre os modos, edite a constante `USE_GO_BACKEND` em `client/src/pages/Generator.tsx`.

## Problemas Comuns

- **Erro ao gerar flashcards**: Verifique se a chave `DEEPISEEK_API_KEY` está configurada corretamente (quando em modo real)
- **Backend Go não responde**: Verifique se o servidor Go está rodando e acessível na porta 8080
- **Alterações não aparecem**: A aplicação pode precisar ser reiniciada quando você faz alterações em arquivos fora da pasta `client/src`
