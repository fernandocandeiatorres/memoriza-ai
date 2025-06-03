import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import http from "http";
import https from "https";
import { generateFlashcardsSchema } from "@shared/schema";
import { log } from "./vite";

// Função para criar um proxy para requisições ao backend Go
function proxyRequest(req: Request, res: Response, targetUrl: string) {
  // Determina qual cliente HTTP usar com base no protocolo
  const httpClient = targetUrl.startsWith("https") ? https : http;

  // Parse URL do backend Go para extrair informações
  const url = new URL(targetUrl);

  // Opcões para a requisição ao backend Go
  const headers = { ...req.headers };
  delete headers["connection"]; // Remove headers que podem causar problemas

  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === "https:" ? 443 : 80),
    path: url.pathname + url.search,
    method: req.method,
    headers: {
      ...headers,
      host: url.host,
    },
  };

  log(`Proxying ${req.method} request to ${targetUrl}`);

  // Cria a requisição para o backend Go
  const proxyReq = httpClient.request(options, (proxyRes) => {
    // Copia os cabeçalhos da resposta do backend Go para a resposta ao cliente
    Object.keys(proxyRes.headers).forEach((key) => {
      const headerValue = proxyRes.headers[key];
      if (headerValue !== undefined) {
        res.setHeader(key, headerValue as string);
      }
    });

    // Define o status da resposta
    res.statusCode = proxyRes.statusCode || 500;

    // Coleta os dados da resposta
    let responseData = "";
    proxyRes.on("data", (chunk) => {
      responseData += chunk;
    });

    // Finaliza a resposta e loga para depuração
    proxyRes.on("end", () => {
      try {
        // Tenta fazer parse do JSON para logar de forma mais legível
        const parsedData = JSON.parse(responseData);
        log(`Proxy response: ${JSON.stringify(parsedData, null, 2)}`);
      } catch {
        // Se não for JSON, apenas loga a resposta como texto
        log(`Proxy response: ${responseData}`);
      }

      res.end(responseData);
    });
  });

  // Trata erros na requisição para o backend Go
  proxyReq.on("error", (err) => {
    log(`Erro no proxy para ${targetUrl}: ${err.message}`);
    res.status(500).json({ error: "Erro ao conectar com o backend Go" });
  });

  // Encaminha o corpo da requisição do cliente para o backend Go
  if (["POST", "PUT", "PATCH"].includes(req.method || "")) {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Rota de fallback para quando o backend Go não estiver disponível
  app.post("/api/flashcards/generate", (req, res) => {
    try {
      const validation = generateFlashcardsSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Invalid request",
          errors: validation.error.errors,
        });
      }

      const { topic } = validation.data;

      // Verifica se devemos tentar usar o backend Go primeiro
      const useGoBackend = process.env.USE_GO_BACKEND === "true";

      if (useGoBackend) {
        // Se estiver configurado para usar o backend Go, encaminha a requisição
        const goBackendUrl =
          process.env.GO_BACKEND_URL || "http://localhost:8080";
        const targetUrl = `${goBackendUrl}/api/v1/flashcards/generate`;

        log(`Redirecionando para backend Go: POST ${targetUrl}`);
        return proxyRequest(req, res, targetUrl);
      }

      // Implementação de fallback (dados simulados)
      log("Usando implementação de fallback para geração de flashcards");
      res.status(200).json({
        message: "Flashcards generated successfully (fallback)",
        topic: topic,
        flashcards: [],
      });
    } catch (error) {
      log(
        `Error generating flashcards: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Proxy para o backend Go - todas as rotas com prefixo /api/v1
  app.use("/api/v1", (req: Request, res: Response) => {
    // URL do backend Go - pode ser carregada de variáveis de ambiente
    const goBackendUrl = process.env.GO_BACKEND_URL || "http://localhost:8080";

    // Constrói a URL completa para o endpoint específico
    const targetUrl = `${goBackendUrl}/api/v1${req.url}`;

    // Encaminha a requisição para o backend Go
    proxyRequest(req, res, targetUrl);
  });

  const httpServer = createServer(app);

  return httpServer;
}
