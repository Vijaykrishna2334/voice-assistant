# Deployment Guide

## Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key

## Local Development Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb ai_companion

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env with your database URL and OpenAI API key
# DATABASE_URL="postgresql://user:password@localhost:5432/ai_companion"
# OPENAI_API_KEY="your-key-here"

# Run Prisma migrations
cd backend
npx prisma migrate dev
npx prisma generate
cd ..
```

### 3. Run Development Servers

```bash
# Run both frontend and backend
npm run dev

# Or run separately:
# Terminal 1 - Backend (port 3001)
cd backend && npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend && npm run dev
```

Visit http://localhost:5173 to access the application.

## Production Deployment

### Backend Deployment (Railway/Render)

1. Push code to GitHub
2. Connect repository to Railway/Render
3. Set environment variables:
   - `DATABASE_URL`
   - `OPENAI_API_KEY`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `PORT=3001`
4. Deploy from `backend` directory

### Frontend Deployment (Vercel)

1. Connect repository to Vercel
2. Set build configuration:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `frontend`
3. Set environment variable:
   - `VITE_API_URL=https://your-backend-url.com`
4. Deploy

### Database (Supabase/Neon)

1. Create PostgreSQL database on Supabase or Neon
2. Copy connection string
3. Update `DATABASE_URL` in backend environment variables
4. Run migrations: `npx prisma migrate deploy`

## Environment Variables

### Backend

```env
PORT=3001
NODE_ENV=production
DATABASE_URL="postgresql://..."
OPENAI_API_KEY="sk-..."
JWT_SECRET="random-secure-string"
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Frontend

```env
VITE_API_URL=https://your-backend-domain.com
```

## Post-Deployment Checklist

- [ ] Test user registration and login
- [ ] Test conversation creation and messaging
- [ ] Test voice input/output (requires HTTPS)
- [ ] Test document upload
- [ ] Verify database migrations applied
- [ ] Check API response times (<3s target)
- [ ] Monitor error logs
- [ ] Set up SSL/HTTPS for both frontend and backend
- [ ] Configure CORS properly
- [ ] Set up database backups

## Monitoring

- Monitor OpenAI API usage and costs
- Track database storage usage
- Monitor server logs for errors
- Set up alerts for downtime

## Scaling Considerations

- Use PostgreSQL connection pooling (Prisma handles this)
- Consider Redis for session storage
- Implement rate limiting
- Use CDN for frontend assets
- Consider websockets for real-time features
