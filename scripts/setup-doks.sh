#!/bin/bash

# OffCampus Housing DOKS Setup Script
# This script helps set up DigitalOcean Kubernetes Service for the OffCampus Housing app
# Supports both test and production environments

set -e

echo "🚀 OffCampus Housing - Multi-Environment DOKS Setup Script"
echo "=========================================================="

# Default environment
ENVIRONMENT=${1:-"test"}
VALID_ENVIRONMENTS=("test" "prod")

# Check if environment is valid
if [[ ! " ${VALID_ENVIRONMENTS[@]} " =~ " ${ENVIRONMENT} " ]]; then
    echo "❌ Invalid environment: $ENVIRONMENT"
    echo "Valid environments: ${VALID_ENVIRONMENTS[@]}"
    exit 1
fi

echo "🎯 Target Environment: $ENVIRONMENT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_tools() {
    echo "📋 Checking required tools..."
    
    if ! command -v doctl &> /dev/null; then
        echo -e "${RED}❌ doctl is not installed. Please install it first.${NC}"
        echo "   Install: https://docs.digitalocean.com/reference/doctl/how-to/install/"
        exit 1
    fi
    
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}❌ kubectl is not installed. Please install it first.${NC}"
        echo "   Install: https://kubernetes.io/docs/tasks/tools/install-kubectl/"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All required tools are installed${NC}"
}

# Check authentication
check_auth() {
    echo "🔐 Checking DigitalOcean authentication..."
    
    if ! doctl auth list | grep -q "current"; then
        echo -e "${RED}❌ Not authenticated with DigitalOcean${NC}"
        echo "   Run: doctl auth init"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Authenticated with DigitalOcean${NC}"
}

# List available clusters
list_clusters() {
    echo "📋 Available DOKS clusters:"
    doctl kubernetes cluster list
}

# Set environment-specific configurations
set_environment_config() {
    echo "⚙️  Setting up environment-specific configuration..."
    
    if [ "$ENVIRONMENT" = "prod" ]; then
        NAMESPACE="offcampus-housing-prod"
        DEFAULT_CLUSTER="offcampus-housing-cluster-prod"
        DOMAIN="api.offcampushousing.app"
        REPLICAS="3"
    else
        NAMESPACE="offcampus-housing-test"
        DEFAULT_CLUSTER="offcampus-housing-cluster-test"
        DOMAIN="api-test.offcampushousing.app"
        REPLICAS="1"
    fi
    
    echo "📋 Environment Configuration:"
    echo "   Environment: $ENVIRONMENT"
    echo "   Namespace: $NAMESPACE"
    echo "   Domain: $DOMAIN"
    echo "   Replicas: $REPLICAS"
    echo ""
}

# Connect to cluster
connect_cluster() {
    echo "🔗 Connecting to cluster..."
    
    if [ -z "$CLUSTER_NAME" ]; then
        echo -e "${YELLOW}Please provide cluster name (default: $DEFAULT_CLUSTER):${NC}"
        list_clusters
        read -p "Enter cluster name [$DEFAULT_CLUSTER]: " CLUSTER_NAME
        CLUSTER_NAME=${CLUSTER_NAME:-$DEFAULT_CLUSTER}
    fi
    
    doctl kubernetes cluster kubeconfig save $CLUSTER_NAME
    echo -e "${GREEN}✅ Connected to cluster: $CLUSTER_NAME${NC}"
}

# Create environment-specific manifests
create_env_manifests() {
    echo "📝 Creating environment-specific manifests..."
    
    # Create environment-specific directory
    mkdir -p k8s-env
    
    # Copy and modify namespace
    sed "s/name: offcampus-housing/name: $NAMESPACE/" k8s/namespace.yaml > k8s-env/namespace.yaml
    sed -i "s/environment: production/environment: $ENVIRONMENT/" k8s-env/namespace.yaml
    
    # Copy and modify service
    sed "s/namespace: offcampus-housing/namespace: $NAMESPACE/" k8s/service.yaml > k8s-env/service.yaml
    
    # Copy and modify network policy
    sed "s/namespace: offcampus-housing/namespace: $NAMESPACE/" k8s/networkpolicy.yaml > k8s-env/networkpolicy.yaml
    
    # Copy and modify deployment
    sed "s/namespace: offcampus-housing/namespace: $NAMESPACE/" k8s/deployment.yaml > k8s-env/deployment.yaml
    sed -i "s/replicas: 2/replicas: $REPLICAS/" k8s-env/deployment.yaml
    
    # Copy and modify HPA
    sed "s/namespace: offcampus-housing/namespace: $NAMESPACE/" k8s/hpa.yaml > k8s-env/hpa.yaml
    
    # Copy and modify ingress
    sed "s/namespace: offcampus-housing/namespace: $NAMESPACE/" k8s/ingress.yaml > k8s-env/ingress.yaml
    sed -i "s/api.offcampushousing.app/$DOMAIN/g" k8s-env/ingress.yaml
    sed -i "s/secretName: offcampus-housing-tls/secretName: offcampus-housing-$ENVIRONMENT-tls/" k8s-env/ingress.yaml
    
    echo "✅ Environment-specific manifests created"
}

