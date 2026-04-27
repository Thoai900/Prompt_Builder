export type ModelStatus = 'new' | 'hot' | 'stable';
export type ModelAccess = 'open-source' | 'closed';
export type CompanyTier = 'frontier' | 'research' | 'enterprise';

export interface LlmModel {
  id: string;
  name: string;
  company: string;
  country: string;
  region: string;
  access: ModelAccess;
  status: ModelStatus;
  lastUpdated: string;
  benchmark: string;
  benchmarkScore: number;
  contextWindow: string;
  latency: string;
  specialty: string[];
  description: string;
  strengths: string[];
  comparison: string;
  docsUrl: string;
  benchmarkHistory: number[];
  releaseVelocity: number;
  adoptionIndex: number;
  rivals: string[];
}

export interface CompanyNode {
  id: string;
  company: string;
  country: string;
  region: string;
  lat: number;
  lon: number;
  x: number;
  y: number;
  tier: CompanyTier;
  updatedAt: string;
  models: string[];
}

export interface FeedItem {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  type: 'release' | 'research' | 'infra' | 'benchmark';
  summary: string;
}

export interface RegionPulse {
  region: string;
  activeLabs: number;
  releases30d: number;
  avgScore: number;
  orbitOffset: number;
}

export const llmModels: LlmModel[] = [
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    company: 'OpenAI',
    country: 'United States',
    region: 'North America',
    access: 'closed',
    status: 'hot',
    lastUpdated: '2026-04-24',
    benchmark: 'MMLU / SWE-bench',
    benchmarkScore: 92,
    contextWindow: '1M tokens',
    latency: 'Low',
    specialty: ['reasoning', 'coding', 'agents'],
    description: 'Flagship general-purpose model optimized for complex reasoning, coding workflows, and multi-step tool use.',
    strengths: ['Strong reasoning under tool orchestration', 'Reliable code transformation quality', 'Balanced latency for product use'],
    comparison: 'More production-balanced than deep-reasoning-only models and typically faster for general app flows.',
    docsUrl: 'https://platform.openai.com/docs',
    benchmarkHistory: [84, 86, 87, 89, 90, 91, 92],
    releaseVelocity: 8,
    adoptionIndex: 96,
    rivals: ['Claude Opus 4', 'Gemini 2.5 Pro']
  },
  {
    id: 'claude-opus-4',
    name: 'Claude Opus 4',
    company: 'Anthropic',
    country: 'United States',
    region: 'North America',
    access: 'closed',
    status: 'stable',
    lastUpdated: '2026-04-18',
    benchmark: 'HumanEval / GPQA',
    benchmarkScore: 90,
    contextWindow: '400K tokens',
    latency: 'Medium',
    specialty: ['writing', 'coding', 'analysis'],
    description: 'High-end model focused on long-form reasoning, nuanced writing, and strong code understanding.',
    strengths: ['Excellent writing quality', 'Strong code review and refactor performance', 'Good long-context coherence'],
    comparison: 'Feels more editorial and structured than GPT-class models, especially in writing-heavy tasks.',
    docsUrl: 'https://docs.anthropic.com',
    benchmarkHistory: [83, 84, 86, 87, 88, 89, 90],
    releaseVelocity: 6,
    adoptionIndex: 88,
    rivals: ['GPT-4.1', 'Mistral Large']
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    company: 'Google DeepMind',
    country: 'United States',
    region: 'North America',
    access: 'closed',
    status: 'hot',
    lastUpdated: '2026-04-25',
    benchmark: 'MMMU / long-context eval',
    benchmarkScore: 91,
    contextWindow: '2M tokens',
    latency: 'Medium',
    specialty: ['multimodal', 'research', 'long-context'],
    description: 'Research-grade multimodal model with standout long-context retrieval and analysis.',
    strengths: ['Very large context window', 'Strong multimodal parsing', 'Good research synthesis'],
    comparison: 'Best suited when huge context or multimodal review is central to the workflow.',
    docsUrl: 'https://ai.google.dev',
    benchmarkHistory: [82, 84, 85, 87, 89, 90, 91],
    releaseVelocity: 7,
    adoptionIndex: 91,
    rivals: ['GPT-4.1', 'Claude Opus 4']
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    company: 'Mistral AI',
    country: 'France',
    region: 'Europe',
    access: 'closed',
    status: 'new',
    lastUpdated: '2026-04-20',
    benchmark: 'Arena / multilingual',
    benchmarkScore: 86,
    contextWindow: '256K tokens',
    latency: 'Low',
    specialty: ['multilingual', 'enterprise', 'efficiency'],
    description: 'European frontier model with strong multilingual output and favorable latency-to-quality tradeoff.',
    strengths: ['Fast inference profile', 'Good multilingual coverage', 'Strong enterprise deployment appeal'],
    comparison: 'A practical choice when latency, sovereignty, and multilingual support all matter.',
    docsUrl: 'https://docs.mistral.ai',
    benchmarkHistory: [76, 78, 80, 82, 83, 85, 86],
    releaseVelocity: 5,
    adoptionIndex: 74,
    rivals: ['Claude Opus 4', 'Qwen 3 Max']
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    company: 'DeepSeek',
    country: 'China',
    region: 'Asia',
    access: 'open-source',
    status: 'hot',
    lastUpdated: '2026-04-21',
    benchmark: 'Math / code composite',
    benchmarkScore: 88,
    contextWindow: '128K tokens',
    latency: 'Low',
    specialty: ['math', 'coding', 'cost-efficiency'],
    description: 'Open-weight model known for strong math and code performance with aggressive cost efficiency.',
    strengths: ['Very strong value curve', 'Competitive code and math performance', 'Good self-hosting potential'],
    comparison: 'Often chosen when teams want near-frontier behavior without fully closed infrastructure.',
    docsUrl: 'https://www.deepseek.com',
    benchmarkHistory: [71, 74, 77, 81, 84, 86, 88],
    releaseVelocity: 9,
    adoptionIndex: 81,
    rivals: ['Llama 4', 'Qwen 3 Max']
  },
  {
    id: 'qwen-3-max',
    name: 'Qwen 3 Max',
    company: 'Alibaba Cloud',
    country: 'China',
    region: 'Asia',
    access: 'open-source',
    status: 'stable',
    lastUpdated: '2026-04-16',
    benchmark: 'C-Eval / multilingual',
    benchmarkScore: 84,
    contextWindow: '128K tokens',
    latency: 'Low',
    specialty: ['multilingual', 'reasoning', 'enterprise'],
    description: 'Broadly capable open-weight family with strong multilingual coverage and flexible deployment paths.',
    strengths: ['Solid multilingual output', 'Healthy ecosystem support', 'Enterprise-friendly hosting options'],
    comparison: 'A flexible option for teams that want open deployment with broad task coverage.',
    docsUrl: 'https://qwenlm.github.io',
    benchmarkHistory: [70, 72, 75, 78, 80, 82, 84],
    releaseVelocity: 6,
    adoptionIndex: 78,
    rivals: ['DeepSeek V3', 'Mistral Large']
  },
  {
    id: 'llama-4',
    name: 'Llama 4',
    company: 'Meta AI',
    country: 'United States',
    region: 'North America',
    access: 'open-source',
    status: 'hot',
    lastUpdated: '2026-04-23',
    benchmark: 'Open LLM leaderboard',
    benchmarkScore: 87,
    contextWindow: '256K tokens',
    latency: 'Low',
    specialty: ['open ecosystem', 'fine-tuning', 'agents'],
    description: 'Ecosystem-leading open-weight model family with broad community adoption and tuning support.',
    strengths: ['Large tooling ecosystem', 'Strong fine-tuning story', 'Flexible deployment from cloud to edge'],
    comparison: 'Best when extensibility and ecosystem gravity matter more than top closed-model peak scores.',
    docsUrl: 'https://llama.meta.com',
    benchmarkHistory: [74, 76, 79, 81, 83, 85, 87],
    releaseVelocity: 8,
    adoptionIndex: 93,
    rivals: ['DeepSeek V3', 'Qwen 3 Max']
  }
];

