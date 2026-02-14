// src/app/components/teacher-assignments/teacher-assignments-page.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeacherAssignmentsComponent } from './teacher-assignments.component';
import { TeacherAssignmentTemplatesComponent } from '../teacher-assignment-templates/teacher-assignment-templates.component';

@Component({
  selector: 'app-teacher-assignments-page',
  standalone: true,
  imports: [CommonModule, TeacherAssignmentsComponent, TeacherAssignmentTemplatesComponent],
  template: `
    <div class="assignments-page-container">
      <div class="page-header">
        <h1><i class="fas fa-file-alt"></i> Exams & Assignments</h1>
        <p class="subtitle">Manage student assignments and create exam papers</p>
      </div>

      <section class="assignments-section">
        <app-teacher-assignments></app-teacher-assignments>
      </section>

      <section class="templates-section">
        <app-teacher-assignment-templates></app-teacher-assignment-templates>
      </section>
    </div>
  `,
  styles: [`
    .assignments-page-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e0e0e0;
    }

    .page-header h1 {
      color: #2c3e50;
      font-size: 2rem;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .page-header h1 i {
      color: #3498db;
    }

    .subtitle {
      color: #7f8c8d;
      font-size: 1.1rem;
      margin: 0;
    }

    .assignments-section,
    .templates-section {
      margin-bottom: 40px;
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    @media (max-width: 768px) {
      .assignments-page-container {
        padding: 15px;
      }

      .page-header h1 {
        font-size: 1.5rem;
      }

      .subtitle {
        font-size: 1rem;
      }
    }
  `]
})
export class TeacherAssignmentsPageComponent {}
