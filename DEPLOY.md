# Railway Deployment Configuration

## Quick Deploy to Railway (Recommended)

### Option 1: One-Click Deploy
1. Go to [Railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `Div0011/LeadGen` repository
5. Railway will auto-detect the Docker setup
6. Add environment variables:
   - `DB_PASSWORD`: (set your own postgres password)
   - `API_URL`: `https://your-app-name.up.railway.app` (update after deployment)
7. Click Deploy

### Option 2: Railway CLI
```bash
npm install -g railway
railway login
railway init
# Select "Empty Project" 
railway link
railway up
```

### Environment Variables Required
- `DB_PASSWORD`: Your PostgreSQL password (e.g., "my_secure_password_123")
- `API_URL`: Your production URL (e.g., https://leadgen.example.com)

---

## Quick Deploy to Render

### Option 1: Blueprints
1. Go to [Render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New" → "Blueprint"
4. Connect your GitHub and select `Div0011/LeadGen`
5. Update `DB_PASSWORD` in the config
6. Click "Apply"

### Option 2: Manual Setup
1. Create a new Web Service
2. Connect GitHub repo
3. Build Command: `docker-compose up --build`
4. Start Command: Leave empty (using Dockerfile CMD)
5. Add Environment Variables

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_PASSWORD` | PostgreSQL password | `secure_password_123` |
| `API_URL` | Production URL | `https://leadgen.onrender.com` |

---

## Local Development

```bash
# Clone the repo
git clone https://github.com/Div0011/LeadGen.git
cd LeadGen

# Start with Docker
docker-compose up --build

# Or use the startup script
chmod +x start.sh
./start.sh
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

---

## Production URLs After Deployment

- Frontend: `https://your-app-name.railway.app` (or render)
- API: `https://your-app-name.railway.app/api`

Update your frontend environment to use the production API URL in Settings or by setting `NEXT_PUBLIC_API_URL`.