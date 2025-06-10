import {
  type GoGenerateFlashcardsRequest,
  type GenerateFlashcardsResponse,
  type GoGenerateFromSummaryRequest,
  type GenerateFlashcardsRequest,
  type GenerateFromSummaryRequest,
  adaptFrontendToGoRequest,
  adaptFrontendToGoSummaryRequest,
} from "@shared/schema";

// URL base do backend Go - acesso direto ao backend
// Podemos usar a URL definida nas variáveis de ambiente ou a URL padrão
const GO_API_BASE_URL =
  import.meta.env.VITE_GO_BACKEND_URL || "http://localhost:8080/api/v1";

// Registra a URL base usada para fins de depuração
console.log(`Backend Go URL: ${GO_API_BASE_URL}`);

/**
 * Realiza uma requisição para o backend Go
 *
 * @param endpoint - O endpoint da API
 * @param options - Opções do fetch (método, corpo, headers)
 * @param authToken - Token de autenticação opcional
 * @returns Os dados da resposta em JSON
 * @throws Erro se a requisição falhar
 */
async function goApiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  authToken?: string
): Promise<T> {
  const url = `${GO_API_BASE_URL}${endpoint}`;

  // Configuração padrão para requisições JSON
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Adiciona o token de autorização se fornecido
  if (authToken) {
    defaultHeaders["Authorization"] = `Bearer ${authToken}`;
  }

  console.log("authToken", authToken);

  const defaultOptions: RequestInit = {
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
  });

  // Se a resposta não for bem-sucedida, lança um erro
  if (!response.ok) {
    let errorMessage = `Erro ${response.status}: ${response.statusText}`;

    try {
      // Tenta extrair a mensagem de erro da resposta
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // Se não conseguir extrair o JSON, usa a mensagem padrão
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Faz uma requisição HTTP genérica para o backend Go
 * @param endpoint - Endpoint da API (ex: '/flashcards/generate')
 * @param authToken - Token de autenticação do usuário
 * @param options - Opções do fetch (método, corpo, headers)
 */
async function makeGoBackendRequest<T>(
  endpoint: string,
  authToken: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl =
    import.meta.env.VITE_GO_BACKEND_URL || "http://localhost:8080";
  const url = `${baseUrl}/api/v1${endpoint}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Backend Go error: ${response.status} - ${errorData}`);
  }

  return response.json() as T;
}

/**
 * Gera flashcards baseados em um tópico usando o backend Go
 * @param request - Dados da requisição (tópico e dificuldade)
 * @param authToken - Token de autenticação do usuário
 * @returns Resposta com o conjunto de flashcards gerado
 */
export async function generateFlashcards(
  request: GenerateFlashcardsRequest,
  authToken: string
): Promise<GenerateFlashcardsResponse> {
  const goRequest = adaptFrontendToGoRequest(request);

  return makeGoBackendRequest<GenerateFlashcardsResponse>(
    "/flashcards/generate",
    authToken,
    {
      method: "POST",
      body: JSON.stringify(goRequest),
    }
  );
}

/**
 * Gera flashcards baseados em resumo/conteúdo usando o backend Go
 * @param request - Dados da requisição (conteúdo, tipo e dificuldade)
 * @param authToken - Token de autenticação do usuário
 * @returns Resposta com o conjunto de flashcards gerado
 */
export async function generateFlashcardsFromSummary(
  request: GenerateFromSummaryRequest,
  authToken: string
): Promise<GenerateFlashcardsResponse> {
  const goRequest = adaptFrontendToGoSummaryRequest(request);

  return makeGoBackendRequest<GenerateFlashcardsResponse>(
    "/flashcards/generate-from-summary",
    authToken,
    {
      method: "POST",
      body: JSON.stringify(goRequest),
    }
  );
}

/**
 * Obtém detalhes de um conjunto de flashcards específico
 * @param setId - ID do conjunto de flashcards
 * @param authToken - Token de autenticação do usuário
 * @returns Detalhes do conjunto de flashcards
 */
export async function getFlashcardSet(
  setId: string,
  authToken: string
): Promise<any> {
  try {
    return makeGoBackendRequest<any>(`/flashcardsets/${setId}`, authToken, {
      method: "GET",
    });
  } catch (error) {
    console.error("Error fetching flashcard set:", error);
    throw new Error("Failed to fetch flashcard set from the server");
  }
}

/**
 * Obtém todos os flashcards de um conjunto específico
 * @param setId - ID do conjunto de flashcards
 * @param authToken - Token de autenticação do usuário
 * @returns Lista de flashcards do conjunto
 */
export async function getFlashcardsBySetId(
  setId: string,
  authToken: string
): Promise<any[]> {
  try {
    const response = await makeGoBackendRequest<{ flashcards: any[] }>(
      `/flashcardsets/${setId}/flashcards`,
      authToken,
      {
        method: "GET",
      }
    );

    return response.flashcards || [];
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    throw new Error("Failed to fetch flashcards from the server");
  }
}

/**
 * Obtém todos os conjuntos de flashcards de um usuário
 * @param userId - ID do usuário
 * @param authToken - Token de autenticação do usuário
 * @returns Lista de conjuntos de flashcards do usuário
 */
export async function getUserFlashcardSets(
  userId: string,
  authToken: string
): Promise<any[]> {
  try {
    const response = await makeGoBackendRequest<{ flashcard_sets: any[] }>(
      `/users/${userId}/flashcardsets`,
      authToken,
      {
        method: "GET",
      }
    );

    return response.flashcard_sets || [];
  } catch (error) {
    console.error("Error fetching user flashcard sets:", error);
    throw new Error("Failed to fetch flashcard sets from the server");
  }
}

/**
 * Obtém flashcards de um usuário por tópico
 *
 * @param userId - ID do usuário
 * @param topic - Tópico dos flashcards
 * @param authToken - Token de autenticação do usuário
 * @returns Lista de flashcards correspondentes ao tópico
 */
export async function getUserFlashcardsByTopic(
  userId: string,
  topic: string,
  authToken: string
) {
  const response = await goApiRequest(
    `/users/${userId}/flashcards-topic?topic=${encodeURIComponent(topic)}`,
    {},
    authToken
  );

  // The API returns { "flashcards": [...] }, so we need to extract the array
  if (response && typeof response === "object" && "flashcards" in response) {
    return response.flashcards || [];
  }

  return response || [];
}
