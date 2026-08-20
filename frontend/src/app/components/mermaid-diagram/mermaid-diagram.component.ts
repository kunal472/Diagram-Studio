import { Component, inject, ElementRef, ViewChild, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudioService } from '../../services/studio.service';

@Component({
  selector: 'app-mermaid-diagram',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-panel rounded-2xl p-6 shadow-xl border border-white/10 flex flex-col h-full relative overflow-hidden">
      
      <!-- Top Control Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3 mb-4 z-10">
        
        <!-- Mode Switcher (Flowchart vs Mindmap) -->
        <div class="flex items-center space-x-2">
          <div class="inline-flex rounded-xl bg-slate-900/90 p-1 border border-white/5">
            <button (click)="switchType('flowchart')"
                    [class.bg-indigo-600]="studioService.activeDiagramType() === 'flowchart'"
                    [class.text-white]="studioService.activeDiagramType() === 'flowchart'"
                    class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              Flowchart
            </button>
            <button (click)="switchType('mindmap')"
                    [class.bg-indigo-600]="studioService.activeDiagramType() === 'mindmap'"
                    [class.text-white]="studioService.activeDiagramType() === 'mindmap'"
                    class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              Mind Map
            </button>
          </div>
        </div>

        <!-- Zoom & View Tools -->
        <div class="flex items-center space-x-1.5">
          <button (click)="zoomIn()" 
                  class="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/5 transition" title="Zoom In">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
          </button>
          <button (click)="zoomOut()" 
                  class="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/5 transition" title="Zoom Out">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6"/></svg>
          </button>
          <button (click)="resetZoom()" 
                  class="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white border border-white/5 transition" title="Reset Zoom">
            {{ zoomPercentage }}%
          </button>
        </div>

      </div>

      <!-- Diagram Canvas Area -->
      <div class="relative flex-1 w-full overflow-hidden flex items-center justify-center bg-slate-950/40 rounded-xl border border-white/5 min-h-[380px]">
        
        <!-- Render Container -->
        <div #diagramContainer 
             [style.transform]="'scale(' + zoomScale + ')'"
             style="transform-origin: center center; transition: transform 0.2s ease-out;"
             class="w-full h-full flex items-center justify-center p-4 select-none cursor-grab active:cursor-grabbing">
          <div [id]="renderId" class="mermaid-svg-wrapper flex items-center justify-center w-full"></div>
        </div>

        <!-- Empty state -->
        <div *ngIf="!studioService.currentDiagram()" class="absolute inset-0 flex flex-col items-center justify-center text-slate-500 space-y-2">
          <svg class="w-10 h-10 stroke-current opacity-40" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/></svg>
          <p class="text-xs">Diagram will render interactively once generated</p>
        </div>

      </div>

      <!-- Interactive Node Hint -->
      <div class="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Click any diagram node to open active-recall tooltips & concepts
        </span>
        <span class="text-slate-400 font-mono text-[11px]">SVG Interactive Canvas</span>
      </div>

    </div>
  `,
  styles: [`
    :host ::ng-deep .mermaid-svg-wrapper svg {
      max-width: 100%;
      height: auto;
      filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.4));
    }
    :host ::ng-deep .node, :host ::ng-deep .mindmap-node {
      cursor: pointer;
      transition: filter 0.2s ease, transform 0.2s ease;
    }
    :host ::ng-deep .node:hover, :host ::ng-deep .mindmap-node:hover {
      filter: brightness(1.25) drop-shadow(0 0 10px rgba(99, 102, 241, 0.8));
    }
  `]
})
export class MermaidDiagramComponent implements AfterViewInit {
  studioService = inject(StudioService);

  @ViewChild('diagramContainer', { static: false }) diagramContainer!: ElementRef;

  renderId = 'mermaid-canvas-' + Math.floor(Math.random() * 100000);
  zoomScale = 1.0;
  private mermaidInstance: any = null;

  get zoomPercentage(): number {
    return Math.round(this.zoomScale * 100);
  }

  constructor() {
    effect(() => {
      const diagram = this.studioService.currentDiagram();
      const type = this.studioService.activeDiagramType();
      if (diagram) {
        setTimeout(() => this.renderDiagram(), 50);
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    await this.initMermaid();
    if (this.studioService.currentDiagram()) {
      this.renderDiagram();
    }
  }

  private async initMermaid(): Promise<void> {
    if (!this.mermaidInstance) {
      try {
        const mod = await import('mermaid');
        this.mermaidInstance = mod.default || mod;
        this.mermaidInstance.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            darkMode: true,
            background: '#0b0f19',
            primaryColor: '#6366f1',
            primaryTextColor: '#ffffff',
            primaryBorderColor: '#4f46e5',
            lineColor: '#06b6d4',
            secondaryColor: '#10b981',
            tertiaryColor: '#f59e0b'
          },
          securityLevel: 'loose',
          fontFamily: 'Inter, sans-serif'
        });
      } catch (e) {
        console.warn('Failed to dynamically load mermaid library:', e);
      }
    }
  }

  switchType(type: 'flowchart' | 'mindmap'): void {
    this.studioService.activeDiagramType.set(type);
  }

  zoomIn(): void {
    if (this.zoomScale < 2.5) {
      this.zoomScale = Math.min(2.5, this.zoomScale + 0.15);
    }
  }

  zoomOut(): void {
    if (this.zoomScale > 0.4) {
      this.zoomScale = Math.max(0.4, this.zoomScale - 0.15);
    }
  }

  resetZoom(): void {
    this.zoomScale = 1.0;
  }

  async renderDiagram(): Promise<void> {
    await this.initMermaid();
    const container = document.getElementById(this.renderId);
    if (!container || !this.mermaidInstance) return;

    const diagram = this.studioService.currentDiagram();
    if (!diagram) return;

    const isFlowchart = this.studioService.activeDiagramType() === 'flowchart';
    let syntax = isFlowchart ? diagram.flowchartSyntax : diagram.mindMapSyntax;

    if (!syntax || !syntax.trim()) {
      syntax = `graph TD\n  A[${this.studioService.currentTopic() || 'Study Topic'}]`;
    }

    try {
      container.innerHTML = '';
      const uniqueSvgId = 'svg-' + Math.floor(Math.random() * 1000000);
      const { svg } = await this.mermaidInstance.render(uniqueSvgId, syntax);
      container.innerHTML = svg;
      this.attachSvgEventListeners(container);
    } catch (err) {
      console.warn('Mermaid render issue, rendering fallback graph:', err);
      try {
        const fallbackSyntax = `graph TD\n  A[${this.studioService.currentTopic() || 'Root Concept'}] --> B[Fundamentals]\n  A --> C[Processing Engine]\n  style A fill:#6366f1,stroke:#4338ca,color:#fff`;
        const { svg } = await this.mermaidInstance.render('fallback-' + Date.now(), fallbackSyntax);
        container.innerHTML = svg;
        this.attachSvgEventListeners(container);
      } catch {}
    }
  }

  private attachSvgEventListeners(container: HTMLElement): void {
    const nodes = container.querySelectorAll('.node, .mindmap-node, g[id*="flowchart"], text');
    nodes.forEach(node => {
      node.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = node.textContent?.trim() || '';
        if (text && text.length > 1) {
          this.studioService.explainNode(text).subscribe();
        }
      });
    });
  }
}
