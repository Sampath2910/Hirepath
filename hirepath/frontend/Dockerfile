# =============================================================
# Stage 1: Build the Next.js application
# =============================================================
FROM node:18-alpine AS builder
WORKDIR /app

# Declare build argument and env variable for Next.js build-time injection
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# =============================================================
# Stage 2: Production runner
# =============================================================
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy build artifacts and dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Expose Next.js port
EXPOSE 3000

# Start Next.js in production mode
CMD ["npm", "start"]
