// src/app/services/learning-modules.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LearningModule {
  _id?: string;
  title: string;
  description: string;
  targetLanguage: 'English' | 'German';
  nativeLanguage: 'English' | 'Tamil' | 'Sinhala';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: 'Grammar' | 'Vocabulary' | 'Conversation' | 'Reading' | 'Writing' | 'Listening';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration: number;
  learningObjectives: Array<{
    objective: string;
    description: string;
  }>;
  prerequisites: string[];
  content: {
    introduction: string;
    keyTopics: string[];
    examples: Array<{
      german: string;
      english: string;
      explanation: string;
    }>;
    exercises: Array<{
      type: 'multiple-choice' | 'fill-blank' | 'translation' | 'conversation' | 'essay' | 'role-play';
      question: string;
      options?: string[];
      correctAnswer: string;
      explanation: string;
      points: number;
    }>;
  };
  aiTutorConfig: {
    personality: string;
    focusAreas: string[];
    commonMistakes: string[];
    helpfulPhrases: string[];
    culturalNotes: string[];
  };
  createdBy: any;
  isActive: boolean;
  tags: string[];
  totalEnrollments: number;
  averageCompletionTime: number;
  averageScore: number;
  createdAt: Date;
  updatedAt: Date;
  studentProgress?: any;
}

export interface ModuleFilters {
  level?: string;
  category?: string;
  difficulty?: string;
  targetLanguage?: string;
  nativeLanguage?: string;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LearningModulesService {
  private apiUrl = `${environment.apiUrl}/learning-modules`;

  constructor(private http: HttpClient) {}

  // Get all modules with filtering
  getModules(filters: ModuleFilters = {}): Observable<any> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof ModuleFilters];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<any>(`${this.apiUrl}`, { 
      params, 
      withCredentials: true 
    });
  }

  // Get specific module
  getModule(id: string): Observable<LearningModule> {
    return this.http.get<LearningModule>(`${this.apiUrl}/${id}`, { 
      withCredentials: true 
    });
  }

  // Create new module (Teachers/Admins only)
  createModule(module: Partial<LearningModule>): Observable<LearningModule> {
    return this.http.post<LearningModule>(`${this.apiUrl}`, module, { 
      withCredentials: true 
    });
  }

  // Update module (Teachers/Admins only)
  updateModule(id: string, module: Partial<LearningModule>): Observable<LearningModule> {
    return this.http.put<LearningModule>(`${this.apiUrl}/${id}`, module, { 
      withCredentials: true 
    });
  }

  // Delete module (Admins only)
  deleteModule(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { 
      withCredentials: true 
    });
  }

  // Enroll student in module
  enrollInModule(moduleId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${moduleId}/enroll`, {}, { 
      withCredentials: true 
    });
  }

  // Get module statistics (Teachers/Admins)
  getModuleStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/overview`, { 
      withCredentials: true 
    });
  }

  // Get all modules with management details (Admin only)
  getModulesForAdmin(filters: { page?: number; limit?: number; status?: string } = {}): Observable<any> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof typeof filters];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<any>(`${this.apiUrl}/admin/management`, { 
      params, 
      withCredentials: true 
    });
  }

  // Get module update history (Admin only)
  getModuleHistory(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/history`, { 
      withCredentials: true 
    });
  }

  // Get available levels
  getAvailableLevels(): string[] {
    return ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  }

  // Get available categories
  getAvailableCategories(): string[] {
    return ['Grammar', 'Vocabulary', 'Conversation', 'Reading', 'Writing', 'Listening'];
  }

  // Get available difficulties
  getAvailableDifficulties(): string[] {
    return ['Beginner', 'Intermediate', 'Advanced'];
  }

  // Get exercise types
  getExerciseTypes(): string[] {
    return ['multiple-choice', 'fill-blank', 'translation', 'conversation', 'essay', 'role-play'];
  }

  // Get available languages
  getAvailableLanguages(): string[] {
    return ['English', 'German'];
  }

  // Get available native languages
  getAvailableNativeLanguages(): string[] {
    return ['English', 'Tamil', 'Sinhala'];
  }

  // Mark module as completed
  markModuleCompleted(moduleId: string, sessionData?: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${moduleId}/complete`, sessionData || {}, { 
      withCredentials: true 
    });
  }

  // Update module progress
  updateModuleProgress(moduleId: string, progressData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${moduleId}/progress`, progressData, { 
      withCredentials: true 
    });
  }
}