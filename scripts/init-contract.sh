#!/bin/bash
# Initialize the AI Agent Marketplace contract
# Usage: ./scripts/init-contract.sh [testnet|mainnet|futurenet]

set -e

NETWORK=${1:-testnet}
CONTRACT_ALIAS="ai-agent-marketplace"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Load contract ID
CONTRACT_FILE=".contract-id-$NETWORK"
if [ ! -f "$CONTRACT_FILE" ]; then
    echo -e "${RED}❌ Contract ID file not found: $CONTRACT_FILE${NC}"
    echo "Run deploy-contract.sh first"
    exit 1
fi

CONTRACT_ID=$(cat "$CONTRACT_FILE")
echo -e "${YELLOW}🔧 Initializing contract $CONTRACT_ID on $NETWORK...${NC}"

# Network-specific config
case $NETWORK in
    testnet)
        RPC_URL="https://soroban-testnet.stellar.org"
        NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
        USDC_CONTRACT="CBIELSO6KZLFBUSGZ47QRYCYMHK4D2H5IMKBORJGUJVAVKZOQK4D7IAJ"
        ;;
    mainnet)
        RPC_URL="https://soroban-mainnet.stellar.org"
        NETWORK_PASSPHRASE="Public Global Stellar Network ; September 2015"
        USDC_CONTRACT="CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75"
        ;;
    futurenet)
        RPC_URL="https://rpc-futurenet.stellar.org"
        NETWORK_PASSPHRASE="Test SDF Future Network ; October 2022"
        USDC_CONTRACT="CBIELSO6KZLFBUSGZ47QRYCYMHK4D2H5IMKBORJGUJVAVKZOQK4D7IAJ"
        ;;
    *)
        echo -e "${RED}❌ Unknown network: $NETWORK${NC}"
        exit 1
        ;;
esac

# Get admin address (deployer)
ADMIN=$(stellar keys address deployer)

# Initialize
echo -e "${YELLOW}⚙️  Calling initialize()...${NC}"
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source-account deployer \
  --network "$NETWORK" \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  -- \
  initialize \
  --admin "$ADMIN" \
  --usdc_token "$USDC_CONTRACT" \
  --platform_fee_bps 100 \
  --min_job_budget 10000000 \
  --max_job_deadline_days 30 \
  --dispute_window_days 7 \
  --min_agent_reputation 0 \
  --platform_fee_recipient "$ADMIN" \
  --dispute_resolver "$ADMIN" \
  --min_agent_reputation_to_bid 0 \
  --platform_fee_bps_dispute 200 \
  --escrow_expiry_days 30 \
  --skill_verifiers '[]'

echo -e "${GREEN}✅ Contract initialized successfully!${NC}"
echo ""
echo "Configuration:"
echo "  Admin: $ADMIN"
echo "  USDC: $USDC_CONTRACT"
echo "  Platform Fee: 1% (100 bps)"
echo "  Min Job Budget: 10 USDC"
echo "  Max Deadline: 30 days"
echo "  Dispute Window: 7 days"
echo "  Dispute Fee: 2% (200 bps)"
echo "  Escrow Expiry: 30 days"