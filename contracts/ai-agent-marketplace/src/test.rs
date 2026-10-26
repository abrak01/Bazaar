//! Integration tests for AI Agent Marketplace contract

#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    Address, BytesN, Env, IntoVal, String, Vec, Map, symbol_short,
    token::{Client as TokenClient, StellarAssetClient as TokenAdminClient},
};

fn create_token_contract(e: &Env) -> TokenClient {
    let admin = Address::generate(e);
    TokenAdminClient::new(e, &e.register_stellar_asset_contract_v2(admin.clone()))
}

fn create_marketplace_contract<'a>(
    e: &Env,
    admin: &Address,
    usdc: &Address,
) -> AiAgentMarketplaceClient<'a> {
    let contract_id = e.register_contract(None, AiAgentMarketplace);
    let client = AiAgentMarketplaceClient::new(e, &contract_id);

    client.initialize(
        admin,
        usdc,
        &100,           // platform_fee_bps (1%)
        &10_000_000,    // min_job_budget (10 USDC)
        &30,            // max_job_deadline_days
        &7,             // dispute_window_days
        &0,             // min_agent_reputation
        admin,
        admin,          // dispute_resolver
        &0,             // min_agent_reputation_to_bid
        &200,           // platform_fee_bps_dispute (2%)
        &30,            // escrow_expiry_days
        &Vec::new(e),   // skill_verifiers
    );

    client
}

#[test]
fn test_register_agent() {
    let e = Env::default();
    e.mock_all_auths();

    let admin = Address::generate(&e);
    let owner = Address::generate(&e);
    let usdc = create_token_contract(&e);
    let client = create_marketplace_contract(&e, &admin, &usdc.address());

    let agent_id = client.register_agent(
        &owner,
        &String::from_str(&e, "Test Agent"),
        &String::from_str(&e, "Description"),
        &Vec::from_array(&e, [String::from_str(&e, "python")]),
        &50_000_000, // 50 USDC
        &String::from_str(&e, "ipfs://QmTest"),
    );

    assert_eq!(agent_id, 1);

    let agent = client.get_agent(&agent_id);
    assert_eq!(agent.owner, owner);
    assert_eq!(agent.name, String::from_str(&e, "Test Agent"));
    assert_eq!(agent.price_per_task, 50_000_000);
    assert!(agent.is_active);
}

#[test]
fn test_post_job() {
    let e = Env::default();
    e.mock_all_auths();

    let admin = Address::generate(&e);
    let client_addr = Address::generate(&e);
    let usdc = create_token_contract(&e);
    let client = create_marketplace_contract(&e, &admin, &usdc.address());

    let job_id = client.post_job(
        &client_addr,
        &String::from_str(&e, "Test Job"),
        &String::from_str(&e, "Description"),
        &Vec::from_array(&e, [String::from_str(&e, "python")]),
        &100_000_000, // 100 USDC
        &14,
    );

    assert_eq!(job_id, 1);

    let job = client.get_job(&job_id);
    assert_eq!(job.client, client_addr);
    assert_eq!(job.budget, 100_000_000);
    assert_eq!(job.status, JobStatus::Open);
}

#[test]
fn test_place_bid() {
    let e = Env::default();
    e.mock_all_auths();

    let admin = Address::generate(&e);
    let client_addr = Address::generate(&e);
    let agent_owner = Address::generate(&e);
    let usdc = create_token_contract(&e);
    let marketplace = create_marketplace_contract(&e, &admin, &usdc.address());

    // Register agent
    let agent_id = marketplace.register_agent(
        &agent_owner,
        &String::from_str(&e, "Agent"),
        &String::from_str(&e, "Desc"),
        &Vec::from_array(&e, [String::from_str(&e, "python")]),
        &50_000_000,
        &String::from_str(&e, "ipfs://QmTest"),
    );

    // Post job
    let job_id = marketplace.post_job(
        &client_addr,
        &String::from_str(&e, "Job"),
        &String::from_str(&e, "Desc"),
        &Vec::from_array(&e, [String::from_str(&e, "python")]),
        &100_000_000,
        &14,
    );

    // Place bid
    let bid_id = marketplace.place_bid(
        &agent_owner,
        &job_id,
        &80_000_000, // 80 USDC
        &7,
        &String::from_str(&e, "Proposal"),
    );

    assert_eq!(bid_id, 1);

    let bid = marketplace.get_bid(&bid_id);
    assert_eq!(bid.agent, agent_owner);
    assert_eq!(bid.amount, 80_000_000);
    assert_eq!(bid.status, BidStatus::Pending);
}

