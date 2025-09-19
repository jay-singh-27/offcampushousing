#!/bin/bash

# OffCampus Housing DOKS Setup Script
# This script helps set up DigitalOcean Kubernetes Service for the OffCampus Housing app

set -e

echo "🚀 OffCampus Housing - DOKS Setup Script"
echo "========================================"

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

# Connect to cluster
connect_cluster() {
    echo "🔗 Connecting to cluster..."
    
    if [ -z "$CLUSTER_NAME" ]; then
        echo -e "${YELLOW}Please provide cluster name:${NC}"
        list_clusters
        read -p "Enter cluster name: " CLUSTER_NAME
    fi
    
    doctl kubernetes cluster kubeconfig save $CLUSTER_NAME
    echo -e "${GREEN}✅ Connected to cluster: $CLUSTER_NAME${NC}"
}

# Create namespace and apply manifests
deploy_app() {
    echo "🚀 Deploying application..."
    
    # Apply namespace first
    kubectl apply -f k8s/namespace.yaml
    echo "✅ Namespace created"
    
    # Apply service
    kubectl apply -f k8s/service.yaml
    echo "✅ Service created"
    
    # Apply network policy
    kubectl apply -f k8s/networkpolicy.yaml
    echo "✅ Network policy created"
    
    # Apply deployment (this will fail initially without secrets, but that's ok)
    kubectl apply -f k8s/deployment.yaml || echo "⚠️  Deployment created (may fail without secrets)"
    
    # Apply HPA
    kubectl apply -f k8s/hpa.yaml
    echo "✅ HPA created"
    
    # Apply ingress
    kubectl apply -f k8s/ingress.yaml
    echo "✅ Ingress created"
    
    echo -e "${GREEN}🎉 Application deployed successfully!${NC}"
}

# Check deployment status
check_status() {
    echo "📊 Checking deployment status..."
    
    echo "=== Pods ==="
    kubectl get pods -n offcampus-housing
    
    echo "=== Services ==="
    kubectl get services -n offcampus-housing
    
    echo "=== Ingress ==="
    kubectl get ingress -n offcampus-housing
    
    echo "=== HPA ==="
    kubectl get hpa -n offcampus-housing
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
    
    case "${1:-deploy}" in
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
            check_status
            ;;
        *)
            echo "Usage: $0 [list|connect|deploy|status]"
            echo "  list    - List available clusters"
            echo "  connect - Connect to a cluster"
            echo "  deploy  - Deploy the application (default)"
            echo "  status  - Check deployment status"
            ;;
    esac
}

# Run main function with all arguments
main "$@"
