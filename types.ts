export interface SummaryItem {
  category: string;
  summary: string;
  evidence: string;
}

export interface AnalysisResult {
  fileName: string;
  data?: SummaryItem[];
  error?: string;
}

export interface CustomCategory {
  name: string;
  definition: string;
}