#[test]
fn test_accept_bid_and_escrow() {
    let e = Env::default();
    e.mock_all_auths();

    let admin = Address::generate(&e);
    let client_addr = Address::generate(&e);
    let agent_owner = Address::generate(&e);
    let usdc = create_token_contract(&e);
    let marketplace = create_marketplace_contract(&e, &admin, &usdc.address());
    let usdc_client = TokenClient::new(&e, &usdc.address());

    // Setup: mint USDC to client
    let admin_client = TokenAdminClient::new(&e, &usdc.address());
    admin_client.mint(&client_addr, &100_000_000);

    // Register agent
    let agent_id = marketplace.register_agent(
        &agent_owner,
        &String::from_str(&e, "Agent"),
        &String::from_str(&e, "Desc"),
        &Vec::from_array(&e, [String::from_str(&e, "python")]),
        &50_000_000,
        &String::from_str(&e, "ipfs://QmTest"),
    );

    // Post job
    let job_id = marketplace.post_job(
        &client_addr,
        &String::from_str(&e, "Job"),
        &String::from_str(&e, "Desc"),
        &Vec::from_array(&e, [String::from_str(&e, "python")]),
        &100_000_000,
        &14,
    );

    // Place bid
    let bid_id = marketplace.place_bid(
        &agent_owner,
        &job_id,
        &80_000_000,
        &7,
        &String::from_str(&e, "Proposal"),
    );

    // Accept bid (funds escrow)
    marketplace.accept_bid(&client_addr, &job_id, &bid_id);

    // Check escrow
    let job = marketplace.get_job(&job_id);
    assert_eq!(job.status, JobStatus::InProgress);
    assert_eq!(job.assigned_agent, Some(agent_owner.clone()));
    assert_eq!(job.escrow_amount, 81_000_000); // 80M + 1% fee

    // Check balances
    assert_eq!(usdc_client.balance(&client_addr), 19_000_000); // 100M - 81M
    assert_eq!(usdc_client.balance(&marketplace.env().current_contract_address()), 81_000_000);

    // Check platform fee went to recipient
    assert_eq!(usdc_client.balance(&admin), 1_000_000); // 1% fee
}

#[test]
fn test_complete_job_flow() {
    let e = Env::default();
    e.mock_all_auths();

    let admin = Address::generate(&e);
    let client_addr = Address::generate(&e);
    let agent_owner = Address::generate(&e);
    let usdc = create_token_contract(&e);
    let marketplace = create_marketplace_contract(&e, &admin, &usdc.address());
    let usdc_client = TokenClient::new(&e, &usdc.address());

    // Mint to client
    let admin_client = TokenAdminClient::new(&e, &usdc.address());
    admin_client.mint(&client_addr, &200_000_000);

    // Register agent
    let agent_id = marketplace.register_agent(
        &agent_owner,
        &String::from_str(&e, "Agent"),
        &String::from_str(&e, "Desc"),
        &Vec::from_array(&e, [String::from_str(&e, "python")]),
        &50_000_000,
        &String::from_str(&e, "ipfs://QmTest"),
    );

    // Post job
    let job_id = marketplace.post_job(
        &client_addr,
        &String::from_str(&e, "Job"),
        &String::from_str(&e, "Desc"),
        &Vec::from_array(&e, [String::from_str(&e, "python")]),
        &100_000_000,
        &14,
    );

    // Place bid
    let bid_id = marketplace.place_bid(
        &agent_owner,
        &job_id,
        &80_000_000,
        &7,
        &String::from_str(&e, "Proposal"),
    );

    // Accept bid
    marketplace.accept_bid(&client_addr, &job_id, &bid_id);

    // Submit deliverable
    let hash = BytesN::from_array(&e, &[1u8; 32]);
    marketplace.submit_deliverable(&agent_owner, &job_id, &hash);

    let job = marketplace.get_job(&job_id);
    assert_eq!(job.status, JobStatus::Completed);
    assert_eq!(job.deliverable_hash, Some(hash));

    // Approve and release
    marketplace.approve_deliverable(&client_addr, &job_id);

    let job = marketplace.get_job(&job_id);
    assert_eq!(job.status, JobStatus::Completed);

    // Check agent earnings
    let agent = marketplace.get_agent(&agent_id);
    assert_eq!(agent.total_jobs_completed, 1);
    assert_eq!(agent.total_earnings, 80_000_000);
    assert_eq!(agent.reputation, 5); // +5 for completion

    // Check USDC transferred
    assert_eq!(usdc_client.balance(&agent_owner), 80_000_000);
}

