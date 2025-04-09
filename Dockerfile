# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./

RUN npm update -g npm 

# ENV NODE_ENV=production

RUN npm ci --omit=dev

# Copy project files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Runtime
FROM node:20-slim

WORKDIR /app

# Create a non-root user and group
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

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
