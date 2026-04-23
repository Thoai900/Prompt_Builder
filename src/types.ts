export type TabType = 'home' | 'aifuture' | 'library' | 'builder' | 'enhancer';

export type BlockType = 'role' | 'task' | 'context' | 'format' | 'tone' | 'constraints' | 'example';

export interface PromptBlock {
  id: string;
  type: BlockType;
  title: string;
  content: string;
  isPinned?: boolean; // 2. Tính năng Pinned Block
}

export interface AiPersona {
  id: string;
  name: string;
  systemInstructions: string;
}

export interface Workspace {
  id: string;
  name: string;
}

export interface PromptVariable {
  name: string;
  type: 'text' | 'long-text' | 'dropdown' | 'boolean';
  description?: string;
  required: boolean;
  defaultValue?: string;
  options?: string[];
}

export interface FewShotExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface AiConfig {
  recommendedModels?: string[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category?: string;
  blocks: PromptBlock[];
  
  // 1. Tham số hóa động
  variables?: PromptVariable[];
  
  // 2. Quản lý phiên bản & Rẽ nhánh
  version?: string;
  parentPromptId?: string;
  changelog?: string;
  
  // 3. Metadata & Taxonomy
  tags?: string[];
  language?: string;
  difficultyLevel?: 'Basic' | 'Advanced' | 'Expert';
  useCase?: string;
  
  // 4. Model Compatibility
  aiConfig?: AiConfig;
  
  // 5. Metrics & Social Data
  metrics?: {
    usageCount: number;
    upvotes: number;
    averageRating?: number;
  };
  
  // 6. Few-shot Examples
  fewShots?: FewShotExample[];
  
  // 7. Visibility & Governance
  isPublic?: boolean;
  status?: 'Draft' | 'Published' | 'Archived';
  authorId?: string;
  authorName?: string;
}
