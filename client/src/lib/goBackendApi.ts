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
 * Serviço para geração de flashcards usando o backend Go
 *
 * @param request - Requisição contendo o tópico para gerar flashcards
 * @param authToken - Token de autenticação do usuário
 * @returns Uma promessa que resolve para os flashcards gerados
 */
export async function generateFlashcards(
  request: GenerateFlashcardsRequest,
  authToken: string
): Promise<GenerateFlashcardsResponse> {
  // Convert frontend format to Go backend expected format
  const goRequest: GoGenerateFlashcardsRequest =
    adaptFrontendToGoRequest(request);

  console.log("goRequest", goRequest);
  try {
    // Faz a requisição para o endpoint de geração de flashcards
    const data = await goApiRequest<GenerateFlashcardsResponse>(
      "/flashcards/generate",
      {
        method: "POST",
        body: JSON.stringify(goRequest),
      },
      authToken
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
 * @param authToken - Token de autenticação do usuário
 * @returns Os dados do conjunto de flashcards com seus cartões
 */
export async function getFlashcardSet(setId: string, authToken: string) {
  const response = await goApiRequest(`/flashcardsets/${setId}`, {}, authToken);

  // The API returns { "flashcard_set": {...} }, so we need to extract the object
  if (response && typeof response === "object" && "flashcard_set" in response) {
    return response.flashcard_set;
  }

  return response;
}

/**
 * Obtém todos os flashcards de um conjunto específico
 *
 * @param setId - ID do conjunto de flashcards
 * @param authToken - Token de autenticação do usuário
 * @returns Lista de flashcards do conjunto
 */
export async function getFlashcardsBySetId(setId: string, authToken: string) {
  const response = await goApiRequest(
    `/flashcardsets/${setId}/flashcards`,
    {},
    authToken
  );

  // The API returns { "flashcards": [...] }, so we need to extract the array
  if (response && typeof response === "object" && "flashcards" in response) {
    const flashcards = response.flashcards || [];

    // Verify that flashcards is an array before mapping
    if (Array.isArray(flashcards)) {
      // Convert backend format (question_text, answer_text) to frontend format (question, answer)
      return flashcards.map((flashcard: any) => ({
        id: flashcard.id,
        question: flashcard.question_text,
        answer: flashcard.answer_text,
        topic: "", // Not used in details page
        // Keep original fields for reference if needed
        question_text: flashcard.question_text,
        answer_text: flashcard.answer_text,
        card_order: flashcard.card_order,
        flashcard_set_id: flashcard.flashcard_set_id,
        created_at: flashcard.created_at,
        updated_at: flashcard.updated_at,
      }));
    }
  }

  return [];
}

/**
 * Obtém todos os conjuntos de flashcards de um usuário
 *
 * @param userId - ID do usuário
 * @param authToken - Token de autenticação do usuário
 * @returns Lista de conjuntos de flashcards do usuário
 */
export async function getUserFlashcardSets(userId: string, authToken: string) {
  const response = await goApiRequest(
    `/users/${userId}/flashcardsets`,
    {},
    authToken
  );

  // The API returns { "flashcard_sets": [...] }, so we need to extract the array
  if (
    response &&
    typeof response === "object" &&
    "flashcard_sets" in response
  ) {
    return response.flashcard_sets || [];
  }

  // Fallback: if response is already an array or null/undefined
  return response || [];
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