# Create namespace and apply manifests
deploy_app() {
    echo "🚀 Deploying application to $ENVIRONMENT environment..."
    
    # Create environment-specific manifests
    create_env_manifests
    
    # Apply namespace first
    kubectl apply -f k8s-env/namespace.yaml
    echo "✅ Namespace created: $NAMESPACE"
    
    # Apply environment configuration
    kubectl apply -f k8s/environments/$ENVIRONMENT.yaml
    echo "✅ Environment configuration applied"
    
    # Apply service
    kubectl apply -f k8s-env/service.yaml
    echo "✅ Service created"
    
    # Apply network policy
    kubectl apply -f k8s-env/networkpolicy.yaml
    echo "✅ Network policy created"
    
    # Apply deployment (this will fail initially without secrets, but that's ok)
    kubectl apply -f k8s-env/deployment.yaml || echo "⚠️  Deployment created (may fail without secrets)"
    
    # Apply HPA
    kubectl apply -f k8s-env/hpa.yaml
    echo "✅ HPA created"
    
    # Apply ingress
    kubectl apply -f k8s-env/ingress.yaml
    echo "✅ Ingress created"
    
    echo -e "${GREEN}🎉 Application deployed successfully to $ENVIRONMENT environment!${NC}"
}

# Check deployment status
check_status() {
    echo "📊 Checking deployment status for $ENVIRONMENT environment..."
    
    echo "=== Namespace: $NAMESPACE ==="
    kubectl get namespace $NAMESPACE 2>/dev/null || echo "Namespace not found"
    
    echo "=== Pods ==="
    kubectl get pods -n $NAMESPACE
    
    echo "=== Services ==="
    kubectl get services -n $NAMESPACE
    
    echo "=== Ingress ==="
    kubectl get ingress -n $NAMESPACE
    
    echo "=== HPA ==="
    kubectl get hpa -n $NAMESPACE
    
    echo "=== ConfigMaps ==="
    kubectl get configmaps -n $NAMESPACE
}

# Show next steps
show_next_steps() {
    echo ""
    echo "🎯 Next Steps:"
    echo "=============="
    echo "1. Set up GitHub repository secrets:"
    echo "   - DIGITALOCEAN_ACCESS_TOKEN"
    echo "   - CLUSTER_NAME"
    echo "   - STRIPE_SECRET_KEY"
    echo "   - STRIPE_WEBHOOK_SECRET"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_SERVICE_KEY"
    echo ""
    echo "2. Push your code to trigger GitHub Actions deployment"
    echo ""
    echo "3. Configure your domain DNS to point to the load balancer IP:"
    kubectl get ingress offcampus-housing-ingress -n offcampus-housing -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "   (Load balancer IP not ready yet)"
    echo ""
    echo "4. Update your mobile app configuration with the production backend URL"
    echo ""
    echo "📖 For detailed instructions, see DEPLOYMENT.md"
}

# Main execution
main() {
    check_tools
    check_auth
    set_environment_config
    
    case "${2:-deploy}" in
        "list")
            list_clusters
            ;;
        "connect")
            connect_cluster
            ;;
        "deploy")
            connect_cluster
            deploy_app
            check_status
            show_next_steps
            ;;
        "status")
            connect_cluster
            check_status
            ;;
        *)
            echo "Usage: $0 [test|prod] [list|connect|deploy|status]"
            echo ""
            echo "Environments:"
            echo "  test    - Deploy to test environment (default)"
            echo "  prod    - Deploy to production environment"
            echo ""
            echo "Commands:"
            echo "  list    - List available clusters"
            echo "  connect - Connect to a cluster"
            echo "  deploy  - Deploy the application (default)"
            echo "  status  - Check deployment status"
            echo ""
            echo "Examples:"
            echo "  $0 test deploy    - Deploy to test environment"
            echo "  $0 prod deploy    - Deploy to production environment"
            echo "  $0 test status    - Check test environment status"
            ;;
    esac
}

# Run main function with all arguments
main "$@"
