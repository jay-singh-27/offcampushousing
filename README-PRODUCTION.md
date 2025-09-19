# 🏠 OffCampus Housing - Production Deployment Guide

This guide covers the complete production deployment setup for the OffCampus Housing application using DigitalOcean Kubernetes Service (DOKS) and GitHub Actions.

## 🚀 Quick Start

After rebasing to commit `8bc252e`, follow these steps to deploy to production:

### 1. Prerequisites Setup

- **DigitalOcean Account**: Create a DOKS cluster and container registry
- **GitHub Repository**: Push your code to GitHub
- **Domain** (optional): Configure DNS for `api.offcampushousing.app`

### 2. Run Setup Script

```bash
# Make the script executable (already done)
chmod +x scripts/setup-doks.sh

# Deploy the application
./scripts/setup-doks.sh deploy
```

### 3. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions:

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `DIGITALOCEAN_ACCESS_TOKEN` | DOKS full access token | ✅ |
| `CLUSTER_NAME` | Your DOKS cluster name | ✅ |
| `STRIPE_SECRET_KEY` | Stripe secret key (test or live) | ✅ |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook endpoint secret | ✅ |
| `SUPABASE_URL` | Your Supabase project URL | ✅ |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | ✅ |

### 4. Deploy

Push to the `main` branch or `feature/deploy` branch to trigger automatic deployment:

```bash
git push origin feature/deploy
```

## 📋 What's New After Rebase

### ✅ Enhanced GitHub Actions Workflow

- **Multi-platform builds**: Optimized for DigitalOcean
- **Docker BuildKit**: Faster builds with layer caching
- **Enhanced health checks**: Better deployment verification
- **Separate test builds**: PR builds without deployment
- **Manual trigger**: `workflow_dispatch` support

### ✅ Improved Kubernetes Manifests

- **Startup probes**: Better container initialization handling
- **Network policies**: Enhanced security
- **DOKS optimizations**: Load balancer health checks
- **Resource optimization**: Better CPU/memory limits
- **Enhanced ingress**: Improved proxy settings

### ✅ Production-Ready Docker Image

- **Signal handling**: Proper shutdown with `dumb-init`
- **Security hardening**: Non-root user, read-only filesystem
- **Optimized builds**: Multi-stage builds, cache optimization
- **Health checks**: Built-in container health monitoring

### ✅ Deployment Automation

- **Setup script**: `scripts/setup-doks.sh` for easy deployment
- **Environment configuration**: Production-ready settings
- **Monitoring**: Enhanced logging and status checks

## 🏗️ Architecture Overview

```
GitHub Repository
       ↓
GitHub Actions (CI/CD)
       ↓
DigitalOcean Container Registry
       ↓
DOKS Cluster (Kubernetes)
       ↓
Production Application
```

### Kubernetes Resources

- **Namespace**: `offcampus-housing`
- **Deployment**: 2-10 replicas with auto-scaling
- **Service**: ClusterIP with health checks
- **Ingress**: NGINX with SSL termination
- **NetworkPolicy**: Security isolation
- **HPA**: CPU/Memory based scaling
- **Secrets**: Environment variables

## 🔧 Configuration Files Updated

### GitHub Actions (`.github/workflows/deploy.yml`)
- Multi-job workflow with build and deploy separation
- Enhanced Docker build with caching
- Comprehensive deployment verification
- Support for both `main` and `feature/deploy` branches

### Kubernetes Manifests (`k8s/`)
- **deployment.yaml**: Enhanced probes and security
- **service.yaml**: DOKS load balancer annotations
- **ingress.yaml**: Production proxy settings
- **networkpolicy.yaml**: Security isolation (NEW)

### Docker Configuration (`backend/Dockerfile`)
- Multi-stage builds for optimization
- Security hardening with non-root user
- Signal handling for graceful shutdowns
- Enhanced health checks

### App Configuration (`app.json`)
- Production backend URL: `https://api.offcampushousing.app/api`
- Environment flag for production builds

## 📊 Monitoring & Operations

### Health Checks
- **Application**: `https://api.offcampushousing.app/health`
- **Kubernetes**: Liveness, readiness, and startup probes
- **Load Balancer**: DOKS health check integration

