# 🏠 OffCampus Housing - Multi-Environment Deployment Guide

This guide covers deploying the OffCampus Housing application to both **test** and **production** environments using DigitalOcean Kubernetes Service (DOKS) and GitHub Actions.

## 🌍 Environment Overview

### Test Environment
- **Purpose**: Development, testing, and staging
- **Namespace**: `offcampus-housing-test`
- **Domain**: `api-test.offcampushousing.app`
- **Resources**: Minimal (1 replica, reduced limits)
- **Branches**: `develop`, `feature/*` branches
- **Stripe**: Test keys
- **Supabase**: Test database

### Production Environment
- **Purpose**: Live application for end users
- **Namespace**: `offcampus-housing-prod`
- **Domain**: `api.offcampushousing.app`
- **Resources**: High availability (3+ replicas, auto-scaling)
- **Branches**: `main` branch
- **Stripe**: Live keys
- **Supabase**: Production database

## 🔐 Required GitHub Secrets

Configure these secrets in your GitHub repository → Settings → Secrets and variables → Actions:

### DigitalOcean Configuration
| Secret Name | Description |
|-------------|-------------|
| `DIGITALOCEAN_ACCESS_TOKEN` | Your DigitalOcean API token |
| `CLUSTER_NAME_TEST` | Test cluster name |
| `CLUSTER_NAME_PROD` | Production cluster name |

### Test Environment Secrets
| Secret Name | Description |
|-------------|-------------|
| `STRIPE_SECRET_KEY_TEST` | Stripe test secret key |
| `STRIPE_WEBHOOK_SECRET_TEST` | Stripe test webhook secret |
| `SUPABASE_URL_TEST` | Test Supabase project URL |
| `SUPABASE_SERVICE_KEY_TEST` | Test Supabase service key |

### Production Environment Secrets
| Secret Name | Description |
|-------------|-------------|
| `STRIPE_SECRET_KEY_PROD` | Stripe live secret key |
| `STRIPE_WEBHOOK_SECRET_PROD` | Stripe live webhook secret |
| `SUPABASE_URL_PROD` | Production Supabase project URL |
| `SUPABASE_SERVICE_KEY_PROD` | Production Supabase service key |

## 🚀 Deployment Methods

### 1. Automatic Deployment (Recommended)

#### Test Environment
- **Trigger**: Push to `develop` or `feature/deploy` branches
- **Target**: Test cluster and namespace
- **Configuration**: Development settings, minimal resources

#### Production Environment
- **Trigger**: Push to `main` branch
- **Target**: Production cluster and namespace
- **Configuration**: Production settings, high availability

### 2. Manual Deployment

Use the GitHub Actions workflow dispatch:

1. Go to **Actions** → **Deploy to DOKS** → **Run workflow**
2. Select branch (any branch)
3. Choose environment: `test` or `prod`
4. Optionally force deployment
5. Click **Run workflow**

### 3. Local Deployment

Use the enhanced setup script:

```bash
# Deploy to test environment
./scripts/setup-doks.sh test deploy

# Deploy to production environment
./scripts/setup-doks.sh prod deploy

# Check test environment status
./scripts/setup-doks.sh test status

# Check production environment status
./scripts/setup-doks.sh prod status
```

## 🏗️ Architecture

### Environment Separation
```
┌─────────────────┐    ┌─────────────────┐
│   Test Cluster   │    │   Prod Cluster   │
│                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   Test NS   │ │    │ │   Prod NS   │ │
│ │ (1 replica) │ │    │ │ (3+ replicas)│ │
│ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘
        │                       │
        ▼                       ▼
api-test.domain.com     api.domain.com
```

### Resource Allocation

| Resource | Test Environment | Production Environment |
|----------|------------------|------------------------|
| **Replicas** | 1 | 3 (auto-scale to 10) |
| **CPU Request** | 50m | 100m |
| **CPU Limit** | 200m | 500m |
| **Memory Request** | 64Mi | 128Mi |
| **Memory Limit** | 256Mi | 512Mi |
| **HPA Min/Max** | 1/3 | 3/10 |
| **HPA CPU Target** | 80% | 70% |
| **HPA Memory Target** | 85% | 80% |

## 🔄 CI/CD Pipeline Flow

### Environment Detection Logic
```yaml
if workflow_dispatch:
    environment = user_input
elif branch == "main":
    environment = "prod"
elif branch == "develop":
    environment = "test"
else:
    environment = "test"  # default for feature branches
```

### Pipeline Steps
1. **Environment Detection** → Determine target environment
2. **Docker Build** → Build and tag with environment
3. **Cluster Connection** → Connect to appropriate cluster
4. **Manifest Generation** → Create environment-specific K8s manifests
5. **Deployment** → Deploy to target namespace
6. **Verification** → Health checks and status validation

