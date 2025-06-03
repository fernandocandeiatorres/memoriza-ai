const isDevelopment = import.meta.env.DEV;

export const logger = {
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, data ? data : "");
    }
  },
  info: (message: string, data?: any) => {
    console.info(`[INFO] ${message}`, data ? data : "");
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data ? data : "");
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error ? error : "");
  },
};
