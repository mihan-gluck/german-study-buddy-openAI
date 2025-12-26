// src/app/components/teacher-dashboard/roleplay-module-form.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LearningModulesService } from '../../services/learning-modules.service';

@Component({
  selector: 'app-roleplay-module-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h4 class="mb-0">🎭 Create Role-Play Module</h4>
              <button class="btn btn-secondary" (click)="goBack()">
                <i class="fas fa-arrow-left"></i> Back
              </button>
            </div>
            
            <div class="card-body">
              <form [formGroup]="moduleForm" (ngSubmit)="onSubmit()">
                
                <!-- Basic Information -->
                <div class="row mb-4">
                  <div class="col-12">
                    <h5 class="border-bottom pb-2">📝 Basic Information</h5>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Module Title *</label>
                    <input type="text" class="form-control" formControlName="title" 
                           placeholder="e.g., Restaurant Conversation">
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Duration (minutes) *</label>
                    <input type="number" class="form-control" formControlName="estimatedDuration" 
                           placeholder="e.g., 20">
                  </div>
                  
                  <div class="col-12 mb-3">
                    <label class="form-label">Description *</label>
                    <textarea class="form-control" rows="2" formControlName="description" 
                              placeholder="Brief description of the role-play scenario"></textarea>
                  </div>
                </div>

                <!-- Language & Level -->
                <div class="row mb-4">
                  <div class="col-12">
                    <h5 class="border-bottom pb-2">🌍 Language & Level</h5>
                  </div>
                  
                  <div class="col-md-3 mb-3">
                    <label class="form-label">Target Language *</label>
                    <select class="form-select" formControlName="targetLanguage">
                      <option value="">Select Language</option>
                      <option *ngFor="let language of availableLanguages" [value]="language">{{language}}</option>
                    </select>
                  </div>
                  
                  <div class="col-md-3 mb-3">
                    <label class="form-label">Native Language *</label>
                    <select class="form-select" formControlName="nativeLanguage">
                      <option value="">Select Language</option>
                      <option *ngFor="let language of availableNativeLanguages" [value]="language">{{language}}</option>
                    </select>
                  </div>
                  
                  <div class="col-md-3 mb-3">
                    <label class="form-label">Level *</label>
                    <select class="form-select" formControlName="level">
                      <option value="">Select Level</option>
                      <option *ngFor="let level of levels" [value]="level">{{level}}</option>
                    </select>
                  </div>
                  
                  <div class="col-md-3 mb-3">
                    <label class="form-label">Difficulty *</label>
                    <select class="form-select" formControlName="difficulty">
                      <option value="">Select Difficulty</option>
                      <option *ngFor="let difficulty of difficulties" [value]="difficulty">{{difficulty}}</option>
                    </select>
                  </div>
                </div>

                <!-- Role-Play Scenario -->
                <div class="row mb-4" formGroupName="rolePlayScenario">
                  <div class="col-12">
                    <h5 class="border-bottom pb-2">🎭 Role-Play Scenario</h5>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Situation *</label>
                    <input type="text" class="form-control" formControlName="situation" 
                           placeholder="e.g., At a restaurant, Job interview, Shopping">
                    <small class="form-text text-muted">The context/location of the role-play</small>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Setting</label>
                    <input type="text" class="form-control" formControlName="setting" 
                           placeholder="e.g., A busy restaurant in Berlin">
                    <small class="form-text text-muted">Detailed description of the environment</small>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Student Role *</label>
                    <input type="text" class="form-control" formControlName="studentRole" 
                           placeholder="e.g., Customer, Tourist, Job applicant">
                    <small class="form-text text-muted">What role the student plays</small>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label class="form-label">AI Role *</label>
                    <input type="text" class="form-control" formControlName="aiRole" 
                           placeholder="e.g., Waiter, Shop assistant, Interviewer">
                    <small class="form-text text-muted">What role the AI plays</small>
                  </div>
                  
                  <div class="col-12 mb-3">
                    <label class="form-label">Objective</label>
                    <textarea class="form-control" rows="2" formControlName="objective" 
                              placeholder="e.g., Order a meal, ask about prices, and request the bill"></textarea>
                    <small class="form-text text-muted">What the student should accomplish in this role-play</small>
                  </div>
                </div>

                <!-- Vocabulary Constraints -->
                <div class="row mb-4">
                  <div class="col-12">
                    <h5 class="border-bottom pb-2">📚 Allowed Vocabulary</h5>
                    <p class="text-muted">Define the vocabulary the AI should use and teach</p>
                  </div>
                  
                  <div class="col-12 mb-3">
                    <div class="row g-2 mb-2">
                      <div class="col-md-4">
                        <input type="text" class="form-control" [(ngModel)]="newVocabWord" 
                               [ngModelOptions]="{standalone: true}" placeholder="Word/Phrase">
                      </div>
                      <div class="col-md-4">
                        <input type="text" class="form-control" [(ngModel)]="newVocabTranslation" 
                               [ngModelOptions]="{standalone: true}" placeholder="Translation">
                      </div>
                      <div class="col-md-3">
                        <input type="text" class="form-control" [(ngModel)]="newVocabCategory" 
                               [ngModelOptions]="{standalone: true}" placeholder="Category">
                      </div>
                      <div class="col-md-1">
                        <button type="button" class="btn btn-outline-primary w-100" (click)="addVocabulary()">
                          <i class="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div class="vocabulary-list">
                      <div *ngFor="let vocab of allowedVocabulary; let i = index" 
                           class="d-flex align-items-center mb-2 p-2 border rounded">
                        <div class="flex-grow-1">
                          <strong>{{vocab.word}}</strong> - {{vocab.translation}}
                          <small class="text-muted ms-2">({{vocab.category}})</small>
                        </div>
                        <button type="button" class="btn btn-sm btn-outline-danger" (click)="removeVocabulary(i)">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Grammar Constraints -->
                <div class="row mb-4">
                  <div class="col-12">
                    <h5 class="border-bottom pb-2">📖 Allowed Grammar</h5>
                    <p class="text-muted">Define the grammar structures the AI should focus on</p>
                  </div>
                  
                  <div class="col-12 mb-3">
                    <div class="row g-2 mb-2">
                      <div class="col-md-6">
                        <input type="text" class="form-control" [(ngModel)]="newGrammarStructure" 
                               [ngModelOptions]="{standalone: true}" placeholder="Grammar structure (e.g., Present tense)">
                      </div>
                      <div class="col-md-5">
                        <input type="text" class="form-control" [(ngModel)]="newGrammarExample" 
                               [ngModelOptions]="{standalone: true}" placeholder="Example">
                      </div>
                      <div class="col-md-1">
                        <button type="button" class="btn btn-outline-primary w-100" (click)="addGrammar()">
                          <i class="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div class="grammar-list">
                      <div *ngFor="let grammar of allowedGrammar; let i = index" 
                           class="d-flex align-items-center mb-2 p-2 border rounded">
                        <div class="flex-grow-1">
                          <strong>{{grammar.structure}}</strong>
                          <div class="text-muted small">Examples: {{grammar.examples.join(', ')}}</div>
                        </div>
                        <button type="button" class="btn btn-sm btn-outline-danger" (click)="removeGrammar(i)">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Optional Conversation Flow -->
                <div class="row mb-4">
                  <div class="col-12">
                    <h5 class="border-bottom pb-2">💬 Conversation Flow (Optional)</h5>
                    <p class="text-muted">Define the expected flow of the conversation</p>
                  </div>
                  
                  <div class="col-12 mb-3">
                    <div class="row g-2 mb-2">
                      <div class="col-md-3">
                        <input type="text" class="form-control" [(ngModel)]="newFlowStage" 
                               [ngModelOptions]="{standalone: true}" placeholder="Stage (e.g., greeting)">
                      </div>
                      <div class="col-md-4">
                        <input type="text" class="form-control" [(ngModel)]="newFlowAiPrompt" 
                               [ngModelOptions]="{standalone: true}" placeholder="What AI might say">
                      </div>
                      <div class="col-md-4">
                        <input type="text" class="form-control" [(ngModel)]="newFlowExpectedResponse" 
                               [ngModelOptions]="{standalone: true}" placeholder="Expected student response">
                      </div>
                      <div class="col-md-1">
                        <button type="button" class="btn btn-outline-primary w-100" (click)="addConversationFlow()">
                          <i class="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div class="flow-list">
                      <div *ngFor="let flow of conversationFlow; let i = index" 
                           class="mb-3 p-3 border rounded">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                          <h6 class="mb-0">Stage: {{flow.stage}}</h6>
                          <button type="button" class="btn btn-sm btn-outline-danger" (click)="removeConversationFlow(i)">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                        <div class="row">
                          <div class="col-md-6">
                            <small class="text-muted">AI might say:</small>
                            <div>{{flow.aiPrompts.join(', ')}}</div>
                          </div>
                          <div class="col-md-6">
                            <small class="text-muted">Student should try:</small>
                            <div>{{flow.expectedResponses.join(', ')}}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Form Actions -->
                <div class="row">
                  <div class="col-12">
                    <div class="d-flex justify-content-end gap-2">
                      <button type="button" class="btn btn-secondary" (click)="goBack()">
                        Cancel
                      </button>
                      <button type="submit" class="btn btn-primary" [disabled]="moduleForm.invalid || isSubmitting">
                        <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                        Create Role-Play Module
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vocabulary-list, .grammar-list, .flow-list {
      max-height: 300px;
      overflow-y: auto;
    }
    .border {
      border-color: #dee2e6 !important;
    }
  `]
})
export class RoleplayModuleFormComponent implements OnInit {
  moduleForm: FormGroup;
  isSubmitting = false;

  // Form options
  levels: string[] = [];
  difficulties: string[] = [];
  availableLanguages: string[] = [];
  availableNativeLanguages: string[] = [];

  // Dynamic arrays
  allowedVocabulary: Array<{word: string, translation: string, category: string}> = [];
  allowedGrammar: Array<{structure: string, examples: string[], level: string}> = [];
  conversationFlow: Array<{stage: string, aiPrompts: string[], expectedResponses: string[], helpfulPhrases: string[]}> = [];

  // Input fields for dynamic arrays
  newVocabWord = '';
  newVocabTranslation = '';
  newVocabCategory = '';
  newGrammarStructure = '';
  newGrammarExample = '';
  newFlowStage = '';
  newFlowAiPrompt = '';
  newFlowExpectedResponse = '';

  constructor(
    private fb: FormBuilder,
    private learningModulesService: LearningModulesService,
    private router: Router
  ) {
    this.moduleForm = this.createForm();
  }

  ngOnInit(): void {
    this.initializeOptions();
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      targetLanguage: ['English', Validators.required],
      nativeLanguage: ['English', Validators.required],
      level: ['', Validators.required],
      category: ['Conversation'], // Fixed for role-play
      difficulty: ['', Validators.required],
      estimatedDuration: ['', [Validators.required, Validators.min(1)]],
      rolePlayScenario: this.fb.group({
        situation: ['', Validators.required],
        studentRole: ['', Validators.required],
        aiRole: ['', Validators.required],
        setting: [''],
        objective: ['']
      })
    });
  }

  initializeOptions(): void {
    this.levels = this.learningModulesService.getAvailableLevels();
    this.difficulties = this.learningModulesService.getAvailableDifficulties();
    this.availableLanguages = this.learningModulesService.getAvailableLanguages();
    this.availableNativeLanguages = this.learningModulesService.getAvailableNativeLanguages();
  }

  addVocabulary(): void {
    if (this.newVocabWord.trim() && this.newVocabTranslation.trim()) {
      this.allowedVocabulary.push({
        word: this.newVocabWord.trim(),
        translation: this.newVocabTranslation.trim(),
        category: this.newVocabCategory.trim() || 'general'
      });
      this.newVocabWord = '';
      this.newVocabTranslation = '';
      this.newVocabCategory = '';
    }
  }

  removeVocabulary(index: number): void {
    this.allowedVocabulary.splice(index, 1);
  }

  addGrammar(): void {
    if (this.newGrammarStructure.trim()) {
      const existingGrammar = this.allowedGrammar.find(g => g.structure === this.newGrammarStructure.trim());
      if (existingGrammar && this.newGrammarExample.trim()) {
        existingGrammar.examples.push(this.newGrammarExample.trim());
      } else if (!existingGrammar) {
        this.allowedGrammar.push({
          structure: this.newGrammarStructure.trim(),
          examples: this.newGrammarExample.trim() ? [this.newGrammarExample.trim()] : [],
          level: this.moduleForm.get('level')?.value || 'A1'
        });
      }
      this.newGrammarStructure = '';
      this.newGrammarExample = '';
    }
  }

  removeGrammar(index: number): void {
    this.allowedGrammar.splice(index, 1);
  }

  addConversationFlow(): void {
    if (this.newFlowStage.trim()) {
      this.conversationFlow.push({
        stage: this.newFlowStage.trim(),
        aiPrompts: this.newFlowAiPrompt.trim() ? [this.newFlowAiPrompt.trim()] : [],
        expectedResponses: this.newFlowExpectedResponse.trim() ? [this.newFlowExpectedResponse.trim()] : [],
        helpfulPhrases: []
      });
      this.newFlowStage = '';
      this.newFlowAiPrompt = '';
      this.newFlowExpectedResponse = '';
    }
  }

  removeConversationFlow(index: number): void {
    this.conversationFlow.splice(index, 1);
  }

  onSubmit(): void {
    if (this.moduleForm.invalid) {
      this.moduleForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.moduleForm.value;

    // Prepare the role-play module data
    const moduleData = {
      ...formValue,
      content: {
        introduction: `Welcome to this role-play scenario: ${formValue.rolePlayScenario.situation}`,
        rolePlayScenario: formValue.rolePlayScenario,
        allowedVocabulary: this.allowedVocabulary,
        allowedGrammar: this.allowedGrammar,
        conversationFlow: this.conversationFlow,
        keyTopics: [formValue.rolePlayScenario.situation],
        examples: [],
        exercises: []
      },
      aiTutorConfig: {
        personality: `experienced ${formValue.targetLanguage} tutor specialized in role-play scenarios`,
        focusAreas: [
          'Role-play conversation',
          'Situational vocabulary',
          'Natural dialogue flow',
          'Cultural appropriateness'
        ],
        helpfulPhrases: this.allowedVocabulary.map(v => v.word),
        commonMistakes: [],
        culturalNotes: []
      },
      tags: ['role-play', formValue.rolePlayScenario.situation.toLowerCase(), formValue.level.toLowerCase()]
    };

    this.learningModulesService.createModule(moduleData).subscribe({
      next: (response) => {
        alert('Role-play module created successfully!');
        this.goBack();
      },
      error: (error) => {
        console.error('Error creating role-play module:', error);
        alert('Failed to create role-play module. Please try again.');
        this.isSubmitting = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/learning-modules']);
  }
}