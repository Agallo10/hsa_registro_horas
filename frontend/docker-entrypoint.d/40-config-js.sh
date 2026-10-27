#!/bin/sh
set -e

# Genera la configuración de la SPA en tiempo de ejecución.
# API_URL puede ser:
#   - /api                  -> usa el proxy de nginx hacia el backend (recomendado)
#   - http://host:puerto/api -> llamada directa (requiere CORS en el backend)
API_URL_VALUE="${API_URL:-/api}"

cat > /usr/share/nginx/html/config.js <<EOF
window.__APP_CONFIG__ = { apiUrl: "${API_URL_VALUE}" };
EOF

echo "config.js generado con apiUrl=${API_URL_VALUE}"
