// src/app/components/teacher-dashboard/ai-module-creator.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LearningModulesService } from '../../services/learning-modules.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-ai-module-creator',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row justify-content-center">
        <div class="col-lg-8 col-xl-6">
          <div class="card ai-creator-card">
            <div class="card-header text-center">
              <div class="ai-header-icon">
                <i class="fas fa-robot"></i>
              </div>
              <h3 class="mb-0">🤖 AI Module Creator</h3>
              <p class="text-muted mb-0">Let AI generate a complete learning module for you</p>
            </div>
            
            <div class="card-body">
              <form [formGroup]="aiForm" (ngSubmit)="generateModule()" *ngIf="!isGenerating && !generatedModule">
                <!-- Basic Requirements -->
                <div class="mb-4">
                  <h5 class="section-title">
                    <i class="fas fa-info-circle text-primary"></i>
                    Basic Information
                  </h5>
                  
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label">Target Language *</label>
                      <select class="form-select" formControlName="targetLanguage">
                        <option value="">Select Language</option>
                        <option *ngFor="let language of availableLanguages" [value]="language">{{language}}</option>
                      </select>
                    </div>
                    
                    <div class="col-md-6">
                      <label class="form-label">Native Language *</label>
                      <select class="form-select" formControlName="nativeLanguage">
                        <option value="">Select Language</option>
                        <option *ngFor="let language of availableNativeLanguages" [value]="language">{{language}}</option>
                      </select>
                    </div>
                    
                    <div class="col-md-4">
                      <label class="form-label">Level *</label>
                      <select class="form-select" formControlName="level">
                        <option value="">Select Level</option>
                        <option *ngFor="let level of levels" [value]="level">{{level}}</option>
                      </select>
                    </div>
                    
                    <div class="col-md-4">
                      <label class="form-label">Category *</label>
                      <select class="form-select" formControlName="category">
                        <option value="">Select Category</option>
                        <option *ngFor="let category of categories" [value]="category">{{category}}</option>
                      </select>
                    </div>
                    
                    <div class="col-md-4">
                      <label class="form-label">Difficulty *</label>
                      <select class="form-select" formControlName="difficulty">
                        <option value="">Select Difficulty</option>
                        <option *ngFor="let difficulty of difficulties" [value]="difficulty">{{difficulty}}</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <!-- Module Description -->
                <div class="mb-4">
                  <h5 class="section-title">
                    <i class="fas fa-lightbulb text-warning"></i>
                    Module Description
                  </h5>
                  
                  <div class="mb-3">
                    <label class="form-label">What should this module teach? *</label>
                    <textarea 
                      class="form-control" 
                      rows="4" 
                      formControlName="description" 
                      placeholder="Describe what you want students to learn. For example: 'A module about ordering food in a restaurant, including greetings, menu vocabulary, asking questions about dishes, and paying the bill.'"></textarea>
                    <small class="form-text text-muted">
                      Be specific about the learning objectives, vocabulary, and situations you want to cover.
                    </small>
                  </div>
                  
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label">Duration (minutes)</label>
                      <input 
                        type="number" 
                        class="form-control" 
                        formControlName="estimatedDuration" 
                        placeholder="e.g., 30"
                        min="10" 
                        max="120">
                    </div>
                    
                    <div class="col-md-6">
                      <label class="form-label">Module Type</label>
                      <select class="form-select" formControlName="moduleType">
                        <option value="standard">Standard Module</option>
                        <option value="roleplay">Role-Play Module</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <!-- AI Generation Options -->
                <div class="mb-4">
                  <h5 class="section-title">
                    <i class="fas fa-cogs text-info"></i>
                    AI Generation Options
                  </h5>
                  
                  <div class="ai-options">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" formControlName="generateVocabulary" id="generateVocabulary">
                      <label class="form-check-label" for="generateVocabulary">
                        Generate vocabulary list with translations
                      </label>
                    </div>
                    
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" formControlName="generateExercises" id="generateExercises">
                      <label class="form-check-label" for="generateExercises">
                        Create practice exercises
                      </label>
                    </div>
                    
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" formControlName="generateConversation" id="generateConversation">
                      <label class="form-check-label" for="generateConversation">
                        Generate conversation examples
                      </label>
                    </div>
                    
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" formControlName="generateCulturalNotes" id="generateCulturalNotes">
                      <label class="form-check-label" for="generateCulturalNotes">
                        Include cultural notes and context
                      </label>
                    </div>
                  </div>
                </div>
                
                <!-- Generate Button -->
                <div class="text-center">
                  <button 
                    type="submit" 
                    class="btn btn-warning btn-lg px-5"
                    [disabled]="aiForm.invalid">
                    <i class="fas fa-magic me-2"></i>
                    Generate Module with AI
                  </button>
                </div>
              </form>
              
              <!-- Generation Progress -->
              <div *ngIf="isGenerating" class="text-center py-5">
                <div class="ai-generating">
                  <div class="spinner-border text-warning mb-3" style="width: 3rem; height: 3rem;"></div>
                  <h4>🤖 AI is creating your module...</h4>
                  <p class="text-muted">{{generationStatus}}</p>
                  <div class="progress mt-3" style="height: 8px;">
                    <div class="progress-bar bg-warning progress-bar-striped progress-bar-animated" 
                         [style.width.%]="generationProgress"></div>
                  </div>
                </div>
              </div>
              
              <!-- Generated Module Preview -->
              <div *ngIf="generatedModule && !isGenerating" class="generated-module">
                <div class="alert alert-success">
                  <i class="fas fa-check-circle me-2"></i>
                  <strong>Module generated successfully!</strong> Review and edit as needed.
                </div>
                
                <div class="module-preview">
                  <h5>📋 Generated Module: {{generatedModule.title}}</h5>
                  <p class="text-muted">{{generatedModule.description}}</p>
                  
                  <div class="row g-3 mb-3">
                    <div class="col-md-3">
                      <small class="text-muted">Level:</small><br>
                      <span class="badge bg-primary">{{generatedModule.level}}</span>
                    </div>
                    <div class="col-md-3">
                      <small class="text-muted">Category:</small><br>
                      <span class="badge bg-info">{{generatedModule.category}}</span>
                    </div>
                    <div class="col-md-3">
                      <small class="text-muted">Duration:</small><br>
                      <span class="badge bg-secondary">{{generatedModule.estimatedDuration}} min</span>
                    </div>
                    <div class="col-md-3">
                      <small class="text-muted">Vocabulary:</small><br>
                      <span class="badge bg-success">{{getVocabularyCount()}} words</span>
                    </div>
                  </div>
                  
                  <div class="action-buttons">
                    <button class="btn btn-success me-2" (click)="saveModule()">
                      <i class="fas fa-save me-2"></i>
                      Save Module
                    </button>
                    <button class="btn btn-outline-primary me-2" (click)="editModule()">
                      <i class="fas fa-edit me-2"></i>
                      Edit & Customize
                    </button>
                    <button class="btn btn-outline-secondary" (click)="startOver()">
                      <i class="fas fa-redo me-2"></i>
                      Start Over
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card-footer text-center">
              <button class="btn btn-secondary" (click)="goBack()" *ngIf="!isGenerating">
                <i class="fas fa-arrow-left me-2"></i>
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ai-creator-card {
      border: none;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      border-radius: 1rem;
      overflow: hidden;
    }
    
    .card-header {
      background: linear-gradient(135deg, #ffc107, #e0a800);
      color: white;
      padding: 2rem;
      border-bottom: none;
    }
    
    .ai-header-icon {
      width: 60px;
      height: 60px;
      margin: 0 auto 1rem;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #f8f9fa;
    }
    
    .ai-options {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 0.5rem;
      border-left: 4px solid #ffc107;
    }
    
    .form-check {
      margin-bottom: 0.75rem;
    }
    
    .form-check-label {
      font-weight: 500;
    }
    
    .ai-generating {
      padding: 2rem;
    }
    
    .generated-module {
      border: 2px solid #28a745;
      border-radius: 0.75rem;
      padding: 1.5rem;
      background: #f8fff9;
    }
    
    .module-preview {
      margin-top: 1rem;
    }
    
    .action-buttons {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #dee2e6;
    }
    
    .progress {
      max-width: 300px;
      margin: 0 auto;
    }
    
    @media (max-width: 768px) {
      .card-header {
        padding: 1.5rem;
      }
      
      .ai-header-icon {
        width: 50px;
        height: 50px;
        font-size: 1.25rem;
      }
      
      .action-buttons .btn {
        width: 100%;
        margin-bottom: 0.5rem;
      }
    }
  `]
})
export class AiModuleCreatorComponent implements OnInit {
  aiForm: FormGroup;
  isGenerating = false;
  generatedModule: any = null;
  generationStatus = 'Initializing AI...';
  generationProgress = 0;
  
  // Form options
  levels: string[] = [];
  categories: string[] = [];
  difficulties: string[] = [];
  availableLanguages: string[] = [];
  availableNativeLanguages: string[] = [];
  
  constructor(
    private fb: FormBuilder,
    private learningModulesService: LearningModulesService,
    private router: Router,
    private http: HttpClient
  ) {
    this.aiForm = this.createForm();
  }
  
  ngOnInit(): void {
    this.initializeOptions();
  }
  
  createForm(): FormGroup {
    return this.fb.group({
      targetLanguage: ['English', Validators.required],
      nativeLanguage: ['English', Validators.required],
      level: ['', Validators.required],
      category: ['', Validators.required],
      difficulty: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20)]],
      estimatedDuration: [30, [Validators.min(10), Validators.max(120)]],
      moduleType: ['standard'],
      generateVocabulary: [true],
      generateExercises: [true],
      generateConversation: [true],
      generateCulturalNotes: [false]
    });
  }
  
  initializeOptions(): void {
    this.levels = this.learningModulesService.getAvailableLevels();
    this.categories = this.learningModulesService.getAvailableCategories();
    this.difficulties = this.learningModulesService.getAvailableDifficulties();
    this.availableLanguages = this.learningModulesService.getAvailableLanguages();
    this.availableNativeLanguages = this.learningModulesService.getAvailableNativeLanguages();
  }
  
  async generateModule(): Promise<void> {
    if (this.aiForm.invalid) {
      this.aiForm.markAllAsTouched();
      return;
    }
    
    this.isGenerating = true;
    this.generationProgress = 0;
    
    try {
      // Simulate AI generation process with progress updates
      await this.simulateAIGeneration();
      
      // Call the actual AI generation API
      const formData = this.aiForm.value;
      const response = await this.callAIGenerationAPI(formData);
      
      this.generatedModule = response;
      this.isGenerating = false;
      
    } catch (error) {
      console.error('Error generating module:', error);
      alert('Failed to generate module. Please try again.');
      this.isGenerating = false;
    }
  }
  
  private async simulateAIGeneration(): Promise<void> {
    const steps = [
      { message: 'Analyzing requirements...', progress: 20 },
      { message: 'Generating vocabulary...', progress: 40 },
      { message: 'Creating exercises...', progress: 60 },
      { message: 'Building conversation examples...', progress: 80 },
      { message: 'Finalizing module structure...', progress: 100 }
    ];
    
    for (const step of steps) {
      this.generationStatus = step.message;
      this.generationProgress = step.progress;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  private async callAIGenerationAPI(formData: any): Promise<any> {
    // This will call our backend AI generation endpoint
    const response = await firstValueFrom(
      this.http.post(`${environment.apiUrl}/ai/generate-module`, formData, {
        withCredentials: true
      })
    );
    
    return response;
  }
  
  getVocabularyCount(): number {
    return this.generatedModule?.content?.allowedVocabulary?.length || 0;
  }
  
  saveModule(): void {
    if (!this.generatedModule) return;
    
    this.learningModulesService.createModule(this.generatedModule).subscribe({
      next: (response) => {
        alert('Module saved successfully!');
        this.router.navigate(['/learning-modules']);
      },
      error: (error) => {
        console.error('Error saving module:', error);
        alert('Failed to save module. Please try again.');
      }
    });
  }
  
  editModule(): void {
    if (!this.generatedModule) return;
    
    // Store the generated module in session storage for editing
    sessionStorage.setItem('generatedModule', JSON.stringify(this.generatedModule));
    this.router.navigate(['/create-module'], { 
      queryParams: { source: 'ai-generated' } 
    });
  }
  
  startOver(): void {
    this.generatedModule = null;
    this.isGenerating = false;
    this.generationProgress = 0;
    this.aiForm.reset({
      targetLanguage: 'English',
      nativeLanguage: 'English',
      estimatedDuration: 30,
      moduleType: 'standard',
      generateVocabulary: true,
      generateExercises: true,
      generateConversation: true,
      generateCulturalNotes: false
    });
  }
  
  goBack(): void {
    this.router.navigate(['/module-creation-choice']);
  }
}