export const companyNodes: CompanyNode[] = [
  {
    id: 'openai',
    company: 'OpenAI',
    country: 'United States',
    region: 'North America',
    lat: 37.7749,
    lon: -122.4194,
    x: 21,
    y: 34,
    tier: 'frontier',
    updatedAt: '2026-04-24',
    models: ['GPT-4.1']
  },
  {
    id: 'anthropic',
    company: 'Anthropic',
    country: 'United States',
    region: 'North America',
    lat: 37.7749,
    lon: -122.4194,
    x: 19,
    y: 31,
    tier: 'frontier',
    updatedAt: '2026-04-18',
    models: ['Claude Opus 4']
  },
  {
    id: 'google-deepmind',
    company: 'Google DeepMind',
    country: 'United States',
    region: 'North America',
    lat: 37.422,
    lon: -122.0841,
    x: 18,
    y: 36,
    tier: 'frontier',
    updatedAt: '2026-04-25',
    models: ['Gemini 2.5 Pro']
  },
  {
    id: 'meta-ai',
    company: 'Meta AI',
    country: 'United States',
    region: 'North America',
    lat: 37.4848,
    lon: -122.1484,
    x: 24,
    y: 30,
    tier: 'enterprise',
    updatedAt: '2026-04-23',
    models: ['Llama 4']
  },
  {
    id: 'mistral-ai',
    company: 'Mistral AI',
    country: 'France',
    region: 'Europe',
    lat: 48.8566,
    lon: 2.3522,
    x: 49,
    y: 28,
    tier: 'research',
    updatedAt: '2026-04-20',
    models: ['Mistral Large']
  },
  {
    id: 'deepseek',
    company: 'DeepSeek',
    country: 'China',
    region: 'Asia',
    lat: 39.9042,
    lon: 116.4074,
    x: 76,
    y: 38,
    tier: 'frontier',
    updatedAt: '2026-04-21',
    models: ['DeepSeek V3']
  },
  {
    id: 'alibaba-cloud',
    company: 'Alibaba Cloud',
    country: 'China',
    region: 'Asia',
    lat: 30.2741,
    lon: 120.1551,
    x: 73,
    y: 35,
    tier: 'enterprise',
    updatedAt: '2026-04-16',
    models: ['Qwen 3 Max']
  }
];

