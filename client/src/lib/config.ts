interface Config {
  supabaseUrl: string;
  supabaseAnonKey: string;
  goBackendUrl: string;
}

let config: Config | null = null;

export async function getConfig(): Promise<Config> {
  if (config) return config;

  try {
    const response = await fetch("/api/config");
    if (!response.ok) throw new Error("Failed to load config");
    config = await response.json();
    return config;
  } catch (error) {
    console.error("Error loading config:", error);
    // Fallback to development values
    return {
      supabaseUrl: "http://localhost:8080",
      supabaseAnonKey: "",
      goBackendUrl: "http://localhost:8080/api/v1",
    };
  }
}
