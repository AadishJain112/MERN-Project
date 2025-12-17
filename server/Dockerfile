# ============================================
# Backend Dockerfile for CD-STAR
# ============================================
# This file tells Docker how to build your backend container
# Think of it as a recipe for creating your server environment

# Step 1: Choose the base image (Node.js 20 on Alpine Linux - lightweight)
# Alpine is a tiny Linux distribution, perfect for containers
FROM node:20-alpine

# Step 2: Set the working directory inside the container
# All commands will run from this directory
WORKDIR /app

# Step 3: Copy package files first (for better caching)
# Docker caches layers, so if package.json doesn't change, 
# it won't reinstall dependencies
COPY package*.json ./

# Step 4: Install ONLY production dependencies
# --production flag skips devDependencies (like nodemon, jest)
# This makes the image smaller and faster
RUN npm ci --only=production

# Step 5: Copy the rest of the application code
# This includes all your server source files
COPY src/ ./src/

# Step 6: Create uploads directory and set permissions
# This ensures file uploads work correctly
RUN mkdir -p /app/uploads && chmod 755 /app/uploads

# Step 7: Expose port 5000
# This tells Docker which port your app uses
# It doesn't actually publish it - docker-compose will do that
EXPOSE 5000

# Step 8: Set environment to production
ENV NODE_ENV=production

# Step 9: Start the application
# This command runs when the container starts
CMD ["node", "src/index.js"]

