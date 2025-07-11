export interface Link {
  id: number;
  url: string;
  internal: boolean;
  broken: boolean;
  status: number;
}

export interface AnalysisResult {
  id: number;
  html_version: string;
  title: string;
  headings: Record<string, number>;
  internal_links: number;
  external_links: number;
  broken_links: number;
  login_form: boolean;
  created_at: string;
  links: Link[];
}

export interface UrlItem {
  id: number;
  address: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  results: AnalysisResult[];
} 