export interface AgentData {
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
  createdAt: string;
  metadataUri: string;
  ratingCount: number;
  category: string;
}

export interface JobData {
  id: number;
  client: string;
  title: string;
  description: string;
  requiredSkills: string[];
  budget: number;
  deadlineDays: number;
  status: 'Open' | 'InProgress' | 'Completed' | 'Disputed' | 'Cancelled';
  assignedAgent?: string;
  bidsCount: number;
  createdAt: string;
  category: string;
}

export interface ReviewData {
  id: number;
  jobId: number;
  reviewer: string;
  reviewee: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const MOCK_AGENTS: AgentData[] = [
  {
    id: 1,
    owner: 'GBX7S2W...4J2K',
    name: 'NeuralScout AI',
    description: 'Autonomous data mining & pattern extraction agent specialized in DeFi liquidity pools and Stellar DEX arbitrage signals.',
    skills: ['Python', 'DeFi Analytics', 'Machine Learning', 'Stellar SDK', 'TensorFlow'],
    pricePerTask: 150,
    reputation: 98,
    totalJobsCompleted: 42,
    totalEarnings: 6300,
    isActive: true,
    createdAt: '2026-06-01',
    metadataUri: 'ipfs://QmScoutAgent9918237',
    ratingCount: 38,
    category: 'Data & Analytics',
  },
  {
    id: 2,
    owner: 'GD91P4L...90AM',
    name: 'SorobanAuditBot',
    description: 'Automated Rust & Soroban smart contract vulnerability scanner and formal verification analyst.',
    skills: ['Rust', 'Soroban', 'Security Audit', 'Formal Verification', 'WebAssembly'],
    pricePerTask: 300,
    reputation: 99,
    totalJobsCompleted: 87,
    totalEarnings: 26100,
    isActive: true,
    createdAt: '2026-05-15',
    metadataUri: 'ipfs://QmAuditBot881726',
    ratingCount: 85,
    category: 'Security & Audit',
  },
  {
    id: 3,
    owner: 'GC88V12...33LK',
    name: 'NLP Summarizer Pro',
    description: 'High-throughput LLM pipeline agent trained on financial reports, SEC filings, and governance proposals.',
    skills: ['NLP', 'Python', 'LLM Fine-Tuning', 'LangChain', 'OpenAI'],
    pricePerTask: 85,
    reputation: 94,
    totalJobsCompleted: 119,
    totalEarnings: 10115,
    isActive: true,
    createdAt: '2026-04-20',
    metadataUri: 'ipfs://QmNLPPro223194',
    ratingCount: 112,
    category: 'Content & Research',
  },
  {
    id: 4,
    owner: 'GA77M91...88XX',
    name: 'VisionGen Master',
    description: 'Generative diffusion agent tailored for web3 UI mockups, NFT artwork, and marketing visuals.',
    skills: ['PyTorch', 'Stable Diffusion', 'Computer Vision', 'Graphic Design'],
    pricePerTask: 120,
    reputation: 96,
    totalJobsCompleted: 64,
    totalEarnings: 7680,
    isActive: true,
    createdAt: '2026-06-10',
    metadataUri: 'ipfs://QmVisionGen7718',
    ratingCount: 60,
    category: 'Design & Media',
  },
];

export const MOCK_JOBS: JobData[] = [
  {
    id: 101,
    client: 'GDF8910...12AB',
    title: 'Audit Soroban Liquidity Vault Smart Contract',
    description: 'We need a formal security audit and static vulnerability scan for our upcoming Soroban yield aggregator contract.',
    requiredSkills: ['Rust', 'Soroban', 'Security Audit'],
    budget: 500,
    deadlineDays: 7,
    status: 'Open',
    bidsCount: 5,
    createdAt: '2026-08-10',
    category: 'Security & Audit',
  },
  {
    id: 102,
    client: 'GC44109...99ZZ',
    title: 'DeFi Sentiment Analysis & Trading Signal Engine',
    description: 'Develop a sentiment analysis pipeline that ingests Twitter/X and Discord feeds to output real-time Stellar DEX trading indicators.',
    requiredSkills: ['Python', 'NLP', 'DeFi Analytics'],
    budget: 350,
    deadlineDays: 14,
    status: 'InProgress',
    assignedAgent: 'GBX7S2W...4J2K',
    bidsCount: 8,
    createdAt: '2026-08-05',
    category: 'Data & Analytics',
  },
  {
    id: 103,
    client: 'GA11223...44YY',
    title: 'AI Generated Marketing Assets for Web3 Launch',
    description: 'Generate 20 high-resolution branded promotional images and video teasers for our decentralized exchange launch.',
    requiredSkills: ['Stable Diffusion', 'Graphic Design'],
    budget: 200,
    deadlineDays: 5,
    status: 'Completed',
    assignedAgent: 'GA77M91...88XX',
    bidsCount: 3,
    createdAt: '2026-07-28',
    category: 'Design & Media',
  },
];

export const MOCK_REVIEWS: ReviewData[] = [
  {
    id: 1,
    jobId: 103,
    reviewer: 'GA11223...44YY',
    reviewee: 'GA77M91...88XX',
    rating: 5,
    comment: 'Exceptional visual assets delivered 2 days ahead of schedule! Highly recommended.',
    createdAt: '2026-08-02',
  },
  {
    id: 2,
    jobId: 99,
    reviewer: 'GDK7712...11MM',
    reviewee: 'GD91P4L...90AM',
    rating: 5,
    comment: 'Found 2 critical re-entrancy edge cases before our mainnet deployment. Saved our protocol!',
    createdAt: '2026-07-19',
  },
];

export const MOCK_STATS = {
  totalAgents: 148,
  totalJobs: 512,
  totalVolumeUSDC: 184500,
  avgJobCompletionDays: 3.4,
  activeEscrowUSDC: 24500,
  reputationAverage: 96.8,
};
