
# Multi-stage build for production
FROM node:18-alpine AS builder

# Install Supabase CLI
RUN npm install -g supabase

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install Supabase CLI in production stage too
RUN npm install -g supabase

# Install serve to run the static files
RUN npm install -g serve

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy Supabase configuration and functions
COPY --from=builder /app/supabase ./supabase

# Copy deployment script
COPY deploy-supabase.sh .
RUN chmod +x deploy-supabase.sh

# Environment variables (these will be set at runtime)
ENV SUPABASE_URL=""
ENV SUPABASE_ANON_KEY=""
ENV SUPABASE_PROJECT_ID=""
ENV SUPABASE_ACCESS_TOKEN=""

# Expose port
EXPOSE 3000

# Create startup script
RUN echo '#!/bin/sh' > start.sh && \
    echo 'echo "Deploying Supabase project..."' >> start.sh && \
    echo './deploy-supabase.sh' >> start.sh && \
    echo 'echo "Starting frontend server..."' >> start.sh && \
    echo 'serve -s dist -l 3000' >> start.sh && \
    chmod +x start.sh

# Start both Supabase deployment and frontend server
CMD ["./start.sh"]