## 📊 Monitoring & Verification

### Health Checks

#### Test Environment
- **URL**: `https://api-test.offcampushousing.app/health`
- **Expected**: `{"status": "healthy", "environment": "test"}`

#### Production Environment
- **URL**: `https://api.offcampushousing.app/health`
- **Expected**: `{"status": "healthy", "environment": "production"}`

### Kubernetes Commands

```bash
# Test environment
kubectl get all -n offcampus-housing-test
kubectl logs -l app=offcampus-housing-backend -n offcampus-housing-test

# Production environment
kubectl get all -n offcampus-housing-prod
kubectl logs -l app=offcampus-housing-backend -n offcampus-housing-prod
```

## 🛠️ Configuration Management

### Environment-Specific Files
- `k8s/environments/test.yaml` - Test environment configuration
- `k8s/environments/prod.yaml` - Production environment configuration

### Dynamic Manifest Generation
The deployment process automatically:
- Updates namespaces from `offcampus-housing` to `offcampus-housing-{env}`
- Modifies domains from `api.offcampushousing.app` to environment-specific URLs
- Adjusts replica counts and resource limits
- Updates SSL certificate names
- Sets appropriate environment variables

## 🔒 Security Considerations

### Environment Isolation
- **Separate clusters** for complete isolation (recommended)
- **Separate namespaces** within same cluster (cost-effective)
- **Different secrets** for each environment
- **Network policies** to control traffic

### Secret Management
- Test and production secrets are completely separate
- No cross-environment secret sharing
- Kubernetes secrets are environment-scoped
- GitHub secrets follow naming convention: `{SECRET}_TEST` / `{SECRET}_PROD`

## 🚨 Troubleshooting

### Common Issues

#### Wrong Environment Deployment
```bash
# Check current environment
kubectl get configmap environment-config -n offcampus-housing-test -o yaml
kubectl get configmap environment-config -n offcampus-housing-prod -o yaml

# Verify deployment
kubectl get deployment offcampus-housing-backend -n offcampus-housing-{env} -o yaml
```

#### Environment-Specific Secrets
```bash
# Check if secrets exist
kubectl get secrets -n offcampus-housing-test
kubectl get secrets -n offcampus-housing-prod

# Verify secret content (be careful not to expose in logs)
kubectl describe secret offcampus-housing-secrets -n offcampus-housing-{env}
```

#### Cross-Environment Issues
```bash
# Ensure you're connected to the right cluster
kubectl config current-context

# List all namespaces to verify environment separation
kubectl get namespaces | grep offcampus-housing
```

### Rollback Procedures

#### Test Environment
```bash
kubectl rollout undo deployment/offcampus-housing-backend -n offcampus-housing-test
```

#### Production Environment
```bash
# More careful rollback for production
kubectl rollout history deployment/offcampus-housing-backend -n offcampus-housing-prod
kubectl rollout undo deployment/offcampus-housing-backend -n offcampus-housing-prod --to-revision=2
```

## 🎯 Best Practices

### Development Workflow
1. **Feature Development** → Deploy to test environment
2. **Testing & QA** → Validate in test environment
3. **Code Review** → Pull request with test environment validation
4. **Production Deploy** → Merge to main triggers production deployment

### Environment Promotion
1. Test changes in **test environment** first
2. Validate functionality and performance
3. Promote to **production** only after thorough testing
4. Monitor production deployment closely

### Resource Management
- **Test**: Keep minimal resources to reduce costs
- **Production**: Ensure adequate resources for expected load
- **Auto-scaling**: Configure appropriate limits for each environment

## 📱 Mobile App Configuration

The mobile app will automatically use the correct backend URL based on the build configuration:

### Test Builds
```json
{
  "expo": {
    "extra": {
      "backendUrl": "https://api-test.offcampushousing.app/api",
      "environment": "test"
    }
  }
}
```

### Production Builds
```json
{
  "expo": {
    "extra": {
      "backendUrl": "https://api.offcampushousing.app/api",
      "environment": "production"
    }
  }
}
```

## 🎉 Summary

This multi-environment setup provides:

✅ **Complete environment isolation**
✅ **Automated deployments** based on branch
✅ **Manual deployment control** via GitHub Actions
✅ **Resource optimization** per environment
✅ **Comprehensive monitoring** and health checks
✅ **Easy troubleshooting** and rollback procedures
✅ **Security best practices** with separate secrets

Your OffCampus Housing application now supports robust test and production environments with full CI/CD automation! 🚀