### Scaling
- **Auto-scaling**: 2-10 pods based on CPU/memory
- **Manual scaling**: `kubectl scale deployment offcampus-housing-backend --replicas=N`

### Logs
```bash
# View application logs
kubectl logs -l app=offcampus-housing-backend -n offcampus-housing

# Follow logs in real-time
kubectl logs -f -l app=offcampus-housing-backend -n offcampus-housing
```

### Status Monitoring
```bash
# Check all resources
kubectl get all -n offcampus-housing

# Check pod status
kubectl describe pods -l app=offcampus-housing-backend -n offcampus-housing

# Check ingress status
kubectl describe ingress offcampus-housing-ingress -n offcampus-housing
```

## 🔒 Security Features

### Container Security
- Non-root user execution
- Read-only root filesystem
- Dropped capabilities
- Security context enforcement

### Network Security
- Network policies for pod isolation
- Ingress-only traffic control
- CORS configuration
- Rate limiting

### Secrets Management
- Kubernetes secrets for sensitive data
- No hardcoded credentials
- Environment-based configuration

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Failures
- Check GitHub Actions logs
- Verify Docker build context
- Ensure all dependencies are in `package.json`

#### 2. Deployment Issues
```bash
# Check deployment status
kubectl rollout status deployment/offcampus-housing-backend -n offcampus-housing

# Check pod events
kubectl get events -n offcampus-housing --sort-by='.lastTimestamp'
```

#### 3. Service Connectivity
```bash
# Test service internally
kubectl run test-pod --image=curlimages/curl -it --rm -- curl http://offcampus-housing-backend-service.offcampus-housing.svc.cluster.local/health
```

#### 4. Ingress Issues
```bash
# Check ingress controller
kubectl get pods -n nginx-ingress

# Check certificate status (if using cert-manager)
kubectl get certificates -n offcampus-housing
```

### Rollback Deployment
```bash
# Rollback to previous version
kubectl rollout undo deployment/offcampus-housing-backend -n offcampus-housing

# Check rollout history
kubectl rollout history deployment/offcampus-housing-backend -n offcampus-housing
```

## 🎯 Post-Deployment Tasks

### 1. Configure External Services

#### Stripe Webhooks
Point your Stripe webhooks to: `https://api.offcampushousing.app/api/webhooks/stripe`

#### Supabase Configuration
Add `https://api.offcampushousing.app` to your Supabase allowed origins.

### 2. DNS Configuration
Point your domain to the load balancer IP:
```bash
kubectl get ingress offcampus-housing-ingress -n offcampus-housing -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

### 3. SSL Certificate
If using cert-manager, SSL certificates will be automatically provisioned.

### 4. Mobile App Configuration
The mobile app is already configured to use the production backend URL.

## 📈 Performance Optimization

### Resource Limits
- **CPU**: 100m request, 500m limit per pod
- **Memory**: 128Mi request, 512Mi limit per pod
- **Auto-scaling**: Based on 70% CPU, 80% memory utilization

### Caching
- Docker layer caching in GitHub Actions
- Kubernetes resource caching
- Application-level caching (implement as needed)

## 🔄 CI/CD Pipeline

### Trigger Conditions
- Push to `main` or `feature/deploy` branch
- Changes to `backend/`, `k8s/`, or workflow files
- Manual trigger via GitHub Actions UI

### Pipeline Steps
1. **Checkout code**
2. **Setup Docker BuildKit**
3. **Authenticate with DOKS**
4. **Build and push container image**
5. **Deploy to Kubernetes**
6. **Verify deployment**
7. **Run health checks**

### Deployment Verification
- Pod readiness checks
- Service endpoint tests
- Ingress connectivity verification
- Application health endpoint validation

---

## 📞 Support

For issues with this deployment:

1. **Check the logs**: Use the monitoring commands above
2. **Review GitHub Actions**: Check the workflow logs
3. **Verify configuration**: Ensure all secrets are set correctly
4. **Test locally**: Use the setup script to debug issues

---

**🎉 Your OffCampus Housing application is now ready for production!**

The deployment includes all the latest improvements from your rebase and is optimized for DigitalOcean Kubernetes Service with robust CI/CD automation.
