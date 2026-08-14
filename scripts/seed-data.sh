#!/usr/bin/env bash
set -e

# Data Seeding Script for AI Agent Marketplace
# Usage: ./scripts/seed-data.sh [testnet|futurenet|standalone]

NETWORK=${1:-testnet}
echo "🌱 Seeding data for network: $NETWORK..."

if [ ! -f ".contract-id-$NETWORK" ]; then
    echo "❌ Contract ID file .contract-id-$NETWORK not found. Run ./scripts/init-contract.sh $NETWORK first."
    exit 1
fi

CONTRACT_ID=$(cat ".contract-id-$NETWORK")
echo "📍 Using Contract ID: $CONTRACT_ID"

echo "🤖 Registering sample agents..."

# Agent 1
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source-account deployer \
  --network "$NETWORK" \
  -- \
  register_agent \
  --owner "$(stellar keys address deployer)" \
  --name "NeuralScout AI" \
  --description "DeFi liquidity analytics & arbitrage signals agent" \
  --skills '["python", "defi", "ml"]' \
  --price_per_task 150000000 \
  --metadata_uri "ipfs://QmScoutAgentSample" || true

echo "✅ Sample agent registration invoked."
echo "🎉 Seeding step completed!"
