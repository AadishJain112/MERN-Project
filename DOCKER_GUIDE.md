# 🐳 Docker Guide for CD-STAR - Beginner Friendly

## What is Docker?

Docker is like a shipping container for your application. Just like how shipping containers can be moved between ships, trucks, and trains without changing what's inside, Docker containers can run on any computer with Docker installed.

### Key Concepts:

1. **Dockerfile**: A recipe that tells Docker how to build your application
2. **Image**: A snapshot of your application (like a template)
3. **Container**: A running instance of an image (like a running application)
4. **Docker Compose**: A tool to run multiple containers together

---

## 📁 File Structure

```
MERN-Project/
├── server/
│   ├── Dockerfile          ← Backend container recipe
│   ├── .dockerignore        ← Files to exclude from backend build
│   └── src/                 ← Your backend code
├── client/
│   ├── Dockerfile           ← Frontend container recipe
│   ├── .dockerignore        ← Files to exclude from frontend build
│   ├── nginx.conf           ← Nginx web server configuration
│   └── src/                 ← Your frontend code
├── docker-compose.yml       ← Orchestrates all containers
└── .env                     ← Environment variables (create this)
```

---

## 🚀 Step-by-Step Commands

### Prerequisites

Make sure Docker and Docker Compose are installed:
```bash
docker --version
docker-compose --version
```

### Step 1: Create Environment File

Create a `.env` file in the root directory:

```bash
# .env file
MONGO_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Example MONGO_URI:**
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cdstar?retryWrites=true&w=majority
```

### Step 2: Build the Docker Images

This creates the images (templates) for your containers:

```bash
# Build both images at once
docker-compose build

# Or build individually
docker-compose build backend
docker-compose build frontend
```

**What happens:**
- Docker reads the Dockerfiles
- Installs dependencies
- Builds your application
- Creates images named `mernproject-backend` and `mernproject-frontend`

### Step 3: Start the Containers

This starts your application:

```bash
# Start all containers
docker-compose up

# Or run in background (detached mode)
docker-compose up -d
```

**What happens:**
- Backend container starts on port 5000
- Frontend container starts on port 80
- They can communicate with each other

### Step 4: Access Your Application

- **Frontend**: Open http://localhost in your browser
- **Backend API**: http://localhost:5000/api

---

## 🛠️ Common Commands

### View Running Containers
```bash
docker-compose ps
```

### View Logs
```bash
# All containers
docker-compose logs

# Specific container
docker-compose logs backend
docker-compose logs frontend

# Follow logs (like tail -f)
docker-compose logs -f
```

### Stop Containers
```bash
# Stop containers (keeps them)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop, remove containers AND volumes
docker-compose down -v
```

### Rebuild After Code Changes
```bash
# Rebuild and restart
docker-compose up --build

# Or rebuild specific service
docker-compose build backend
docker-compose up -d backend
```

### Execute Commands Inside Container
```bash
# Open shell in backend container
docker-compose exec backend sh

# Open shell in frontend container
docker-compose exec frontend sh
```

### View Container Details
```bash
# Inspect backend container
docker inspect cdstar-backend

# View resource usage
docker stats
```

---

## 🔍 Troubleshooting

### Problem: Port Already in Use

**Error:** `Bind for 0.0.0.0:5000 failed: port is already allocated`

**Solution:**
```bash
# Find what's using the port
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux

# Stop the process or change port in docker-compose.yml
```

### Problem: Cannot Connect to MongoDB

**Error:** `MongooseError: connect ECONNREFUSED`

**Solution:**
1. Check your `MONGO_URI` in `.env` file
2. Make sure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
3. Verify your MongoDB username/password are correct

### Problem: Frontend Can't Reach Backend

**Error:** `Network request failed` or `CORS error`

**Solution:**
1. Check that both containers are running: `docker-compose ps`
2. Verify backend is healthy: `docker-compose logs backend`
3. Check nginx.conf has correct proxy_pass URL

### Problem: File Uploads Not Working

**Error:** Files not saving or not accessible

**Solution:**
1. Check uploads volume is mounted: `docker-compose exec backend ls -la /app/uploads`
2. Verify permissions: `docker-compose exec backend chmod 755 /app/uploads`

### Problem: Changes Not Reflecting

**Solution:**
```bash
# Rebuild containers
docker-compose up --build

# Or restart specific service
docker-compose restart backend
```

---

## 📊 Understanding Docker Compose

### Services

Each service in `docker-compose.yml` becomes a container:

- **backend**: Your Node.js API server
- **frontend**: Your React app served by Nginx

### Networks

All services are on the same network (`cdstar-network`), so they can communicate using service names:
- Frontend can reach backend at `http://backend:5000`
- Backend can reach frontend at `http://frontend:80`

### Volumes

Volumes persist data outside containers:
- `./server/uploads:/app/uploads` - Uploads folder persists on your computer

### Ports

Port mapping format: `host_port:container_port`
- `5000:5000` - Access backend at localhost:5000
- `80:80` - Access frontend at localhost (port 80)

---

## 🎯 Production Deployment Tips

1. **Environment Variables**: Never commit `.env` file to Git
2. **Secrets**: Use Docker secrets or environment variables for sensitive data
3. **Health Checks**: Already configured in docker-compose.yml
4. **Restart Policy**: `unless-stopped` ensures containers restart automatically
5. **Resource Limits**: Add CPU/memory limits for production:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```

---

## 📚 Additional Resources

- [Docker Official Docs](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## ✅ Quick Reference

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Rebuild after code changes
docker-compose up --build -d

# Check status
docker-compose ps
```

---

**Happy Dockerizing! 🐳**

