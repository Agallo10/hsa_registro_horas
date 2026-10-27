interface AppConfig {
  apiUrl?: string;
}

declare global {
  interface Window {
    __APP_CONFIG__?: AppConfig;
  }
}

/**
 * URL base de la API.
 * Prioridad:
 * 1. Configuración en tiempo de ejecución (window.__APP_CONFIG__.apiUrl), inyectada
 *    por el contenedor (frontend/public/config.js).
 * 2. Variable de build VITE_API_URL.
 * 3. Valor por defecto `/api` (mismo origen, vía proxy de nginx o Vite).
 */
export function getApiUrl(): string {
  const runtime = window.__APP_CONFIG__?.apiUrl;
  if (runtime) {
    return runtime;
  }
  const build = import.meta.env.VITE_API_URL as string | undefined;
  if (build) {
    return build;
  }
  return '/api';
}