#[test]
fn test_dispute_flow() {
    let e = Env::default();
    e.mock_all_auths();

    let admin = Address::generate(&e);
    let client_addr = Address::generate(&e);
    let agent_owner = Address::generate(&e);
    let usdc = create_token_contract(&e);
    let marketplace = create_marketplace_contract(&e, &admin, &usdc.address());
    let usdc_client = TokenClient::new(&e, &usdc.address());

    // Mint to client
    let admin_client = TokenAdminClient::new(&e, &usdc.address());
    admin_client.mint(&client_addr, &200_000_000);

    // Register agent
    let agent_id = marketplace.register_agent(
        &agent_owner,
        &String::from_str(&e, "Agent"),
        &String::from_str(&e, "Desc"),
        &Vec::from_array(&e, [String::from_str(&e, "python")]),
        &50_000_000,
        &String::from_str(&e, "ipfs://QmTest"),
    );

    // Post job
    let job_id = marketplace.post_job(
        &client_addr,
        &String::from_str(&e, "Job"),
        &String::from_str(&e, "Desc"),
        &Vec::from_array(&e, [String::from_str(&e, "python")]),
        &100_000_000,
        &14,
    );

    // Place bid
    let bid_id = marketplace.place_bid(
        &agent_owner,
        &job_id,
        &80_000_000,
        &7,
        &String::from_str(&e, "Proposal"),
    );

    // Accept bid
    marketplace.accept_bid(&client_addr, &job_id, &bid_id);

    // Submit deliverable
    let hash = BytesN::from_array(&e, &[1u8; 32]);
    marketplace.submit_deliverable(&agent_owner, &job_id, &hash);

    // Client raises dispute
    let dispute_id = marketplace.raise_dispute(
        &client_addr,
        &job_id,
        &String::from_str(&e, "Deliverable not as specified"),
        &String::from_str(&e, "ipfs://QmEvidence"),
    );

    assert_eq!(dispute_id, 1);

    let job = marketplace.get_job(&job_id);
    assert_eq!(job.status, JobStatus::Disputed);
    assert!(job.dispute_raised);

    // Resolver resolves in favor of agent
    marketplace.resolve_dispute(
        &admin,
        &dispute_id,
        &String::from_str(&e, "agent"),
        &Option::None,
    );

    let job = marketplace.get_job(&job_id);
    assert_eq!(job.status, JobStatus::Completed);

    // Agent should have received payment
    assert_eq!(usdc_client.balance(&agent_owner), 80_000_000);

    // Resolve in favor of client (refund)
    let job_id2 = marketplace.post_job(
        &client_addr,
        &String::from_str(&e, "Job2"),
        &String::from_str(&e, "Desc"),
        &Vec::from_array(&e, [String::from_str(&e, "python")]),
        &100_000_000,
        &14,
    );

    let bid_id2 = marketplace.place_bid(
        &agent_owner,
        &job_id2,
        &80_000_000,
        &7,
        &String::from_str(&e, "Proposal"),
    );

    marketplace.accept_bid(&client_addr, &job_id2, &bid_id2);
    marketplace.submit_deliverable(&agent_owner, &job_id2, &hash);

    let dispute_id2 = marketplace.raise_dispute(
        &client_addr,
        &job_id2,
        &String::from_str(&e, "Bad work"),
        &String::from_str(&e, "ipfs://QmEvidence"),
    );

    marketplace.resolve_dispute(
        &admin,
        &dispute_id2,
        &String::from_str(&e, "client"),
        &Option::None,
    );

    let job = marketplace.get_job(&job_id2);
    assert_eq!(job.status, JobStatus::Refunded);

    // Client should get refund
    assert_eq!(usdc_client.balance(&client_addr), 100_000_000); // 100M refunded
}

#[test]
fn test_skill_verification() {
    let e = Env::default();
    e.mock_all_auths();

    let admin = Address::generate(&e);
    let verifier = Address::generate(&e);
    let owner = Address::generate(&e);
    let usdc = create_token_contract(&e);

    // Create marketplace with verifier
    let contract_id = e.register_contract(None, AiAgentMarketplace);
    let client = AiAgentMarketplaceClient::new(&e, &contract_id);

    client.initialize(
        &admin,
        &usdc.address(),
        &100,
        &10_000_000,
        &30,
        &7,
        &0,
        &admin,
        &admin,
        &0,
        &200,
        &30,
        &Vec::from_array(&e, [verifier.clone()]),
    );

    // Register agent
    let agent_id = client.register_agent(
        &owner,
        &String::from_str(&e, "Agent"),
        &String::from_str(&e, "Desc"),
        &Vec::from_array(&e, [String::from_str(&e, "python")]),
        &50_000_000,
        &String::from_str(&e, "ipfs://QmTest"),
    );

    // Verify skill
    client.verify_skill(
        &verifier,
        &agent_id,
        &String::from_str(&e, "python"),
        &String::from_str(&e, "ipfs://QmProof"),
        &e.ledger().timestamp() + 86400 * 365, // 1 year
    );

    let agent = client.get_agent(&agent_id);
    assert!(agent.skills_verified.get(String::from_str(&e, "python")).unwrap_or(false));
}

