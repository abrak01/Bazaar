import {
  MOCK_AGENTS,
  MOCK_JOBS,
  MOCK_REVIEWS,
  MOCK_STATS,
  AgentData,
  JobData,
  ReviewData,
} from './mockData';

export class ContractClientService {
  private contractId: string;
  private rpcUrl: string;

  constructor() {
    this.contractId = import.meta.env.VITE_CONTRACT_ID || '';
    this.rpcUrl = import.meta.env.VITE_RPC_URL || 'https://soroban-testnet.stellar.org';
  }

  public isConfigured(): boolean {
    return Boolean(this.contractId && this.contractId.startsWith('C'));
  }

  public async getAgents(): Promise<AgentData[]> {
    if (!this.isConfigured()) {
      return MOCK_AGENTS;
    }
    try {
      // Soroban contract call fallback
      return MOCK_AGENTS;
    } catch {
      return MOCK_AGENTS;
    }
  }

  public async getAgentById(id: number): Promise<AgentData | undefined> {
    const agents = await this.getAgents();
    return agents.find((a) => a.id === id);
  }

  public async getJobs(): Promise<JobData[]> {
    if (!this.isConfigured()) {
      return MOCK_JOBS;
    }
    try {
      return MOCK_JOBS;
    } catch {
      return MOCK_JOBS;
    }
  }

  public async getJobById(id: number): Promise<JobData | undefined> {
    const jobs = await this.getJobs();
    return jobs.find((j) => j.id === id);
  }

  public async getPlatformStats() {
    return MOCK_STATS;
  }

  public async getReviewsByAgent(agentOwner: string): Promise<ReviewData[]> {
    return MOCK_REVIEWS.filter((r) => r.reviewee === agentOwner);
  }
}

export const contractClient = new ContractClientService();
