# FlowDesk Deployment Guide

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your PostgreSQL credentials
python main.py
```

Backend runs on `http://localhost:8000`

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend runs on `http://localhost:3000`

## Production Deployment on Railway

### Prerequisites
- Railway account (https://railway.app)
- GitHub repository
- PostgreSQL instance

### Setup Steps

1. **Create Railway Project**
   - Go to railway.app
   - Create new project
   - Choose "Deploy from GitHub"

2. **Connect Repository**
   - Link your GitHub repo containing FlowDesk
   - Railway auto-detects from `railway.toml`

3. **Add Services**
   - Database: PostgreSQL
   - Web: Set to /backend directory

4. **Environment Variables**
   Set these in Railway dashboard:
   ```
   DATABASE_URL=<Railway PostgreSQL URL>
   JWT_SECRET=<strong-random-key>
   JWT_REFRESH_SECRET=<strong-random-key>
   ENVIRONMENT=production
   PORT=8000
   FRONTEND_URL=<your-railway-domain>
   ```

5. **Frontend Deployment**
   Option A: Deploy to Vercel
   - Push frontend code to separate repo
   - Connect to Vercel
   - Set `NEXT_PUBLIC_API_URL=https://<your-railway-app>.up.railway.app`

   Option B: Serve from Railway
   - Configure Railway to build frontend
   - Serve static files from FastAPI

6. **Deploy**
   - Push to main branch
   - Railway auto-deploys
   - Check deployment logs for errors

### Health Check
Visit: `https://<your-app>.up.railway.app/api/health`

Should return:
```json
{"status": "ok", "db": "connected"}
```

## Production Checklist

- [ ] Change all `JWT_SECRET` and `JWT_REFRESH_SECRET` to strong random values
- [ ] Set `ENVIRONMENT=production`
- [ ] Use HTTPS only
- [ ] Configure CORS for your domain
- [ ] Set up database backups
- [ ] Configure logging/monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure domain name (custom domain on Railway)
- [ ] Test all endpoints
- [ ] Set up CI/CD pipeline

## Database Migration

For production database:

1. **Create PostgreSQL on Railway**
2. **Get connection string** from Railway dashboard
3. **Set `DATABASE_URL`** in environment variables
4. **Tables auto-create** on app startup

## Monitoring

Check Railway dashboard for:
- Application logs
- CPU/Memory usage
- Request metrics
- Error rates

## Troubleshooting

**App crashes**: Check logs in Railway dashboard

**Database connection fails**: Verify `DATABASE_URL` is correct

**CORS errors**: Ensure `FRONTEND_URL` matches your frontend domain

**Auth issues**: Verify JWT secrets are set correctly

## Scaling

- Railway scales automatically based on plan
- For more capacity, upgrade Railway plan
- Consider CDN for frontend assets
- Add caching layer (Redis) for improved performance

## Security in Production

1. **Secrets Management**
   - Never commit `.env` files
   - Use Railway environment variables
   - Rotate JWT secrets regularly

2. **Database**
   - Enable automatic backups
   - Use strong passwords
   - Restrict network access

3. **API Security**
   - Rate limiting enabled
   - CORS configured
   - Input validation on all endpoints
   - Password hashing with bcrypt

4. **HTTPS**
   - Railway provides free SSL
   - Configure custom domain with SSL

## Custom Domain

1. In Railway dashboard: Project Settings → Domains
2. Add your domain
3. Update DNS records per Railway instructions
4. SSL auto-provisioned

## Rollback

If deployment fails:
1. Go to Railway dashboard
2. Deployments tab
3. Select previous working version
4. Click "Redeploy"

## Support

For Railway support: https://railway.app/support
