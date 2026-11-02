# ── Backend Dockerfile ──────────────────────────────────────
# Experiment 10: Containerize the Express + MongoDB backend
# ────────────────────────────────────────────────────────────

FROM node:20-alpine

LABEL maintainer="ameya0859@gmail.com"
LABEL description="QuickFix Backend – Express REST API + Socket.IO"

# Create app directory
WORKDIR /app

# Copy package files first (better layer caching)
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Expose the backend port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/requests || exit 1

# Start the server
CMD ["node", "server.js"]
