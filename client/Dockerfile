# ============================================
# Frontend Dockerfile for CD-STAR
# Multi-stage build for optimal production image
# ============================================
# This uses a "multi-stage build" - we build in one container,
# then copy the result to a smaller container for serving

# ============================================
# STAGE 1: Build the React application
# ============================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for building)
# We need Vite and other build tools in this stage
RUN npm ci

# Copy all source files
COPY . .

# Build the React app for production
# This creates optimized static files in the 'dist' folder
RUN npm run build

# ============================================
# STAGE 2: Serve with Nginx
# ============================================
# Now we switch to a lightweight Nginx image
# We only copy the built files, not Node.js or source code
FROM nginx:alpine

# Copy the built files from Stage 1 to Nginx's html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom Nginx configuration
# This tells Nginx how to serve files and proxy API requests
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (standard HTTP port)
EXPOSE 80

# Nginx starts automatically, so we don't need a CMD
# The base image already has: CMD ["nginx", "-g", "daemon off;"]

