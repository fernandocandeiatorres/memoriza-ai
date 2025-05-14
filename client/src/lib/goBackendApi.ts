import {
  GenerateFlashcardsRequest,
  GenerateFlashcardsResponse,
  GoGenerateFlashcardsRequest,
  adaptFrontendToGoRequest,
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
 * @returns Os dados da resposta em JSON
 * @throws Erro se a requisição falhar
 */
async function goApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${GO_API_BASE_URL}${endpoint}`;

  // Configuração padrão para requisições JSON
  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
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
 * Serviço para geração de flashcards usando o backend Go
 *
 * @param request - Requisição contendo o tópico para gerar flashcards
 * @param userId - ID do usuário
 * @returns Uma promessa que resolve para os flashcards gerados
 */
export async function generateFlashcards(
  request: GenerateFlashcardsRequest,
  userId: string
): Promise<GenerateFlashcardsResponse> {
  // Converte o formato do frontend para o formato esperado pelo Go
  const goRequest: GoGenerateFlashcardsRequest = adaptFrontendToGoRequest(
    request,
    userId
  );
  console.log("goRequest", goRequest);
  try {
    // Faz a requisição para o endpoint de geração de flashcards
    const data = await goApiRequest<GenerateFlashcardsResponse>(
      "/flashcards/generate",
      {
        method: "POST",
        body: JSON.stringify(goRequest),
      }
    );

    return data;
  } catch (error) {
    console.error("Erro ao gerar flashcards:", error);
    throw error;
  }
}

/**
 * Obtém os detalhes de um conjunto de flashcards específico
 *
 * @param setId - ID do conjunto de flashcards
 * @returns Os dados do conjunto de flashcards com seus cartões
 */
export async function getFlashcardSet(setId: string) {
  return goApiRequest(`/flashcardsets/${setId}`);
}

/**
 * Obtém todos os flashcards de um conjunto específico
 *
 * @param setId - ID do conjunto de flashcards
 * @returns Lista de flashcards do conjunto
 */
export async function getFlashcardsBySetId(setId: string) {
  return goApiRequest(`/flashcardsets/${setId}/flashcards`);
}

/**
 * Obtém todos os conjuntos de flashcards de um usuário
 *
 * @param userId - ID do usuário
 * @returns Lista de conjuntos de flashcards do usuário
 */
export async function getUserFlashcardSets(userId: string) {
  return goApiRequest(`/users/${userId}/flashcardsets`);
}

/**
 * Obtém flashcards de um usuário por tópico
 *
 * @param userId - ID do usuário
 * @param topic - Tópico dos flashcards
 * @returns Lista de flashcards correspondentes ao tópico
 */
export async function getUserFlashcardsByTopic(userId: string, topic: string) {
  return goApiRequest(
    `/users/${userId}/flashcards-topic?topic=${encodeURIComponent(topic)}`
  );
}
