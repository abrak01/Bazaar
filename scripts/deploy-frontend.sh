#!/bin/bash
# deploy-frontend.sh - Deploy frontend to Vercel/Netlify

set -e

ENVIRONMENT=${1:-preview}
PROJECT_DIR="frontend/ai-agent-marketplace"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🌐 Deploying AI Agent Marketplace Frontend${NC}"
echo "Environment: $ENVIRONMENT"
echo ""

cd "$PROJECT_DIR"

# Check for required env vars
if [ "$ENVIRONMENT" = "production" ]; then
    REQUIRED_VARS=("VITE_CONTRACT_ID" "VITE_RPC_URL" "VITE_NETWORK_PASSPHRASE" "VITE_USDC_CONTRACT_ID")
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            echo -e "${RED}❌ Missing required env var: $var${NC}"
            exit 1
        fi
    done
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
pnpm install --frozen-lockfile

# Build
echo -e "${YELLOW}🔨 Building...${NC}"
pnpm build

# Deploy based on platform
if command -v vercel &> /dev/null; then
    echo -e "${YELLOW}🚀 Deploying to Vercel...${NC}"
    if [ "$ENVIRONMENT" = "production" ]; then
        vercel --prod
    else
        vercel
    fi
elif command -v netlify &> /dev/null; then
    echo -e "${YELLOW}🚀 Deploying to Netlify...${NC}"
    if [ "$ENVIRONMENT" = "production" ]]; then
        netlify deploy --prod --dir=dist
    else
        netlify deploy --dir=dist
    fi
else
    echo -e "${RED}❌ No deployment CLI found (vercel or netlify)${NC}"
    echo "Install: npm i -g vercel OR npm i -g netlify-cli"
    exit 1
fi

echo -e "${GREEN}✅ Frontend deployed!${NC}"
cd ../..