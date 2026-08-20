import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudioService } from '../../services/studio.service';
import { InputFormComponent } from '../input-form/input-form.component';
import { StudyNotesComponent } from '../study-notes/study-notes.component';
import { MermaidDiagramComponent } from '../mermaid-diagram/mermaid-diagram.component';
import { FlashcardCarouselComponent } from '../flashcard-carousel/flashcard-carousel.component';
import { ConceptGlossaryComponent } from '../concept-glossary/concept-glossary.component';

@Component({
  selector: 'app-studio-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    InputFormComponent,
    StudyNotesComponent,
    MermaidDiagramComponent,
    FlashcardCarouselComponent,
    ConceptGlossaryComponent
  ],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      <!-- Input Section -->
      <app-input-form></app-input-form>

      <!-- Active Diagram & Study Sections (Rendered when diagram is available) -->
      <div *ngIf="studioService.currentDiagram()" class="space-y-6 animate-fade-in">
        
        <!-- View Mode: Split / Both -->
        <div *ngIf="studioService.selectedView() === 'both'" class="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[520px]">
          <!-- Left Column: Study Notes -->
          <div class="lg:col-span-5 flex flex-col">
            <app-study-notes class="flex-1"></app-study-notes>
          </div>
          <!-- Right Column: Interactive Diagram Canvas -->
          <div class="lg:col-span-7 flex flex-col">
            <app-mermaid-diagram class="flex-1"></app-mermaid-diagram>
          </div>
        </div>

        <!-- View Mode: Diagram Only -->
        <div *ngIf="studioService.selectedView() === 'diagram'" class="min-h-[600px]">
          <app-mermaid-diagram></app-mermaid-diagram>
        </div>

        <!-- View Mode: Notes Only -->
        <div *ngIf="studioService.selectedView() === 'notes'" class="min-h-[500px]">
          <app-study-notes></app-study-notes>
        </div>

        <!-- Secondary Section: Flashcards Carousel & Concept Glossary -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Active Recall Flashcards -->
          <div class="lg:col-span-7 flex flex-col">
            <app-flashcard-carousel class="flex-1"></app-flashcard-carousel>
          </div>

          <!-- Concept Glossary -->
          <div class="lg:col-span-5 flex flex-col">
            <app-concept-glossary class="flex-1"></app-concept-glossary>
          </div>
        </div>

      </div>

    </div>
  `
})
export class StudioDashboardComponent {
  studioService = inject(StudioService);
}
