// API Configuration
export const API_CONFIG = {
  USE_GO_BACKEND: true,
  GO_BACKEND_URL: "http://localhost:8080",
  SIMULATION_DELAY: 1500, // ms
} as const;

// UI Constants
export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300, // ms
  SCROLL_DELAY: 100, // ms
  TOAST_DURATION: 5000, // ms
} as const;

// Application Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  GENERATOR: "/generator",
  DASHBOARD: "/dashboard",
} as const;

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
} as const;

export const DIFFICULTY_LABELS = {
  [DIFFICULTY_LEVELS.BEGINNER]: "Iniciante",
  [DIFFICULTY_LEVELS.INTERMEDIATE]: "Intermediário",
  [DIFFICULTY_LEVELS.ADVANCED]: "Avançado",
} as const;
