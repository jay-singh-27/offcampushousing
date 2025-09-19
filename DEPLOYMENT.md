# 🚀 OffCampus Housing - DOKS Deployment Guide

This guide covers deploying the OffCampus Housing backend to DigitalOcean Kubernetes Service (DOKS) using GitHub Actions.

## 📋 Prerequisites

### 1. DigitalOcean Setup
- [ ] DOKS cluster created and running
- [ ] Container Registry created (`offcampus-housing`)
- [ ] Access token generated (full access)

### 2. Domain Setup (Optional but Recommended)
- [ ] Domain configured (`api.offcampushousing.app`)
- [ ] DNS pointing to your DOKS load balancer
- [ ] SSL certificate configured

### 3. GitHub Repository Setup
- [ ] Repository pushed to GitHub
- [ ] GitHub secrets configured (see below)

## 🔐 Required GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DIGITALOCEAN_ACCESS_TOKEN` | Your DOKS full access token | `dop_v1_xxxxxxxxxxxxxxxx` |
| `CLUSTER_NAME` | Your DOKS cluster name | `offcampus-housing-cluster` |
| `STRIPE_SECRET_KEY` | Your Stripe secret key | `sk_live_...` or `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook endpoint secret | `whsec_...` |
| `SUPABASE_URL` | Your Supabase project URL | `https://your-project.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## 🏗️ Architecture Overview

```
GitHub → GitHub Actions → Docker Registry → DOKS Cluster
   ↓
Build Docker Image → Push to Registry → Deploy to Kubernetes
```

### Kubernetes Resources Created:
- **Namespace**: `offcampus-housing`
- **Deployment**: `offcampus-housing-backend` (2 replicas)
- **Service**: `offcampus-housing-backend-service`
- **Ingress**: `offcampus-housing-ingress` (with SSL)
- **HPA**: Horizontal Pod Autoscaler (2-10 pods)
- **Secrets**: Environment variables and API keys

## 🚀 Deployment Process

### Automatic Deployment
Deployments trigger automatically on:
- Push to `main` branch (when backend files change)
- Changes to `k8s/` manifests
- Changes to GitHub Actions workflow

### Manual Deployment
1. Push your changes to the `main` branch
2. GitHub Actions will automatically:
   - Build Docker image
   - Push to DigitalOcean Container Registry
   - Deploy to DOKS cluster
   - Verify deployment

## 📊 Monitoring & Verification

### Check Deployment Status
```bash
# Install doctl
curl -sL https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz | tar -xzv
sudo mv doctl /usr/local/bin

# Authenticate
doctl auth init -t YOUR_DO_TOKEN

# Connect to cluster
doctl kubernetes cluster kubeconfig save offcampus-housing-cluster

# Check resources
kubectl get all -n offcampus-housing
kubectl get ingress -n offcampus-housing
kubectl logs -l app=offcampus-housing-backend -n offcampus-housing
```

### Health Checks
- **Health Endpoint**: `https://api.offcampushousing.app/health`
- **Kubernetes Probes**: Liveness and readiness checks configured
- **Auto-scaling**: HPA monitors CPU/memory usage

## 🔧 Configuration

### Environment Variables
All sensitive data is stored as Kubernetes secrets:
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook verification
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_KEY`: Backend service key
- `NODE_ENV`: Set to "production"
- `PORT`: Container port (3000)

### Resource Limits
- **CPU**: 100m request, 500m limit
- **Memory**: 128Mi request, 512Mi limit
- **Replicas**: 2 minimum, 10 maximum (auto-scaling)

## 🛠️ Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check GitHub Actions logs
# Common causes: missing dependencies, Docker build errors
```

#### 2. Deployment Issues
```bash
kubectl describe deployment offcampus-housing-backend -n offcampus-housing
kubectl logs -l app=offcampus-housing-backend -n offcampus-housing
```

#### 3. Ingress/SSL Issues
```bash
kubectl describe ingress offcampus-housing-ingress -n offcampus-housing
# Check cert-manager logs if using Let's Encrypt
```

#### 4. Pod Crashes
```bash
kubectl get pods -n offcampus-housing
kubectl logs <pod-name> -n offcampus-housing
kubectl describe pod <pod-name> -n offcampus-housing
```

### Rollback Deployment
```bash
kubectl rollout undo deployment/offcampus-housing-backend -n offcampus-housing
```

## 📱 Update Mobile App Configuration

After successful deployment, update your mobile app's backend URL:

**File**: `app.json`
```json
{
  "expo": {
    "extra": {
      "backendUrl": "https://api.offcampushousing.app/api"
    }
  }
}
```

## 🔄 CI/CD Pipeline Flow

1. **Code Push** → `main` branch
2. **GitHub Actions Triggered**
3. **Docker Build** → Create container image
4. **Registry Push** → DigitalOcean Container Registry
5. **Kubernetes Deploy** → Update DOKS cluster
6. **Health Check** → Verify deployment
7. **Notification** → Success/failure status

## 📈 Scaling & Performance

### Auto-scaling Triggers
- **CPU Usage**: > 70%
- **Memory Usage**: > 80%
- **Scale Up**: Max 100% increase per minute
- **Scale Down**: Max 50% decrease per 5 minutes

### Manual Scaling
```bash
kubectl scale deployment offcampus-housing-backend --replicas=5 -n offcampus-housing
```

## 🔒 Security Features

- **Non-root container**: Runs as user 1001
- **Read-only filesystem**: Prevents runtime modifications
- **Security context**: Drops all capabilities
- **Network policies**: Ingress-only traffic control
- **Secrets management**: Kubernetes secrets for sensitive data
- **HTTPS enforced**: SSL redirect and CORS configured

---

## 🎯 Next Steps After Deployment

1. **Configure Stripe Webhooks**: Point to `https://api.offcampushousing.app/api/webhooks/stripe`
2. **Update Supabase Auth URLs**: Add production domain to allowed origins
3. **Monitor Logs**: Set up log aggregation and alerting
4. **Set up Monitoring**: Configure Prometheus/Grafana for metrics
5. **Backup Strategy**: Implement database backup procedures

---

**🚨 Important Security Note**: Never commit secrets to your repository. Always use GitHub secrets for sensitive information.
