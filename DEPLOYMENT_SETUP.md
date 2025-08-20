# 🚀 Deployment Setup Guide - IT Quiz PWA

## Quick Start Checklist

### ✅ Prerequisites
- [ ] GitHub repository configured
- [ ] Vercel account setup
- [ ] Node.js 20+ installed locally
- [ ] NPM/Git configured

### ✅ Required Secrets
Configure these in GitHub repository settings:
```bash
# Deployment secrets
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id  
VERCEL_TOKEN=your_vercel_deployment_token

# Optional monitoring (recommended)
SLACK_WEBHOOK=your_slack_webhook_url
SENTRY_DSN=your_sentry_project_dsn
```

## 📋 Detailed Setup Process

### 1. Local Development Setup

```bash
# Clone and setup project
git clone <repository-url>
cd it-quiz-app

# Install dependencies
npm install

# Setup pre-commit hooks
npm run prepare
npx husky install

# Verify setup
npm run validate
npm run test
```

### 2. Vercel Configuration

#### Get Required IDs:
```bash
# Install Vercel CLI
npm install -g vercel

# Login and get project info
vercel login
vercel link

# Get organization and project IDs
vercel env ls
```

#### Configure GitHub Secrets:
1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add the following repository secrets:
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID  
   - `VERCEL_TOKEN`: Create at https://vercel.com/account/tokens
   - `SLACK_WEBHOOK`: (Optional) For deployment notifications

### 3. First Deployment

```bash
# Test local build
npm run build
npm start

# Validate health endpoint
curl http://localhost:3000/api/health

# Push to trigger deployment
git add .
git commit -m "Setup DevOps pipeline"
git push origin main
```

### 4. Monitoring Setup (Optional but Recommended)

#### Sentry Error Tracking:
1. Create account at https://sentry.io
2. Create new project for Next.js
3. Add `SENTRY_DSN` to GitHub secrets
4. Install Sentry SDK:
```bash
npm install @sentry/nextjs
```

#### Analytics Integration:
1. Add Google Analytics ID to environment variables
2. Configure in monitoring service
3. Enable Web Vitals tracking

## 🔧 Configuration Details

### Environment Variables

#### Production (.env.production)
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_TELEMETRY_DISABLED=1
```

#### Development (.env.development)  
```bash
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Vercel Configuration (vercel.json)
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options", 
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ],
  "functions": {
    "src/app/api/health/route.ts": {
      "maxDuration": 10
    }
  }
}
```

## 🧪 Testing Your Setup

### 1. Verify CI Pipeline
```bash
# Check GitHub Actions
# All workflows should pass:
# - Continuous Integration
# - Security Scan  
# - Deploy (on main branch)
```

### 2. Test Deployments
```bash
# Test staging deployment
git checkout -b feature/test
git push origin feature/test
# Check preview deployment URL

# Test production deployment  
git checkout main
git push origin main
# Check production deployment
```

### 3. Validate Security
```bash
# Check security headers
curl -I https://your-app.vercel.app

# Verify health endpoint
curl https://your-app.vercel.app/api/health

# Test PWA functionality
# - Install prompt should appear
# - Offline page should work
# - Service worker should cache assets
```

## 🎯 Post-Deployment Verification

### Essential Checks:
- [ ] Application loads successfully
- [ ] Health endpoint returns 200
- [ ] PWA install prompt appears
- [ ] Offline functionality works
- [ ] Quiz functionality operates correctly
- [ ] Performance scores >90 (Lighthouse)
- [ ] Security headers present
- [ ] Error tracking configured

### Performance Validation:
```bash
# Run Lighthouse audit
npx lighthouse https://your-app.vercel.app --output html --output-path ./lighthouse-report.html

# Check Web Vitals
# Should show green scores for:
# - Largest Contentful Paint (LCP) < 2.5s
# - First Input Delay (FID) < 100ms  
# - Cumulative Layout Shift (CLS) < 0.1
```

## 🔄 Maintenance Operations

### Regular Tasks:

#### Weekly:
```bash
# Security updates
npm audit --audit-level=high
npm update

# Performance monitoring
# Review Vercel analytics
# Check error rates in Sentry
```

#### Monthly:
```bash
# Dependency updates
npm outdated
npm update

# Bundle analysis
npm run build:analyze

# Review security scan results
# Check GitHub Security tab
```

### Emergency Procedures:

#### Rollback Process:
```bash
# Via GitHub (recommended):
# 1. Go to Actions → Latest deployment
# 2. Click "Re-run failed jobs" on previous successful deployment

# Via Vercel CLI:
vercel rollback [deployment-url]
```

#### Health Check Failure:
```bash
# Check application logs
vercel logs your-app.vercel.app

# Verify database connectivity
# Check external service status
# Review recent deployments
```

## 🚨 Troubleshooting

### Common Issues:

#### Build Failures:
```bash
# TypeScript errors
npm run type-check

# ESLint issues  
npm run lint:fix

# Test failures
npm run test:coverage
```

#### Deployment Issues:
```bash
# Verify secrets are set
echo $VERCEL_TOKEN

# Check Vercel project settings
vercel env ls

# Validate build locally
npm run build
```

#### Performance Issues:
```bash
# Bundle analysis
npm run build:analyze

# Check Core Web Vitals
# Review service worker caching
# Optimize images and assets
```

## 📞 Support Resources

### Documentation:
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

### Monitoring:
- **Application Health**: `https://your-app.vercel.app/api/health`
- **Deployment Status**: GitHub Actions tab
- **Performance Metrics**: Vercel Analytics dashboard
- **Error Tracking**: Sentry dashboard (if configured)

### Emergency Contacts:
- **DevOps Lead**: [Your contact information]
- **Technical Lead**: [Your contact information]  
- **On-call Rotation**: [Your monitoring system]

---

## ✅ Final Verification

After completing setup, verify these key indicators:

1. **🔄 Automation**: Commits trigger automatic deployment
2. **🛡️ Security**: All security scans pass
3. **📊 Monitoring**: Health checks and metrics active  
4. **📱 PWA**: Install prompt and offline mode work
5. **⚡ Performance**: Lighthouse scores >90
6. **🧪 Testing**: All tests pass in CI/CD
7. **🚀 Deployment**: Zero-downtime deployments successful

**Status**: Your IT Quiz PWA is now production-ready with enterprise-grade DevOps practices!

*For additional support or advanced configuration, refer to the detailed DevOps Transformation Report.*