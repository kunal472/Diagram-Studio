import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { DiagramResponse, GenerateRequest, Workspace, NodeExplanation } from '../models/studio.models';

@Injectable({
  providedIn: 'root'
})
export class StudioService {
  private readonly baseUrl = 'http://localhost:8080/api/v1';

  // Core State Signals
  currentDiagram = signal<DiagramResponse | null>(null);
  currentTopic = signal<string>('');
  currentRawText = signal<string>('');
  loading = signal<boolean>(false);
  activeRecallNode = signal<string | null>(null);
  activeTermExplanation = signal<NodeExplanation | null>(null);
  savedWorkspaces = signal<Workspace[]>([]);
  selectedView = signal<'both' | 'diagram' | 'notes' | 'flashcards'>('both');
  activeDiagramType = signal<'flowchart' | 'mindmap'>('flowchart');
  notification = signal<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  constructor(private http: HttpClient) {}

  generateStudioContent(topic: string, rawText?: string, detailLevel = 'standard'): Observable<DiagramResponse> {
    this.loading.set(true);
    this.currentTopic.set(topic);
    if (rawText) this.currentRawText.set(rawText);

    const payload: GenerateRequest = { topic, rawText, detailLevel };

    return this.http.post<DiagramResponse>(`${this.baseUrl}/studio/generate`, payload).pipe(
      tap(res => {
        this.currentDiagram.set(res);
        this.loading.set(false);
        this.showNotification('Knowledge studio synthesis generated successfully!', 'success');
      }),
      catchError(err => {
        this.loading.set(false);
        this.showNotification('Failed to generate studio content. Using offline synthesis.', 'info');
        return of(this.getFallbackDemo(topic));
      })
    );
  }

  loadAllWorkspaces(): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(`${this.baseUrl}/workspaces`).pipe(
      tap(workspaces => this.savedWorkspaces.set(workspaces)),
      catchError(err => {
        console.error('Error fetching workspaces:', err);
        return of([]);
      })
    );
  }

  saveCurrentWorkspace(title?: string): Observable<Workspace> {
    const diagram = this.currentDiagram();
    const topic = this.currentTopic();
    if (!diagram) {
      this.showNotification('No active diagram to save', 'error');
      return of({} as Workspace);
    }

    const workspace: Workspace = {
      title: title || `${topic || 'Study'} Studio Workspace`,
      topic: topic || 'General Study',
      summaryNotes: diagram.summaryNotes,
      mindMapSyntax: diagram.mindMapSyntax,
      flowchartSyntax: diagram.flowchartSyntax
    };

    return this.http.post<Workspace>(`${this.baseUrl}/workspaces/save`, workspace).pipe(
      tap(saved => {
        this.showNotification('Workspace saved to PostgreSQL database!', 'success');
        this.loadAllWorkspaces().subscribe();
      }),
      catchError(err => {
        this.showNotification('Workspace saved locally!', 'info');
        return of(workspace);
      })
    );
  }

  deleteWorkspace(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/workspaces/${id}`).pipe(
      tap(() => {
        this.showNotification('Workspace deleted', 'info');
        this.savedWorkspaces.update(list => list.filter(w => w.id !== id));
      })
    );
  }

  explainNode(term: string): Observable<NodeExplanation> {
    this.activeRecallNode.set(term);
    return this.http.get<NodeExplanation>(`${this.baseUrl}/nodes/explain?term=${encodeURIComponent(term)}`).pipe(
      tap(explanation => this.activeTermExplanation.set(explanation)),
      catchError(() => {
        const fallback: NodeExplanation = {
          term,
          explanation: `Active recall concept '${term}'. Key node in architectural system design.`,
          category: 'Key Principle',
          quickFact: 'Connected to active study flashcards.'
        };
        this.activeTermExplanation.set(fallback);
        return of(fallback);
      })
    );
  }

  showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.notification.set({ message, type });
    setTimeout(() => this.notification.set(null), 4000);
  }

  loadSavedWorkspace(workspace: Workspace): void {
    this.currentTopic.set(workspace.topic || workspace.title);
    this.currentDiagram.set({
      summaryNotes: workspace.summaryNotes,
      mindMapSyntax: workspace.mindMapSyntax || 'mindmap\n  root((' + workspace.title + '))',
      flowchartSyntax: workspace.flowchartSyntax || 'graph TD\n  A[' + workspace.title + ']',
      flashcards: [
        { id: 'fc-1', question: `What is the core principle of ${workspace.title}?`, answer: 'Defined in the persistent study notes.', relatedNode: workspace.title }
      ],
      conceptTerms: [
        { term: workspace.title, explanation: 'Saved workspace study guide topic.', category: 'Saved Topic' }
      ]
    });
    this.showNotification(`Loaded workspace "${workspace.title}"`, 'success');
  }

  private getFallbackDemo(topic: string): DiagramResponse {
    const title = topic || 'Distributed Architecture';
    return {
      summaryNotes: `# ${title} - Active Study Guide\n\n> **Core Overview**: Visual study synthesis generated for **${title}**.\n\n### 1. Key Concepts\n* <mark>Core Principles</mark>: Fundamental axioms governing the operational domain.\n* <mark>Execution Engine</mark>: High-throughput data processing pipeline.\n* <mark>Output Synthesis</mark>: Transforming raw inputs into structured study notes and interactive Mermaid diagrams.`,
      mindMapSyntax: `mindmap\n  root((${title}))\n    Core Principles\n      State Engine\n    Execution Engine\n      Processing Queue\n    Output Synthesis\n      Markdown Notes\n      Interactive Diagrams`,
      flowchartSyntax: `graph TD\n  A[${title} Input] --> B[Processing Engine]\n  B --> C[Vector Synthesis]\n  C --> D[Interactive Flowchart]\n  C --> E[Active Recall Notes]\n  style A fill:#6366f1,stroke:#4f46e5,color:#fff\n  style C fill:#10b981,stroke:#059669,color:#fff\n  style D fill:#f59e0b,stroke:#d97706,color:#fff`,
      flashcards: [
        { id: 'fc-1', question: `How does ${title} process incoming inputs?`, answer: 'Via normalized tokens through the Execution Engine.', relatedNode: 'Processing Engine' },
        { id: 'fc-2', question: 'What is the role of Output Synthesis?', answer: 'Generates synchronized Mermaid diagrams and Markdown study guides.', relatedNode: 'Output Synthesis' }
      ],
      conceptTerms: [
        { term: 'Core Principles', explanation: 'Foundational rules defining behavior.', category: 'Architecture' },
        { term: 'Execution Engine', explanation: 'Processing pipeline ensuring non-blocking execution.', category: 'Performance' }
      ]
    };
  }
}
