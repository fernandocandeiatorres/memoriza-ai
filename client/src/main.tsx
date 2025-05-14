import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./theme-override.css"; // Importando nosso override de tema com a cor turquesa

// Add custom document title
document.title = "Memoriza.ai - Medical Flashcards";

createRoot(document.getElementById("root")!).render(<App />);