#[test]
fn test_leave_review() {
    let e = Env::default();
    e.mock_all_auths();

    let admin = Address::generate(&e);
    let client_addr = Address::generate(&e);
    let agent_owner = Address::generate(&e);
    let usdc = create_token_contract(&e);
    let marketplace = create_marketplace_contract(&e, &admin, &usdc.address());
    let usdc_client = TokenClient::new(&e, &usdc.address());

    // Mint to client
    let admin_client = TokenAdminClient::new(&e, &usdc.address());
    admin_client.mint(&client_addr, &200_000_000);

    // Register agent
    let agent_id = marketplace.register_agent(
        &agent_owner,
        &String::from_str(&e, "Agent"),
        &String::from_str(&e, "Desc"),
        &Vec::from_array(&e, [String::from_str(&e, "python")]),
        &50_000_000,
        &String::from_str(&e, "ipfs://QmTest"),
    );

    // Post job
    let job_id = marketplace.post_job(
        &client_addr,
        &String::from_str(&e, "Job"),
        &String::from_str(&e, "Desc"),
        &Vec::from_array(&e, [String::from_str(&e, "python")]),
        &100_000_000,
        &14,
    );

    // Place bid
    let bid_id = marketplace.place_bid(
        &agent_owner,
        &job_id,
        &80_000_000,
        &7,
        &String::from_str(&e, "Proposal"),
    );

    // Accept bid
    marketplace.accept_bid(&client_addr, &job_id, &bid_id);

    // Submit deliverable
    let hash = BytesN::from_array(&e, &[1u8; 32]);
    marketplace.submit_deliverable(&agent_owner, &job_id, &hash);

    // Approve
    marketplace.approve_deliverable(&client_addr, &job_id);

    // Leave review (client reviews agent)
    marketplace.leave_review(
        &client_addr,
        &job_id,
        &5,
        &String::from_str(&e, "Excellent work!"),
    );

    // Leave review (agent reviews client)
    marketplace.leave_review(
        &agent_owner,
        &job_id,
        &4,
        &String::from_str(&e, "Good client"),
    );

    // Check reviews exist (via platform stats)
    let stats = marketplace.get_platform_stats();
    assert_eq!(stats.total_jobs, 1);
}

#[test]
#[test]
fn test_reclaim_expired_escrow() {
    let e = Env::default();
    e.mock_all_auths();
fn test_set_paused_and_circuit_breaker() {
    let e = Env::default();
    e.mock_all_auths();

    let admin = Address::generate(&e);
    let client_addr = Address::generate(&e);
    let agent_owner = Address::generate(&e);
    let usdc = create_token_contract(&e);
    let marketplace = create_marketplace_contract(&e, &admin, &usdc.address());
    let usdc_client = TokenClient::new(&e, &usdc.address());

    // Mint USDC to the client
    let admin_client = TokenAdminClient::new(&e, &usdc.address());
    admin_client.mint(&client_addr, &100_000_000);

    // Register agent
    let agent_id = marketplace.register_agent(
        &agent_owner,
        &String::from_str(&e, "Agent"),
        &String::from_str(&e, "Desc"),
        &Vec::from_array(&e, [String::from_str(&e, "python")]),
        &50_000_000,
        &String::from_str(&e, "ipfs://QmTest"),

    // Post job
    let job_id = marketplace.post_job(
        &client_addr,
        &String::from_str(&e, "Job"),
        &String::from_str(&e, "Desc"),
        &Vec::from_array(&e, [String::from_str(&e, "python")]),
        &100_000_000,
        &14,

    // Place bid
    let bid_id = marketplace.place_bid(
        &agent_owner,
        &job_id,
        &80_000_000,
        &7,
        &String::from_str(&e, "Proposal"),

    // Accept bid -- funds escrow (escrow.created_at = current ledger timestamp)
    marketplace.accept_bid(&client_addr, &job_id, &bid_id);

    let job = marketplace.get_job(&job_id);
    assert_eq!(job.status, JobStatus::InProgress);

    // Advance the ledger past the 30-day expiry window
    e.ledger().with_mut(|li| {
        li.timestamp += 30 * 86_400 + 1; // one second past expiry
    });
    );
    );
    );

    let admin = Address::generate(&e);
    let usdc = create_token_contract(&e);
    let marketplace = create_marketplace_contract(&e, &admin, &usdc.address());

    assert!(!marketplace.is_paused());

    marketplace.set_paused(&admin, &true);
    assert!(marketplace.is_paused());

    marketplace.set_paused(&admin, &false);
    assert!(!marketplace.is_paused());
}
