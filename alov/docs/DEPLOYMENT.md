# Deployment Guide

This guide covers deploying Aether to various platforms.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git repository (for some platforms)

## Environment Variables

Create a `.env.local` file (copy from `.env.example`):

```env
# Optional - for one-click deployment features
NEXT_PUBLIC_VERCEL_CLIENT_ID=your_vercel_client_id
NEXT_PUBLIC_NETLIFY_CLIENT_ID=your_netlify_client_id
```

## Deployment Options

### 1. Vercel (Recommended)

#### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/aether)

#### Manual Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Configuration

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add your environment variables
5. Redeploy

### 2. Netlify

#### Quick Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/aether)

#### Manual Deploy

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

#### Configuration

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your site
3. Go to Site settings → Environment variables
4. Add your environment variables
5. Trigger a new deploy

### 3. Docker

#### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Build and Run

```bash
# Build image
docker build -t aether .

# Run container
docker run -p 3000:3000 aether
```

### 4. Self-Hosted (VPS/Dedicated Server)

#### Using PM2

```bash
# Install PM2
npm i -g pm2

# Build the project
npm run build

# Start with PM2
pm2 start npm --name "aether" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Using Nginx

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. AWS (Amplify)

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Connect your Git repository
4. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
5. Add environment variables
6. Deploy

### 6. Railway

1. Go to [Railway](https://railway.app/)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables
6. Deploy

## Post-Deployment

### 1. Verify Deployment

- Test all features
- Check console for errors
- Test on multiple devices
- Verify environment variables

### 2. Setup Custom Domain

#### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records

#### Netlify
1. Go to Site settings → Domain management
2. Add custom domain
3. Configure DNS records

### 3. Enable HTTPS

Most platforms enable HTTPS automatically. If not:
- Use Let's Encrypt for free SSL certificates
- Configure SSL in your hosting provider

### 4. Setup Monitoring

- Enable error tracking (Sentry, LogRocket)
- Setup uptime monitoring
- Configure analytics

## Performance Optimization

### 1. Enable Caching

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

### 2. Enable Compression

Most platforms enable this by default. For self-hosted:

```bash
# Install compression
npm install compression

# Add to server
const compression = require('compression')
app.use(compression())
```

### 3. Optimize Images

- Use Next.js Image component
- Enable image optimization
- Use WebP format when possible

## Troubleshooting

### Build Fails

1. Check Node.js version (18+)
2. Clear cache: `rm -rf .next node_modules`
3. Reinstall: `npm install`
4. Check for TypeScript errors: `npm run type-check`

### Environment Variables Not Working

1. Verify variable names start with `NEXT_PUBLIC_`
2. Restart development server
3. Clear browser cache
4. Check deployment platform settings

### OAuth Not Working

1. Verify callback URLs are correct
2. Check OAuth credentials
3. Ensure HTTPS is enabled
4. Verify environment variables

## Security Checklist

- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] OAuth credentials secured
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] Backup strategy in place
- [ ] Security headers configured

## Support

For deployment issues:
- Check [docs/guides/](guides/) for troubleshooting
- Open an issue on GitHub
- Review [SECURITY.md](../SECURITY.md) for security concerns

## Next Steps

After deployment:
1. Test all features thoroughly
2. Setup monitoring and analytics
3. Configure backup strategy
4. Review security settings
5. Optimize performance
