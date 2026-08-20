import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudioService } from '../../services/studio.service';
import { ConceptTerm } from '../../models/studio.models';

@Component({
  selector: 'app-concept-glossary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-panel rounded-2xl p-6 shadow-xl border border-white/10 flex flex-col h-full">
      
      <!-- Header with Search -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4 mb-4">
        <div class="flex items-center space-x-2.5">
          <div class="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-white">Concept Glossary & Key Terms</h3>
            <p class="text-xs text-slate-400">Core architectural concepts parsed from synthesis</p>
          </div>
        </div>

        <!-- Search Input -->
        <div class="relative min-w-[200px]">
          <input type="text"
                 [(ngModel)]="searchQuery"
                 placeholder="Search concepts..."
                 class="w-full bg-slate-900/90 border border-slate-700/70 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition">
          <svg class="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
      </div>

      <!-- Terms List -->
      <div class="flex-1 overflow-y-auto space-y-3 pr-1">
        
        <div *ngFor="let item of filteredTerms()" 
             (click)="inspectTerm(item)"
             class="glass-card rounded-xl p-4 cursor-pointer group">
          
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <h4 class="text-sm font-semibold text-white group-hover:text-indigo-300 transition flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              {{ item.term }}
            </h4>
            <span class="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
              {{ item.category || 'General' }}
            </span>
          </div>

          <p class="text-xs text-slate-300 leading-relaxed">{{ item.explanation }}</p>

          <div class="mt-2.5 flex items-center justify-end text-[11px] text-slate-500 group-hover:text-indigo-400 transition">
            <span>Click to inspect & highlight in graph →</span>
          </div>

        </div>

        <div *ngIf="filteredTerms().length === 0" class="text-center text-slate-500 py-8 text-xs">
          No matching concepts found.
        </div>

      </div>

    </div>
  `
})
export class ConceptGlossaryComponent {
  studioService = inject(StudioService);

  searchQuery = '';

  terms = computed<ConceptTerm[]>(() => {
    return this.studioService.currentDiagram()?.conceptTerms || [];
  });

  filteredTerms = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    const list = this.terms();
    if (!q) return list;
    return list.filter(t => 
      t.term.toLowerCase().includes(q) || 
      t.explanation.toLowerCase().includes(q) || 
      (t.category && t.category.toLowerCase().includes(q))
    );
  });

  inspectTerm(item: ConceptTerm): void {
    this.studioService.explainNode(item.term).subscribe();
  }
}
