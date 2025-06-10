package utils

import (
	"encoding/json"
	"strings"
	"unicode/utf8"

	"github.com/fernandocandeiatorres/memoriza-ai/backend/internal/model"
)

// stripThinkTagAlternative removes any <think>...</think> segment from the response string.
// It splits the string by "</think>" and returns the part after it if found.
func StripThinkTagAlternative(response string) string {
	// First, remove the <think>...</think> portion.
	parts := strings.Split(response, "</think>")
	var cleaned string
	if len(parts) > 1 {
		cleaned = strings.TrimSpace(parts[1])
	} else {
		cleaned = strings.TrimSpace(response)
	}

	// Next, remove the starting "```json" marker if present.
	const startMarker = "```json"
	if strings.HasPrefix(cleaned, startMarker) {
		cleaned = strings.TrimPrefix(cleaned, startMarker)
		cleaned = strings.TrimSpace(cleaned)
	}

	// Finally, remove the ending "```" marker if present.
	const endMarker = "```"
	if strings.HasSuffix(cleaned, endMarker) {
		cleaned = strings.TrimSuffix(cleaned, endMarker)
		cleaned = strings.TrimSpace(cleaned)
	}

	return cleaned
}

// ParseFlashcardsResponse analisa a string JSON e converte os dados para o FlashcardsResponse.
// Se a resposta for um array, ela itera sobre ele e converte cada objeto,
// atribuindo os valores de "front" para QuestionText e "back" para AnswerText,
// além de definir o CardOrder sequencialmente.
func ParseFlashcardsResponse(jsonStr string) (model.FlashcardsResponse, error) {
	jsonStr = strings.TrimSpace(jsonStr)
	
	// Se a resposta começar com '[' é um array.
	// if len(jsonStr) > 0 && jsonStr[0] == '[' {
	var rawCards []model.FlashcardRaw
	if err := json.Unmarshal([]byte(jsonStr), &rawCards); err != nil {
		return model.FlashcardsResponse{}, err
	}

	var cards []model.Flashcard
	for _, r := range rawCards {
		card := model.Flashcard{
			QuestionText:   r.Front, // Mapeamento de front para question_text
			AnswerText:     r.Back,  // Mapeamento de back para answer_text
		}
		cards = append(cards, card)
	}

	return model.FlashcardsResponse{Flashcards: cards}, nil
	// }

	// Se não for um array, assumimos que já está na estrutura esperada.
	// var resp model.FlashcardsResponse
	// err := json.Unmarshal([]byte(jsonStr), &resp)
	// return resp, err
}

// EstimateTokenCount estima aproximadamente o número de tokens em um texto
// Usando uma heurística de ~4 caracteres por token para português
func EstimateTokenCount(text string) int {
	charCount := utf8.RuneCountInString(text)
	return charCount / 4
}

// ChunkContent divide um conteúdo grande em chunks menores que respeitam o limite de tokens
// Mantém contexto tentando quebrar em sentenças completas quando possível
func ChunkContent(content string, maxTokens int) []string {
	if EstimateTokenCount(content) <= maxTokens {
		return []string{content}
	}

	var chunks []string
	maxChars := maxTokens * 4 // Aproximadamente 4 chars por token

	// Tenta dividir por parágrafos primeiro
	paragraphs := strings.Split(content, "\n\n")
	
	var currentChunk string
	for _, paragraph := range paragraphs {
		// Se um parágrafo único já é muito grande, divide por sentenças
		if len(paragraph) > maxChars {
			sentences := SplitIntoSentences(paragraph)
			for _, sentence := range sentences {
				if len(currentChunk)+len(sentence) > maxChars {
					if currentChunk != "" {
						chunks = append(chunks, strings.TrimSpace(currentChunk))
						currentChunk = ""
					}
					// Se uma sentença única é muito grande, força a divisão
					if len(sentence) > maxChars {
						subChunks := ForceChunk(sentence, maxChars)
						chunks = append(chunks, subChunks...)
					} else {
						currentChunk = sentence
					}
				} else {
					if currentChunk != "" {
						currentChunk += " "
					}
					currentChunk += sentence
				}
			}
		} else {
			// Parágrafo cabe, verifica se pode adicionar ao chunk atual
			if len(currentChunk)+len(paragraph) > maxChars {
				if currentChunk != "" {
					chunks = append(chunks, strings.TrimSpace(currentChunk))
					currentChunk = ""
				}
			}
			if currentChunk != "" {
				currentChunk += "\n\n"
			}
			currentChunk += paragraph
		}
	}

	// Adiciona o último chunk se houver conteúdo
	if currentChunk != "" {
		chunks = append(chunks, strings.TrimSpace(currentChunk))
	}

	return chunks
}

// SplitIntoSentences divide um texto em sentenças
func SplitIntoSentences(text string) []string {
	// Marcadores de fim de sentença em português
	sentenceEnders := []string{". ", "! ", "? ", ".\n", "!\n", "?\n"}
	
	sentences := []string{text}
	
	for _, ender := range sentenceEnders {
		var newSentences []string
		for _, sentence := range sentences {
			parts := strings.Split(sentence, ender)
			for i, part := range parts {
				if i < len(parts)-1 {
					part += ender
				}
				if strings.TrimSpace(part) != "" {
					newSentences = append(newSentences, part)
				}
			}
		}
		sentences = newSentences
	}
	
	return sentences
}

// ForceChunk força a divisão de texto muito longo em chunks menores
func ForceChunk(text string, maxChars int) []string {
	var chunks []string
	
	for len(text) > maxChars {
		chunk := text[:maxChars]
		// Tenta quebrar em um espaço próximo ao limite
		if spaceIdx := strings.LastIndex(chunk, " "); spaceIdx > maxChars*3/4 {
			chunk = text[:spaceIdx]
			text = strings.TrimSpace(text[spaceIdx:])
		} else {
			text = text[maxChars:]
		}
		chunks = append(chunks, chunk)
	}
	
	if len(text) > 0 {
		chunks = append(chunks, text)
	}
	
	return chunks
}

// MergeFlashcardResponses combina múltiplas respostas de flashcards em uma única
func MergeFlashcardResponses(responses []model.FlashcardsResponse, targetCount int) model.FlashcardsResponse {
	var allCards []model.Flashcard
	
	for _, response := range responses {
		allCards = append(allCards, response.Flashcards...)
	}
	
	// Se temos mais flashcards do que o necessário, pega os primeiros
	if len(allCards) > targetCount {
		allCards = allCards[:targetCount]
	}
	
	return model.FlashcardsResponse{Flashcards: allCards}
}

