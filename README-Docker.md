
# Docker Deployment Guide

This setup allows you to run the entire application in a container, including automatic Supabase deployment.

## Prerequisites

1. A Supabase project
2. Supabase access token (get from: https://supabase.com/dashboard/account/tokens)
3. Docker and Docker Compose installed

## Environment Variables Required

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key  
- `SUPABASE_PROJECT_ID`: Your Supabase project ID (from the URL)
- `SUPABASE_ACCESS_TOKEN`: Your Supabase access token

## Quick Start

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials in the `.env` file

3. Build and run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

4. The container will:
   - Deploy all database migrations and RLS policies
   - Deploy all edge functions
   - Start the frontend server on port 3000

## Manual Docker Build

```bash
# Build the image
docker build -t your-app .

# Run the container
docker run -p 3000:3000 \
  -e SUPABASE_URL=your-url \
  -e SUPABASE_ANON_KEY=your-key \
  -e SUPABASE_PROJECT_ID=your-project-id \
  -e SUPABASE_ACCESS_TOKEN=your-token \
  your-app
```

## Manual Steps Still Required

After the container starts successfully, you'll need to manually set in Supabase:

1. **Secrets** (via Supabase Dashboard > Settings > API):
   - OPENAI_API_KEY
   - TURNSTILE_SITE_KEY  
   - TURNSTILE_SECRET_KEY

2. **Auth Configuration** (via Supabase Dashboard > Authentication):
   - Site URL: http://localhost:3000 (or your domain)
   - Redirect URLs: http://localhost:3000/auth/callback

## Production Considerations

- Use Docker secrets or a secure secret management system for production
- Configure proper CORS settings in Supabase
- Set up proper domain and SSL certificates
- Monitor the deployment logs for any issues

## Troubleshooting

- Check container logs: `docker logs <container-id>`
- Verify environment variables are set correctly
- Ensure your Supabase access token has the necessary permissions
- Check Supabase dashboard for deployment status
