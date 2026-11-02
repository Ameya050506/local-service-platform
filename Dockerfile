# ── Frontend Dockerfile (Multi-Stage) ───────────────────────
# Experiment 10: Containerize the React + Vite frontend
# ────────────────────────────────────────────────────────────

# ── Stage 1: Build ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Accept API URL as build-time argument
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

# Copy package files (better layer caching)
COPY package.json package-lock.json* ./

# Install all dependencies (need devDeps for build)
RUN npm ci

# Copy source files
COPY index.html vite.config.js tailwind.config.js postcss.config.js ./
COPY public/ public/
COPY src/ src/

# Build production bundle
RUN npm run build

# ── Stage 2: Serve with Nginx ──────────────────────────────
FROM nginx:alpine

LABEL maintainer="ameya0859@gmail.com"
LABEL description="QuickFix Frontend – React SPA served by Nginx"

# Copy custom Nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
