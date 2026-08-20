import { Component, inject, computed, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { marked } from 'marked';
import { StudioService } from '../../services/studio.service';

@Component({
  selector: 'app-study-notes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-panel rounded-2xl p-6 shadow-xl border border-white/10 flex flex-col h-full">
      
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
        <div class="flex items-center space-x-2.5">
          <div class="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-white">Structured Study Notes</h3>
            <p class="text-xs text-slate-400">Click highlighted terms to inspect active recall items</p>
          </div>
        </div>

        <!-- Copy / Export Action -->
        <button (click)="copyNotes()"
                class="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/5 transition flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
          {{ copied ? 'Copied!' : 'Copy Markdown' }}
        </button>
      </div>

      <!-- Active Micro Explanation Tooltip Panel -->
      <div *ngIf="studioService.activeTermExplanation()" 
           class="mb-4 p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 shadow-lg shadow-indigo-950/50 flex items-start justify-between gap-3 animate-fade-in">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-400">{{ studioService.activeTermExplanation()?.category || 'Concept Node' }}</span>
            <span class="text-xs text-slate-400">•</span>
            <h4 class="text-sm font-semibold text-white">{{ studioService.activeTermExplanation()?.term }}</h4>
          </div>
          <p class="text-xs text-slate-300 mt-1 leading-relaxed">{{ studioService.activeTermExplanation()?.explanation }}</p>
          <p *ngIf="studioService.activeTermExplanation()?.quickFact" class="text-xs text-cyan-300/90 mt-1.5 italic">
            💡 {{ studioService.activeTermExplanation()?.quickFact }}
          </p>
        </div>
        <button (click)="studioService.activeTermExplanation.set(null)"
                class="text-slate-400 hover:text-white p-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Rendered Markdown Container -->
      <div class="prose prose-invert prose-indigo max-w-none flex-1 overflow-y-auto pr-2 text-sm leading-relaxed space-y-3"
           [innerHTML]="renderedNotesHtml()">
      </div>

    </div>
  `,
  styles: [`
    :host ::ng-deep h1 { font-size: 1.25rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.5rem; }
    :host ::ng-deep h2 { font-size: 1.1rem; font-weight: 600; color: #e2e8f0; margin-top: 1rem; margin-bottom: 0.5rem; }
    :host ::ng-deep h3 { font-size: 0.95rem; font-weight: 600; color: #cbd5e1; margin-top: 0.75rem; margin-bottom: 0.25rem; }
    :host ::ng-deep p { margin-bottom: 0.5rem; color: #94a3b8; }
    :host ::ng-deep ul { list-style-type: disc; margin-left: 1.25rem; margin-bottom: 0.75rem; color: #cbd5e1; }
    :host ::ng-deep ol { list-style-type: decimal; margin-left: 1.25rem; margin-bottom: 0.75rem; color: #cbd5e1; }
    :host ::ng-deep li { margin-bottom: 0.25rem; }
    :host ::ng-deep blockquote { border-left: 3px solid #6366f1; padding-left: 0.75rem; color: #94a3b8; font-style: italic; background: rgba(99, 102, 241, 0.05); padding-top: 0.25rem; padding-bottom: 0.25rem; border-radius: 0 4px 4px 0; margin-bottom: 0.75rem; }
  `]
})
export class StudyNotesComponent implements AfterViewChecked {
  studioService = inject(StudioService);
  private el = inject(ElementRef);

  copied = false;

  renderedNotesHtml = computed(() => {
    const raw = this.studioService.currentDiagram()?.summaryNotes || '';
    if (!raw) return '<p class="text-slate-500 italic">No notes generated yet.</p>';
    try {
      return marked.parse(raw);
    } catch {
      return raw;
    }
  });

  ngAfterViewChecked(): void {
    // Attach click event listeners to <mark> elements inside the generated notes
    const marks = this.el.nativeElement.querySelectorAll('mark');
    marks.forEach((mark: HTMLElement) => {
      if (!mark.hasAttribute('data-attached')) {
        mark.setAttribute('data-attached', 'true');
        mark.addEventListener('click', () => {
          const term = mark.textContent?.trim() || '';
          if (term) {
            this.studioService.explainNode(term).subscribe();
          }
        });
      }
    });
  }

  copyNotes() {
    const raw = this.studioService.currentDiagram()?.summaryNotes || '';
    if (!raw) return;
    navigator.clipboard.writeText(raw);
    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
  }
}
