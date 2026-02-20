# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files first
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN cd frontend && npm install

# Pass build arguments for Vite environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Set them as environment variables for the build process
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Copy the rest of the frontend source
COPY frontend/ ./frontend/

# Build the application
RUN cd frontend && npm run build

# Production stage
FROM nginx:stable-alpine

# Copy built files from build stage
COPY --from=build /app/frontend/dist /usr/share/nginx/html

# Simple Nginx configuration to handle SPA routing
RUN printf "server {\n    listen 80;\n    location / {\n        root /usr/share/nginx/html;\n        index index.html index.htm;\n        try_files \$uri \$uri/ /index.html;\n    }\n}\n" > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
