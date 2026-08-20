import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudioService } from '../../services/studio.service';

@Component({
  selector: 'app-input-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-white/10">
      
      <!-- Top Gradient Glow Accent -->
      <div class="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 space-y-6">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h2 class="text-xl font-bold text-white flex items-center gap-2.5">
              <span class="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </span>
              Visual Knowledge Synthesis Studio
            </h2>
            <p class="text-xs text-slate-400 mt-1">Transform any topic or raw notes into interactive diagrams, mind maps, and active-recall flashcards.</p>
          </div>

          <!-- Preset Topics Chips -->
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="text-xs text-slate-500 font-medium mr-1">Quick Topics:</span>
            <button *ngFor="let sample of sampleTopics"
                    type="button"
                    (click)="selectSample(sample)"
                    class="text-xs px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 hover:bg-indigo-600 hover:text-white border border-white/5 transition">
              {{ sample }}
            </button>
          </div>
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          
          <!-- Topic Input -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Topic or Subject Title <span class="text-rose-400">*</span>
            </label>
            <div class="relative">
              <input type="text"
                     [(ngModel)]="topic"
                     name="topic"
                     placeholder="e.g. Distributed Consensus & Raft Protocol, Neural Transformers, Cellular Respiration..."
                     required
                     class="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition shadow-inner">
            </div>
          </div>

          <!-- Raw Notes / Textarea -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Raw Study Notes or Reference Content <span class="text-slate-500 font-normal">(Optional)</span>
              </label>
              <span class="text-xs text-slate-500">{{ rawText.length }} chars</span>
            </div>
            <textarea [(ngModel)]="rawText"
                      name="rawText"
                      rows="4"
                      placeholder="Paste raw textbook passages, lecture notes, or requirements here for deeper contextual graph extraction..."
                      class="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition shadow-inner resize-y"></textarea>
          </div>

          <!-- Options & Submit Button -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            
            <!-- Detail Level Selector -->
            <div class="flex items-center space-x-3">
              <span class="text-xs text-slate-400 font-medium">Synthesis Mode:</span>
              <div class="inline-flex rounded-lg bg-slate-900/90 p-1 border border-white/5">
                <button type="button"
                        (click)="detailLevel = 'standard'"
                        [class.bg-indigo-600]="detailLevel === 'standard'"
                        [class.text-white]="detailLevel === 'standard'"
                        class="px-2.5 py-1 text-xs rounded-md text-slate-400 hover:text-white transition">
                  Balanced
                </button>
                <button type="button"
                        (click)="detailLevel = 'deep'"
                        [class.bg-indigo-600]="detailLevel === 'deep'"
                        [class.text-white]="detailLevel === 'deep'"
                        class="px-2.5 py-1 text-xs rounded-md text-slate-400 hover:text-white transition">
                  Comprehensive
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <button type="submit"
                    [disabled]="studioService.loading() || !topic.trim()"
                    class="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-2.5 transform active:scale-95">
              
              <svg *ngIf="studioService.loading()" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>

              <svg *ngIf="!studioService.loading()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
              </svg>

              <span>{{ studioService.loading() ? 'Synthesizing Knowledge Graph...' : 'Generate Studio Flow & Diagrams' }}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  `
})
export class InputFormComponent {
  studioService = inject(StudioService);

  topic = '';
  rawText = '';
  detailLevel = 'standard';

  sampleTopics = [
    'Raft Consensus Protocol',
    'Neural Attention Mechanisms',
    'PostgreSQL pgvector Architecture',
    'Microservices Event Sourcing'
  ];

  selectSample(sample: string) {
    this.topic = sample;
  }

  onSubmit() {
    if (!this.topic.trim()) return;
    this.studioService.generateStudioContent(this.topic.trim(), this.rawText.trim(), this.detailLevel).subscribe();
  }
}
