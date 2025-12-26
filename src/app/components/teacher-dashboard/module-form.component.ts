// src/app/components/teacher-dashboard/module-form.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LearningModulesService, LearningModule } from '../../services/learning-modules.service';

@Component({
  selector: 'app-module-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h4 class="mb-0">{{isEditMode ? 'Edit' : 'Create'}} Learning Module</h4>
              <button class="btn btn-secondary" (click)="goBack()">
                <i class="fas fa-arrow-left"></i> Back
              </button>
            </div>
            
            <div class="card-body">
              <form [formGroup]="moduleForm" (ngSubmit)="onSubmit()">
                <!-- Basic Information -->
                <div class="row mb-4">
                  <div class="col-12">
                    <h5 class="border-bottom pb-2">Basic Information</h5>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Title *</label>
                    <input type="text" class="form-control" formControlName="title" 
                           placeholder="Enter module title">
                    <div class="text-danger" *ngIf="moduleForm.get('title')?.invalid && moduleForm.get('title')?.touched">
                      Title is required
                    </div>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Estimated Duration (minutes) *</label>
                    <input type="number" class="form-control" formControlName="estimatedDuration" 
                           placeholder="e.g., 45">
                    <div class="text-danger" *ngIf="moduleForm.get('estimatedDuration')?.invalid && moduleForm.get('estimatedDuration')?.touched">
                      Duration is required
                    </div>
                  </div>
                  
                  <div class="col-12 mb-3">
                    <label class="form-label">Description *</label>
                    <textarea class="form-control" rows="3" formControlName="description" 
                              placeholder="Describe what students will learn in this module"></textarea>
                    <div class="text-danger" *ngIf="moduleForm.get('description')?.invalid && moduleForm.get('description')?.touched">
                      Description is required
                    </div>
                  </div>
                </div>

                <!-- Classification -->
                <div class="row mb-4">
                  <div class="col-12">
                    <h5 class="border-bottom pb-2">Classification</h5>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Target Language *</label>
                    <select class="form-select" formControlName="targetLanguage" (change)="onTargetLanguageChange()">
                      <option value="">Select Target Language</option>
                      <option *ngFor="let language of availableLanguages" [value]="language">{{language}}</option>
                    </select>
                    <small class="form-text text-muted">The language students will learn</small>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Native Language *</label>
                    <select class="form-select" formControlName="nativeLanguage">
                      <option value="">Select Native Language</option>
                      <option *ngFor="let language of availableNativeLanguages" [value]="language">{{language}}</option>
                    </select>
                    <small class="form-text text-muted">The language for explanations and instructions</small>
                  </div>
                  
                  <div class="col-md-4 mb-3">
                    <label class="form-label">Level *</label>
                    <select class="form-select" formControlName="level">
                      <option value="">Select Level</option>
                      <option *ngFor="let level of levels" [value]="level">{{level}}</option>
                    </select>
                  </div>
                  
                  <div class="col-md-4 mb-3">
                    <label class="form-label">Category *</label>
                    <select class="form-select" formControlName="category">
                      <option value="">Select Category</option>
                      <option *ngFor="let category of categories" [value]="category">{{category}}</option>
                    </select>
                  </div>
                  
                  <div class="col-md-4 mb-3">
                    <label class="form-label">Difficulty *</label>
                    <select class="form-select" formControlName="difficulty">
                      <option value="">Select Difficulty</option>
                      <option *ngFor="let difficulty of difficulties" [value]="difficulty">{{difficulty}}</option>
                    </select>
                  </div>
                </div>

                <!-- Learning Objectives -->
                <div class="row mb-4">
                  <div class="col-12">
                    <h5 class="border-bottom pb-2">Learning Objectives</h5>
                    <div formArrayName="learningObjectives">
                      <div *ngFor="let objective of learningObjectives.controls; let i = index" 
                           [formGroupName]="i" class="mb-3 p-3 border rounded">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                          <h6 class="mb-0">Objective {{i + 1}}</h6>
                          <button type="button" class="btn btn-sm btn-outline-danger" 
                                  (click)="removeLearningObjective(i)" 
                                  [disabled]="learningObjectives.length === 1">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                        <div class="row">
                          <div class="col-md-6 mb-2">
                            <label class="form-label">Objective</label>
                            <input type="text" class="form-control" formControlName="objective" 
                                   placeholder="e.g., Learn basic greetings">
                          </div>
                          <div class="col-md-6 mb-2">
                            <label class="form-label">Description</label>
                            <input type="text" class="form-control" formControlName="description" 
                                   placeholder="Detailed description">
                          </div>
                        </div>
                      </div>
                    </div>
                    <button type="button" class="btn btn-outline-primary btn-sm" 
                            (click)="addLearningObjective()">
                      <i class="fas fa-plus"></i> Add Objective
                    </button>
                  </div>
                </div>

                <!-- Content -->
                <div class="row mb-4" formGroupName="content">
                  <div class="col-12">
                    <h5 class="border-bottom pb-2">Module Content</h5>
                  </div>
                  
                  <div class="col-12 mb-3">
                    <label class="form-label">Introduction</label>
                    <textarea class="form-control" rows="4" formControlName="introduction" 
                              placeholder="Write an engaging introduction to the module"></textarea>
                  </div>
                  
                  <div class="col-12 mb-3">
                    <label class="form-label">Key Topics</label>
                    <div class="input-group mb-2">
                      <input type="text" class="form-control" [(ngModel)]="newKeyTopic" 
                             [ngModelOptions]="{standalone: true}"
                             placeholder="Enter a key topic" (keyup.enter)="addKeyTopic()">
                      <button type="button" class="btn btn-outline-primary" (click)="addKeyTopic()">
                        <i class="fas fa-plus"></i>
                      </button>
                    </div>
                    <div class="d-flex flex-wrap gap-2">
                      <span *ngFor="let topic of keyTopics; let i = index" 
                            class="badge bg-secondary d-flex align-items-center">
                        {{topic}}
                        <button type="button" class="btn-close btn-close-white ms-2" 
                                (click)="removeKeyTopic(i)" style="font-size: 0.7em;"></button>
                      </span>
                    </div>
                  </div>
                </div>

                <!-- AI Tutor Configuration -->
                <div class="row mb-4" formGroupName="aiTutorConfig">
                  <div class="col-12">
                    <h5 class="border-bottom pb-2">AI Tutor Configuration</h5>
                  </div>
                  
                  <div class="col-12 mb-3">
                    <label class="form-label">Personality</label>
                    <input type="text" class="form-control" formControlName="personality" 
                           placeholder="e.g., friendly and encouraging German tutor">
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Focus Areas</label>
                    <div class="input-group mb-2">
                      <input type="text" class="form-control" [(ngModel)]="newFocusArea" 
                             [ngModelOptions]="{standalone: true}"
                             placeholder="Enter focus area" (keyup.enter)="addFocusArea()">
                      <button type="button" class="btn btn-outline-primary" (click)="addFocusArea()">
                        <i class="fas fa-plus"></i>
                      </button>
                    </div>
                    <div class="d-flex flex-wrap gap-1">
                      <span *ngFor="let area of focusAreas; let i = index" 
                            class="badge bg-info d-flex align-items-center">
                        {{area}}
                        <button type="button" class="btn-close btn-close-white ms-1" 
                                (click)="removeFocusArea(i)" style="font-size: 0.6em;"></button>
                      </span>
                    </div>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Helpful Phrases</label>
                    <div class="input-group mb-2">
                      <input type="text" class="form-control" [(ngModel)]="newHelpfulPhrase" 
                             [ngModelOptions]="{standalone: true}"
                             placeholder="Enter helpful phrase" (keyup.enter)="addHelpfulPhrase()">
                      <button type="button" class="btn btn-outline-primary" (click)="addHelpfulPhrase()">
                        <i class="fas fa-plus"></i>
                      </button>
                    </div>
                    <div class="d-flex flex-wrap gap-1">
                      <span *ngFor="let phrase of helpfulPhrases; let i = index" 
                            class="badge bg-success d-flex align-items-center">
                        {{phrase}}
                        <button type="button" class="btn-close btn-close-white ms-1" 
                                (click)="removeHelpfulPhrase(i)" style="font-size: 0.6em;"></button>
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Tags -->
                <div class="row mb-4">
                  <div class="col-12">
                    <h5 class="border-bottom pb-2">Tags</h5>
                    <div class="input-group mb-2">
                      <input type="text" class="form-control" [(ngModel)]="newTag" 
                             [ngModelOptions]="{standalone: true}"
                             placeholder="Enter tag" (keyup.enter)="addTag()">
                      <button type="button" class="btn btn-outline-primary" (click)="addTag()">
                        <i class="fas fa-plus"></i>
                      </button>
                    </div>
                    <div class="d-flex flex-wrap gap-2">
                      <span *ngFor="let tag of tags; let i = index" 
                            class="badge bg-warning text-dark d-flex align-items-center">
                        {{tag}}
                        <button type="button" class="btn-close ms-2" 
                                (click)="removeTag(i)" style="font-size: 0.7em;"></button>
                      </span>
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
                        {{isEditMode ? 'Update' : 'Create'}} Module
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
    .badge {
      font-size: 0.8em;
    }
    .btn-close {
      padding: 0;
      margin: 0;
    }
  `]
})
export class ModuleFormComponent implements OnInit {
  moduleForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  moduleId: string | null = null;

  // Form options
  levels: string[] = [];
  categories: string[] = [];
  difficulties: string[] = [];
  availableLanguages: string[] = [];
  availableNativeLanguages: string[] = [];

  // Dynamic arrays
  keyTopics: string[] = [];
  focusAreas: string[] = [];
  helpfulPhrases: string[] = [];
  tags: string[] = [];

  // Input fields for dynamic arrays
  newKeyTopic = '';
  newFocusArea = '';
  newHelpfulPhrase = '';
  newTag = '';

  // Language-specific content
  selectedTargetLanguage = '';
  selectedNativeLanguage = '';

  constructor(
    private fb: FormBuilder,
    private learningModulesService: LearningModulesService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.moduleForm = this.createForm();
  }

  ngOnInit(): void {
    this.initializeOptions();
    this.checkEditMode();
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      targetLanguage: ['German', Validators.required],
      nativeLanguage: ['English', Validators.required],
      level: ['', Validators.required],
      category: ['', Validators.required],
      difficulty: ['', Validators.required],
      estimatedDuration: ['', [Validators.required, Validators.min(1)]],
      learningObjectives: this.fb.array([this.createLearningObjective()]),
      prerequisites: [[]],
      content: this.fb.group({
        introduction: [''],
        keyTopics: [[]],
        examples: [[]],
        exercises: [[]]
      }),
      aiTutorConfig: this.fb.group({
        personality: ['friendly and encouraging language tutor'],
        focusAreas: [[]],
        commonMistakes: [[]],
        helpfulPhrases: [[]],
        culturalNotes: [[]]
      }),
      tags: [[]]
    });
  }

  createLearningObjective(): FormGroup {
    return this.fb.group({
      objective: [''],
      description: ['']
    });
  }

  get learningObjectives(): FormArray {
    return this.moduleForm.get('learningObjectives') as FormArray;
  }

  initializeOptions(): void {
    this.levels = this.learningModulesService.getAvailableLevels();
    this.categories = this.learningModulesService.getAvailableCategories();
    this.difficulties = this.learningModulesService.getAvailableDifficulties();
    this.availableLanguages = this.learningModulesService.getAvailableLanguages();
    this.availableNativeLanguages = this.learningModulesService.getAvailableNativeLanguages();
  }

  checkEditMode(): void {
    this.moduleId = this.route.snapshot.paramMap.get('id');
    if (this.moduleId) {
      this.isEditMode = true;
      this.loadModule();
    }
  }

  loadModule(): void {
    if (!this.moduleId) return;

    this.learningModulesService.getModule(this.moduleId).subscribe({
      next: (module) => {
        this.populateForm(module);
      },
      error: (error) => {
        console.error('Error loading module:', error);
        alert('Failed to load module');
        this.goBack();
      }
    });
  }

  populateForm(module: LearningModule): void {
    // Set basic form values
    this.moduleForm.patchValue({
      title: module.title,
      description: module.description,
      targetLanguage: module.targetLanguage || 'German',
      nativeLanguage: module.nativeLanguage || 'English',
      level: module.level,
      category: module.category,
      difficulty: module.difficulty,
      estimatedDuration: module.estimatedDuration,
      prerequisites: module.prerequisites,
      content: {
        introduction: module.content.introduction,
        examples: module.content.examples,
        exercises: module.content.exercises
      },
      aiTutorConfig: {
        personality: module.aiTutorConfig.personality,
        commonMistakes: module.aiTutorConfig.commonMistakes,
        culturalNotes: module.aiTutorConfig.culturalNotes
      }
    });

    // Set learning objectives
    this.learningObjectives.clear();
    module.learningObjectives.forEach(obj => {
      this.learningObjectives.push(this.fb.group({
        objective: [obj.objective],
        description: [obj.description]
      }));
    });

    // Set dynamic arrays
    this.keyTopics = [...(module.content.keyTopics || [])];
    this.focusAreas = [...(module.aiTutorConfig.focusAreas || [])];
    this.helpfulPhrases = [...(module.aiTutorConfig.helpfulPhrases || [])];
    this.tags = [...(module.tags || [])];
    
    // Set selected languages
    this.selectedTargetLanguage = module.targetLanguage || 'German';
    this.selectedNativeLanguage = module.nativeLanguage || 'English';
  }

  addLearningObjective(): void {
    this.learningObjectives.push(this.createLearningObjective());
  }

  removeLearningObjective(index: number): void {
    if (this.learningObjectives.length > 1) {
      this.learningObjectives.removeAt(index);
    }
  }

  addKeyTopic(): void {
    if (this.newKeyTopic.trim()) {
      this.keyTopics.push(this.newKeyTopic.trim());
      this.newKeyTopic = '';
    }
  }

  removeKeyTopic(index: number): void {
    this.keyTopics.splice(index, 1);
  }

  addFocusArea(): void {
    if (this.newFocusArea.trim()) {
      this.focusAreas.push(this.newFocusArea.trim());
      this.newFocusArea = '';
    }
  }

  removeFocusArea(index: number): void {
    this.focusAreas.splice(index, 1);
  }

  addHelpfulPhrase(): void {
    if (this.newHelpfulPhrase.trim()) {
      this.helpfulPhrases.push(this.newHelpfulPhrase.trim());
      this.newHelpfulPhrase = '';
    }
  }

  removeHelpfulPhrase(index: number): void {
    this.helpfulPhrases.splice(index, 1);
  }

  addTag(): void {
    if (this.newTag.trim()) {
      this.tags.push(this.newTag.trim());
      this.newTag = '';
    }
  }

  removeTag(index: number): void {
    this.tags.splice(index, 1);
  }

  onSubmit(): void {
    if (this.moduleForm.invalid) {
      this.moduleForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.moduleForm.value;

    // Prepare the module data
    const moduleData = {
      ...formValue,
      content: {
        ...formValue.content,
        keyTopics: this.keyTopics
      },
      aiTutorConfig: {
        ...formValue.aiTutorConfig,
        focusAreas: this.focusAreas,
        helpfulPhrases: this.helpfulPhrases
      },
      tags: this.tags,
      changeDescription: this.isEditMode 
        ? `Module updated by teacher` 
        : undefined
    };

    const operation = this.isEditMode 
      ? this.learningModulesService.updateModule(this.moduleId!, moduleData)
      : this.learningModulesService.createModule(moduleData);

    operation.subscribe({
      next: (response) => {
        const action = this.isEditMode ? 'updated' : 'created';
        alert(`Module ${action} successfully!`);
        this.goBack();
      },
      error: (error) => {
        console.error('Error saving module:', error);
        const action = this.isEditMode ? 'updating' : 'creating';
        alert(`Failed to ${action} module. Please try again.`);
        this.isSubmitting = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/learning-modules']);
  }

  onTargetLanguageChange(): void {
    const targetLanguage = this.moduleForm.get('targetLanguage')?.value;
    this.selectedTargetLanguage = targetLanguage;
    
    // Update AI tutor personality based on language
    const personalityMap: { [key: string]: string } = {
      'German': 'friendly and encouraging German tutor',
      'English': 'friendly and encouraging English tutor',
      'Spanish': 'friendly and encouraging Spanish tutor',
      'French': 'friendly and encouraging French tutor',
      'Italian': 'friendly and encouraging Italian tutor',
      'Portuguese': 'friendly and encouraging Portuguese tutor',
      'Dutch': 'friendly and encouraging Dutch tutor',
      'Swedish': 'friendly and encouraging Swedish tutor'
    };
    
    if (personalityMap[targetLanguage]) {
      this.moduleForm.patchValue({
        aiTutorConfig: {
          personality: personalityMap[targetLanguage]
        }
      });
    }
  }
}