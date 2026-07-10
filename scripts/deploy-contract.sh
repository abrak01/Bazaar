#!/bin/bash
# deploy-contract.sh - Deploy AI Agent Marketplace contract to Stellar

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
NETWORK=${1:-testnet}
CONTRACT_ALIAS="ai-agent-marketplace"
WASM_PATH="contracts/ai-agent-marketplace/target/wasm32-unknown-unknown/release/ai_agent_marketplace.wasm"

echo -e "${GREEN}🚀 AI Agent Marketplace Contract Deployment${NC}"
echo "Network: $NETWORK"
echo ""

# Check prerequisites
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 not found. Please install it first.${NC}"
        exit 1
    fi
}

check_command cargo
check_command stellar
check_command wasm-opt

# Build contract
echo -e "${YELLOW}📦 Building contract...${NC}"
cd contracts/ai-agent-marketplace
cargo build --target wasm32-unknown-unknown --release

# Optimize WASM
echo -e "${YELLOW}⚡ Optimizing WASM...${NC}"
wasm-opt -Oz \
  target/wasm32-unknown-unknown/release/ai_agent_marketplace.wasm \
  -o target/wasm32-unknown-unknown/release/ai_agent_marketplace.opt.wasm

WASM_PATH="target/wasm32-unknown-unknown/release/ai_agent_marketplace.opt.wasm"
cd ../..

# Check WASM size
SIZE=$(wc -c < "$WASM_PATH")
echo -e "${GREEN}✅ WASM size: $((SIZE / 1024)) KB${NC}"

if [ $SIZE -gt 1000000 ]; then
    echo -e "${YELLOW}⚠️  Warning: WASM > 1MB, may exceed deployment limits${NC}"
fi

# Deploy
echo -e "${YELLOW}📤 Deploying to $NETWORK...${NC}"
CONTRACT_ID=$(stellar contract deploy \
  --wasm "$WASM_PATH" \
  --source-account deployer \
  --network "$NETWORK" \
  --alias "$CONTRACT_ALIAS-$NETWORK" \
  2>&1 | tail -1)

echo -e "${GREEN}✅ Contract deployed: $CONTRACT_ID${NC}"

# Save contract ID
echo "$CONTRACT_ID" > ".contract-id-$NETWORK"
echo -e "${GREEN}📝 Contract ID saved to .contract-id-$NETWORK${NC}"

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Initialize contract: ./scripts/init-contract.sh $NETWORK"
echo "2. Update frontend .env.local with contract ID"
echo "3. Deploy frontend: ./scripts/deploy-frontend.sh"