export const feedItems: FeedItem[] = [
  {
    id: 'feed-1',
    title: 'OpenAI expands agent workflow support in platform tooling',
    source: 'Platform',
    timestamp: '4 min ago',
    type: 'release',
    summary: 'New orchestration primitives improve multi-step automation and evaluation loops.'
  },
  {
    id: 'feed-2',
    title: 'Mistral publishes updated enterprise deployment guidance',
    source: 'Docs',
    timestamp: '31 min ago',
    type: 'infra',
    summary: 'Focus is on sovereignty, lower-latency routing, and compliance-aligned deployments.'
  },
  {
    id: 'feed-3',
    title: 'Gemini family posts stronger long-context benchmark movement',
    source: 'Benchmark',
    timestamp: '1 hr ago',
    type: 'benchmark',
    summary: 'Large-context retrieval and multimodal document parsing continue to trend upward.'
  },
  {
    id: 'feed-4',
    title: 'DeepSeek ecosystem adds more self-hosting templates',
    source: 'Community',
    timestamp: '2 hr ago',
    type: 'research',
    summary: 'Open deployment pathways are getting easier for engineering teams and labs.'
  }
];

export const worldMapPaths = [
  'M32 104C48 87 73 71 118 68C158 66 193 80 201 100C206 113 193 122 171 124C150 127 137 134 133 145C126 164 97 168 75 159C54 150 31 130 32 104Z',
  'M173 158C188 152 214 154 228 166C241 177 241 195 231 207C219 221 190 223 173 214C154 204 150 182 173 158Z',
  'M250 76C276 63 317 59 354 64C382 67 414 76 433 87C448 96 451 110 439 117C422 126 395 124 372 128C355 131 343 141 334 154C320 174 286 184 263 176C242 168 233 150 236 131C239 108 232 85 250 76Z',
  'M357 162C374 151 398 149 417 154C438 160 455 171 458 188C461 205 445 218 424 223C394 230 361 222 348 205C337 191 341 172 357 162Z',
  'M464 90C490 78 532 76 572 83C611 90 650 109 678 133C700 151 716 172 709 191C703 209 677 220 647 218C618 216 594 205 575 194C557 183 546 171 529 168C502 163 474 155 460 138C448 123 446 98 464 90Z',
  'M567 224C590 214 618 216 640 225C661 235 674 252 667 266C659 281 633 288 607 286C579 284 554 276 543 260C533 245 544 231 567 224Z',
  'M708 245C721 240 735 244 742 255C748 266 744 281 733 288C721 295 705 291 698 280C690 269 694 251 708 245Z'
];

export const regionPulse: RegionPulse[] = [
  { region: 'North America', activeLabs: 4, releases30d: 18, avgScore: 90, orbitOffset: 0 },
  { region: 'Europe', activeLabs: 1, releases30d: 6, avgScore: 86, orbitOffset: 0.33 },
  { region: 'Asia', activeLabs: 2, releases30d: 11, avgScore: 86, orbitOffset: 0.66 }
];
