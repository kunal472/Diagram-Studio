import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { StudioService } from '../../services/studio.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="glass-panel sticky top-0 z-50 border-b border-white/10 px-6 py-3.5">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        
        <!-- Logo & Brand -->
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div>
            <a routerLink="/" class="text-lg font-bold tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition">
              <span>Diagram & Flowchart</span>
              <span class="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Studio</span>
            </a>
            <p class="text-xs text-slate-400 font-medium">AI-Powered Mind Maps & Interactive Study Synthesis</p>
          </div>
        </div>

        <!-- Center Controls / View Switcher (when active diagram is present) -->
        <div class="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1 rounded-xl border border-white/5" *ngIf="studioService.currentDiagram()">
          <button (click)="studioService.selectedView.set('both')"
                  [class.bg-indigo-600]="studioService.selectedView() === 'both'"
                  [class.text-white]="studioService.selectedView() === 'both'"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/></svg>
            Split View
          </button>
          <button (click)="studioService.selectedView.set('diagram')"
                  [class.bg-indigo-600]="studioService.selectedView() === 'diagram'"
                  [class.text-white]="studioService.selectedView() === 'diagram'"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>
            Diagram Only
          </button>
          <button (click)="studioService.selectedView.set('notes')"
                  [class.bg-indigo-600]="studioService.selectedView() === 'notes'"
                  [class.text-white]="studioService.selectedView() === 'notes'"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Notes Only
          </button>
          <button (click)="studioService.selectedView.set('flashcards')"
                  [class.bg-indigo-600]="studioService.selectedView() === 'flashcards'"
                  [class.text-white]="studioService.selectedView() === 'flashcards'"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            Flashcards
          </button>
        </div>

        <!-- Navigation Links & Actions -->
        <div class="flex items-center space-x-3">
          <a routerLink="/" 
             routerLinkActive="text-indigo-400 border-indigo-500/40" 
             [routerLinkActiveOptions]="{ exact: true }"
             class="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            Studio Creator
          </a>

          <a routerLink="/workspaces" 
             routerLinkActive="text-indigo-400 border-indigo-500/40"
             class="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
            Saved Workspaces
            <span *ngIf="studioService.savedWorkspaces().length > 0" class="px-1.5 py-0.5 rounded-full text-xs bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
              {{ studioService.savedWorkspaces().length }}
            </span>
          </a>

          <button *ngIf="studioService.currentDiagram()" 
                  (click)="studioService.saveCurrentWorkspace()"
                  class="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
            Save Workspace
          </button>
        </div>

      </div>
    </header>
  `
})
export class NavbarComponent {
  studioService = inject(StudioService);
  authService = inject(AuthService);
}
