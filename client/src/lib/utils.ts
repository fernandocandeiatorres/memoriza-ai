import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DIFFICULTY_LABELS, UI_CONSTANTS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-BR");
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getInitials(email: string): string {
  return email.split("@")[0].slice(0, 2).toUpperCase();
}

export function getDifficultyLabel(difficulty: string): string {
  return (
    DIFFICULTY_LABELS[difficulty as keyof typeof DIFFICULTY_LABELS] ||
    difficulty
  );
}

export function scrollToElement(
  elementId: string,
  behavior: ScrollBehavior = "smooth"
): void {
  setTimeout(() => {
    document.getElementById(elementId)?.scrollIntoView({ behavior });
  }, UI_CONSTANTS.SCROLL_DELAY);
}
