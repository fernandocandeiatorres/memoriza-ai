package utils

import "strings"

// stripThinkTagAlternative removes any <think>...</think> segment from the response string.
// It splits the string by "</think>" and returns the part after it if found.
func StripThinkTagAlternative(response string) string {
	parts := strings.Split(response, "</think>")
	if len(parts) > 1 {
		return strings.TrimSpace(parts[1])
	}
	return strings.TrimSpace(response)
}
