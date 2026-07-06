#!/bin/sh
# Replace placeholders with actual env vars at runtime
sed -i "s|__VITE_API_URL__|${VITE_API_URL:-http://localhost:3000}|g" /usr/share/nginx/html/config.js
sed -i "s|__VITE_GRAPHQL_URL__|${VITE_GRAPHQL_URL:-http://localhost:3000/graphql}|g" /usr/share/nginx/html/config.js
exec nginx -g 'daemon off;'
