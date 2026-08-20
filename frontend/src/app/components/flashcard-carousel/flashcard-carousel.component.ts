import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudioService } from '../../services/studio.service';
import { Flashcard } from '../../models/studio.models';

@Component({
  selector: 'app-flashcard-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-panel rounded-2xl p-6 shadow-xl border border-white/10 flex flex-col h-full">
      
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
        <div class="flex items-center space-x-2.5">
          <div class="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-white">Active Recall Flashcards</h3>
            <p class="text-xs text-slate-400">Test and solidify your understanding</p>
          </div>
        </div>

        <span *ngIf="cards().length > 0" class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-amber-300 border border-white/5">
          {{ currentIndex() + 1 }} / {{ cards().length }}
        </span>
      </div>

      <!-- Flashcard Interactive Stage -->
      <div class="flex-1 flex flex-col items-center justify-center min-h-[260px] relative">
        
        <div *ngIf="currentCard() as card; else noCards" 
             (click)="toggleFlip()"
             class="w-full max-w-lg cursor-pointer select-none group perspective-1000">
          
          <!-- Card Body with 3D Flip -->
          <div class="relative w-full min-h-[220px] rounded-2xl transition-transform duration-500 transform-style-3d shadow-2xl p-6 sm:p-8 flex flex-col justify-between border"
               [class.bg-gradient-to-br]="true"
               [class.from-slate-900]="!isFlipped()"
               [class.to-indigo-950]="!isFlipped()"
               [class.border-indigo-500_30]="!isFlipped()"
               [class.from-indigo-950]="isFlipped()"
               [class.to-slate-900]="isFlipped()"
               [class.border-emerald-500_40]="isFlipped()">
            
            <!-- Top Card Header -->
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                    [class.bg-indigo-500_20]="!isFlipped()"
                    [class.text-indigo-300]="!isFlipped()"
                    [class.bg-emerald-500_20]="isFlipped()"
                    [class.text-emerald-300]="isFlipped()">
                {{ isFlipped() ? 'Answer & Explanation' : 'Question (Click to Flip)' }}
              </span>

              <span *ngIf="card.relatedNode" 
                    (click)="$event.stopPropagation(); inspectNode(card.relatedNode)"
                    class="text-xs text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                {{ card.relatedNode }}
              </span>
            </div>

            <!-- Content Area -->
            <div class="my-6">
              <p *ngIf="!isFlipped()" class="text-base sm:text-lg font-medium text-white leading-relaxed">
                {{ card.question }}
              </p>
              <p *ngIf="isFlipped()" class="text-base font-normal text-emerald-100 leading-relaxed">
                {{ card.answer }}
              </p>
            </div>

            <!-- Bottom Hint -->
            <div class="flex items-center justify-between text-xs text-slate-500">
              <span>{{ isFlipped() ? 'Click to view question' : 'Click card or button below to reveal answer' }}</span>
              <span class="text-indigo-400 group-hover:translate-x-1 transition-transform">↻ Flip Card</span>
            </div>

          </div>

        </div>

        <ng-template #noCards>
          <div class="text-center text-slate-500 py-12">
            <svg class="w-12 h-12 mx-auto mb-2 opacity-40 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            <p class="text-xs">No active recall flashcards available.</p>
          </div>
        </ng-template>

      </div>

      <!-- Carousel Navigation Controls -->
      <div *ngIf="cards().length > 1" class="flex items-center justify-between pt-4 border-t border-white/5 mt-4">
        <button (click)="previousCard()"
                class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-white/5 transition flex items-center gap-1.5 shadow">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          Previous
        </button>

        <button (click)="toggleFlip()"
                class="px-5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-semibold transition">
          {{ isFlipped() ? 'Hide Answer' : 'Reveal Answer' }}
        </button>

        <button (click)="nextCard()"
                class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-white/5 transition flex items-center gap-1.5 shadow">
          Next
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>

    </div>
  `
})
export class FlashcardCarouselComponent {
  studioService = inject(StudioService);

  currentIndex = signal(0);
  isFlipped = signal(false);

  cards = computed<Flashcard[]>(() => {
    return this.studioService.currentDiagram()?.flashcards || [];
  });

  currentCard = computed<Flashcard | null>(() => {
    const list = this.cards();
    if (!list || list.length === 0) return null;
    return list[this.currentIndex()] || null;
  });

  toggleFlip(): void {
    this.isFlipped.update(v => !v);
  }

  nextCard(): void {
    const list = this.cards();
    if (list.length > 0) {
      this.currentIndex.update(idx => (idx + 1) % list.length);
      this.isFlipped.set(false);
    }
  }

  previousCard(): void {
    const list = this.cards();
    if (list.length > 0) {
      this.currentIndex.update(idx => (idx - 1 + list.length) % list.length);
      this.isFlipped.set(false);
    }
  }

  inspectNode(nodeName: string): void {
    this.studioService.explainNode(nodeName).subscribe();
  }
}
