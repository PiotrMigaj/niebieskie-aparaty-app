# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable

# Install dependencies
COPY package.json pnpm-lock.yaml ./

# ENV NODE_ENV=production

RUN pnpm install --frozen-lockfile --prod=false

# Copy project files
COPY . .

# Build the application
RUN pnpm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S -G appgroup appuser

# Copy only the necessary files from the build stage
COPY --from=builder /app/.output /app/.output

#Set a volume to persist servers.json data
# VOLUME /app/.output/server/data

# Set the appropriate permissions for the app directory
RUN chown -R appuser:appgroup /app

# Switch to the non-root user
USER appuser

# Expose the port
EXPOSE 3333

# Start the application
CMD ["node", ".output/server/index.mjs"]
