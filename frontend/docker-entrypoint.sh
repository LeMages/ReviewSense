#!/bin/sh
# Process nginx config template (Railway injects PORT)
export PORT=${PORT:-80}
envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Replace placeholders with actual env vars at runtime
sed -i "s|__VITE_API_URL__|${VITE_API_URL:-http://localhost:3000}|g" /usr/share/nginx/html/config.js
sed -i "s|__VITE_GRAPHQL_URL__|${VITE_GRAPHQL_URL:-http://localhost:3000/graphql}|g" /usr/share/nginx/html/config.js

exec nginx -g 'daemon off;'
