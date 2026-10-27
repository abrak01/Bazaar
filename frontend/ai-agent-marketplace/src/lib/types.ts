/**
 * Shared contract data types.
 *
 * These mirror the on-chain Soroban structs (see
 * `contracts/ai-agent-marketplace/src/lib.rs`) but use the camelCase naming
 * convention the UI expects. The conversion from snake_case ScVal maps happens
 * in `marketplaceClient.ts`.
 */

export type JobStatus =
  | 'Open'
  | 'InProgress'
  | 'Completed'
  | 'Disputed'
  | 'Cancelled'
  | 'Refunded';

export type BidStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Withdrawn';

export type EscrowStatus = 'Funded' | 'Released' | 'Disputed' | 'Refunded';

export interface Agent {
  id: number;
  owner: string;
  name: string;
  description: string;
  skills: string[];
  pricePerTask: number;
  reputation: number;
  totalJobsCompleted: number;
  totalEarnings: number;
  isActive: boolean;
  createdAt: number;
  skillsVerified: Record<string, boolean>;
  metadataUri: string;
}

export interface Bid {
  id: number;
  agent: string;
  agentId: number;
  amount: number;
  /** Unix timestamp (seconds) the agent proposed to deliver by. */
  proposedTimeline: number;
  proposal: string;
  submittedAt: number;
  status: BidStatus;
}

export interface Job {
  id: number;
  client: string;
  title: string;
  description: string;
  requiredSkills: string[];
  budget: number;
  deadline: number;
  status: JobStatus;
  assignedAgent: string | null;
  /**
   * Bids attached to the on-chain Job struct. The contract stores bids in a
   * separate index (`BidsByJob`) and does NOT push them into this Vec, so this
   * is almost always empty. Pages that need bids should fetch them via
   * `client.getBidsByJob()` instead.
   */
  bids: Bid[];
  escrowAmount: number;
  /**
   * Unix timestamp (seconds) the escrow was created. Not part of the contract
   * `Job` struct; populated from the linked `Escrow` (see `getEscrowByJob`)
   * when available, otherwise `null`.
   */
  escrowCreatedAt: number | null;
  createdAt: number;
  completedAt: number | null;
  deliverableHash: string | null;
  disputeRaised: boolean;
}

export interface Review {
  id: number;
  jobId: number;
  reviewer: string;
  reviewee: string;
  rating: number;
  comment: string;
  createdAt: number;
}

export interface PlatformStats {
  totalAgents: number;
  totalJobs: number;
  totalVolume: number;
  totalFeesCollected: number;
  totalDisputes: number;
  avgJobCompletionTime: number;
}

export interface Escrow {
  jobId: number;
  client: string;
  agent: string;
  amount: number;
  token: string;
  status: EscrowStatus;
  createdAt: number;
  releasedAt: number | null;
  disputeRaisedAt: number | null;
  resolver: string | null;
}
