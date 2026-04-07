export enum AIAnalysisType {
  COMPLETENESS = 'COMPLETENESS',
  UNDERWRITING = 'UNDERWRITING',
  DOCUMENT_PROCESSING = 'DOCUMENT_PROCESSING',
  PROPERTY_RESEARCH = 'PROPERTY_RESEARCH',
  INVESTOR_MATCHING = 'INVESTOR_MATCHING',
  CHAT = 'CHAT',
}

export interface AIScores {
  ltv?: number;
  dscr?: number;
  credit?: number;
  property?: number;
  borrower?: number;
  composite?: number;
  completeness?: number;
  [key: string]: number | undefined;
}

export interface AIAnalysis {
  id: string;
  loanId: string;
  triggeredBy?: string;
  analysisType: AIAnalysisType;
  modelId: string;
  inputSnapshot: Record<string, unknown>;
  outputRaw: string;
  scores?: AIScores;
  recommendation?: string;
  reasoning?: string;
  tokensUsed?: number;
  latencyMs?: number;
  createdAt: string;
}
