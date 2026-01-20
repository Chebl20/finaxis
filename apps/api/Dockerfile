# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install dependencies (ignorando scripts para evitar problemas com husky)
RUN npm install --ignore-scripts

# Copy source code
COPY . .

# Build the application
RUN npm run build -w @finaxis/api

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Desativa o Husky durante a instalação
ENV HUSKY=0

# Install only production dependencies (ignorando scripts)
RUN npm install --production --ignore-scripts

# Copy built application from builder
COPY --from=builder /app/apps/api/dist ./dist

# Create necessary directories
RUN mkdir -p ./logs
RUN mkdir -p ./uploads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port the app runs on
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]
