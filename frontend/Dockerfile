# =============================================================
# Stage 1: Builder — Install deps & build the production bundle
# =============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Accept VITE_API_URL as a build-time argument (Vite bakes it into the bundle)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copy and install deps first (better Docker layer caching)
COPY package*.json ./
RUN npm install

# Copy full source
COPY . .

# Build the production bundle (outputs to /app/dist)
RUN npm run build

# =============================================================
# Stage 2: Production — Serve the static bundle with Nginx
# =============================================================
FROM nginx:stable-alpine

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config for SPA routing (React Router support)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]