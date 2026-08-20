import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StudioService } from '../../services/studio.service';
import { Workspace } from '../../models/studio.models';

@Component({
  selector: 'app-workspace-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      <!-- Top Banner -->
      <div class="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-3 mb-1">
            <span class="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            </span>
            <h1 class="text-2xl font-bold text-white tracking-tight">Saved Study Workspaces</h1>
          </div>
          <p class="text-xs text-slate-400">Persisted in PostgreSQL database with vector embeddings and active study materials.</p>
        </div>

        <!-- Search Bar & Actions -->
        <div class="flex items-center space-x-3">
          <div class="relative min-w-[240px]">
            <input type="text"
                   [(ngModel)]="searchQuery"
                   placeholder="Search saved workspaces..."
                   class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition">
            <svg class="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>

          <button (click)="refresh()"
                  class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/5 transition" title="Refresh Workspaces">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </button>
        </div>
      </div>

      <!-- Workspaces Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div *ngFor="let ws of filteredWorkspaces()" 
             class="glass-panel rounded-2xl p-6 border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col justify-between group shadow-xl">
          
          <div>
            <!-- Header Card -->
            <div class="flex items-start justify-between gap-3 mb-3">
              <div>
                <span class="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {{ ws.topic || 'General' }}
                </span>
                <h3 class="text-lg font-bold text-white mt-2 group-hover:text-indigo-300 transition line-clamp-1">
                  {{ ws.title }}
                </h3>
              </div>

              <!-- Delete Button -->
              <button *ngIf="ws.id" 
                      (click)="deleteWorkspace(ws.id, $event)"
                      class="text-slate-500 hover:text-rose-400 p-1 transition" title="Delete Workspace">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>

            <!-- Notes Preview Snippet -->
            <p class="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
              {{ ws.summaryNotes }}
            </p>
          </div>

          <!-- Bottom Action -->
          <div class="pt-4 border-t border-white/5 flex items-center justify-between">
            <span class="text-[11px] text-slate-500 font-mono">
              {{ ws.createdAt ? (ws.createdAt | date:'shortDate') : 'Recent' }}
            </span>

            <button (click)="openWorkspace(ws)"
                    class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition flex items-center gap-1.5">
              <span>Open Studio</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          </div>

        </div>

      </div>

      <!-- Empty State -->
      <div *ngIf="filteredWorkspaces().length === 0" class="glass-panel rounded-2xl p-12 text-center text-slate-500">
        <svg class="w-12 h-12 mx-auto mb-3 opacity-30 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
        <h4 class="text-sm font-semibold text-slate-400">No saved workspaces found</h4>
        <p class="text-xs text-slate-500 mt-1">Generate a study graph in the Studio and click "Save Workspace" to store it in PostgreSQL.</p>
      </div>

    </div>
  `
})
export class WorkspaceListComponent implements OnInit {
  studioService = inject(StudioService);
  private router = inject(Router);

  searchQuery = '';

  workspaces = computed(() => this.studioService.savedWorkspaces());

  filteredWorkspaces = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    const list = this.workspaces();
    if (!q) return list;
    return list.filter(w => 
      w.title.toLowerCase().includes(q) || 
      w.topic.toLowerCase().includes(q) || 
      w.summaryNotes.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.studioService.loadAllWorkspaces().subscribe();
  }

  openWorkspace(ws: Workspace): void {
    this.studioService.loadSavedWorkspace(ws);
    this.router.navigate(['/']);
  }

  deleteWorkspace(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this workspace?')) {
      this.studioService.deleteWorkspace(id).subscribe();
    }
  }
}
