export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  relatedNode?: string;
  isFlipped?: boolean;
}

export interface ConceptTerm {
  term: string;
  explanation: string;
  category: string;
}

export interface DiagramResponse {
  summaryNotes: string;
  mindMapSyntax: string;
  flowchartSyntax: string;
  flashcards: Flashcard[];
  conceptTerms: ConceptTerm[];
}

export interface GenerateRequest {
  topic: string;
  rawText?: string;
  detailLevel?: string;
}

export interface Workspace {
  id?: string;
  title: string;
  topic: string;
  summaryNotes: string;
  mindMapSyntax?: string;
  flowchartSyntax?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NodeExplanation {
  term: string;
  explanation: string;
  category: string;
  quickFact?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: string;
  username: string;
  email: string;
  role: string;
  expiresInMs: number;
}
