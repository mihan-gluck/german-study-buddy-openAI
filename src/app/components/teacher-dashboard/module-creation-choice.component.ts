// src/app/components/teacher-dashboard/module-creation-choice.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-module-creation-choice',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8 col-xl-6">
          <div class="text-center mb-5">
            <h2 class="display-6 fw-bold text-primary">Create Learning Module</h2>
            <p class="lead text-muted">Choose how you'd like to create your new learning module</p>
          </div>
          
          <div class="row g-4">
            <!-- Manual Creation Option -->
            <div class="col-md-6">
              <div class="creation-option-card h-100" (click)="createManually()">
                <div class="card-icon">
                  <i class="fas fa-tools"></i>
                </div>
                <h4>Create from Scratch</h4>
                <p class="text-muted">Build your module manually with complete control over every detail</p>
                
                <div class="features-list">
                  <div class="feature-item">
                    <i class="fas fa-check-circle text-success"></i>
                    <span>Full customization control</span>
                  </div>
                  <div class="feature-item">
                    <i class="fas fa-check-circle text-success"></i>
                    <span>Add custom exercises</span>
                  </div>
                  <div class="feature-item">
                    <i class="fas fa-check-circle text-success"></i>
                    <span>Define specific vocabulary</span>
                  </div>
                  <div class="feature-item">
                    <i class="fas fa-check-circle text-success"></i>
                    <span>Create role-play scenarios</span>
                  </div>
                </div>
                
                <div class="card-footer">
                  <button class="btn btn-outline-primary btn-lg w-100">
                    <i class="fas fa-hammer me-2"></i>
                    Create Manually
                  </button>
                </div>
              </div>
            </div>
            
            <!-- AI-Assisted Creation Option -->
            <div class="col-md-6">
              <div class="creation-option-card h-100 ai-option" (click)="createWithAI()">
                <div class="card-icon ai-icon">
                  <i class="fas fa-robot"></i>
                </div>
                <h4>Create with AI Assistant</h4>
                <p class="text-muted">Let AI generate a complete module based on your requirements</p>
                
                <div class="features-list">
                  <div class="feature-item">
                    <i class="fas fa-magic text-warning"></i>
                    <span>AI-generated content</span>
                  </div>
                  <div class="feature-item">
                    <i class="fas fa-magic text-warning"></i>
                    <span>Smart vocabulary selection</span>
                  </div>
                  <div class="feature-item">
                    <i class="fas fa-magic text-warning"></i>
                    <span>Auto-generated exercises</span>
                  </div>
                  <div class="feature-item">
                    <i class="fas fa-magic text-warning"></i>
                    <span>Editable after creation</span>
                  </div>
                </div>
                
                <div class="card-footer">
                  <button class="btn btn-warning btn-lg w-100">
                    <i class="fas fa-robot me-2"></i>
                    Create with AI
                  </button>
                </div>
                
                <div class="ai-badge">
                  <span class="badge bg-gradient-warning">
                    <i class="fas fa-sparkles me-1"></i>
                    AI Powered
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Back Button -->
          <div class="text-center mt-4">
            <button class="btn btn-secondary" (click)="goBack()">
              <i class="fas fa-arrow-left me-2"></i>
              Back to Modules
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .creation-option-card {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid #e9ecef;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      position: relative;
      overflow: hidden;
    }
    
    .creation-option-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
      border-color: #007bff;
    }
    
    .ai-option:hover {
      border-color: #ffc107;
    }
    
    .card-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      background: linear-gradient(135deg, #007bff, #0056b3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 2rem;
    }
    
    .ai-icon {
      background: linear-gradient(135deg, #ffc107, #e0a800);
    }
    
    .creation-option-card h4 {
      color: #2c3e50;
      margin-bottom: 1rem;
      font-weight: 600;
    }
    
    .features-list {
      text-align: left;
      margin: 2rem 0;
    }
    
    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      font-size: 0.9rem;
    }
    
    .feature-item i {
      font-size: 1rem;
      width: 16px;
    }
    
    .card-footer {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e9ecef;
    }
    
    .ai-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
    }
    
    .bg-gradient-warning {
      background: linear-gradient(135deg, #ffc107, #e0a800);
    }
    
    .btn-lg {
      padding: 0.75rem 1.5rem;
      font-weight: 600;
    }
    
    .display-6 {
      font-size: 2.5rem;
    }
    
    @media (max-width: 768px) {
      .creation-option-card {
        padding: 1.5rem;
      }
      
      .card-icon {
        width: 60px;
        height: 60px;
        font-size: 1.5rem;
      }
      
      .display-6 {
        font-size: 2rem;
      }
    }
  `]
})
export class ModuleCreationChoiceComponent {
  
  constructor(private router: Router) {}
  
  createManually(): void {
    this.router.navigate(['/create-module']);
  }
  
  createWithAI(): void {
    this.router.navigate(['/create-module-ai']);
  }
  
  goBack(): void {
    this.router.navigate(['/learning-modules']);
  }
}