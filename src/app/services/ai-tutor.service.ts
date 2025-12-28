// src/app/services/ai-tutor.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface TutorMessage {
  role: 'student' | 'tutor';
  content: string;
  timestamp: Date;
  messageType: 'text' | 'exercise' | 'feedback' | 'hint' | 'correction' | 'encouragement';
  metadata?: {
    exerciseId?: string;
    correctAnswer?: string;
    studentAnswer?: string;
    isCorrect?: boolean;
    points?: number;
    difficulty?: string;
    question?: string;
    options?: string[];
    exerciseType?: string;
    inputMethod?: 'speech' | 'text';
  };
}

export interface TutorSession {
  sessionId: string;
  studentId: string;
  moduleId: string;
  sessionType: 'practice' | 'assessment' | 'help' | 'conversation' | 'review';
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  messages: TutorMessage[];
  analytics: {
    totalMessages: number;
    correctAnswers: number;
    incorrectAnswers: number;
    hintsUsed: number;
    sessionScore: number;
    engagementLevel: 'low' | 'medium' | 'high';
  };
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
}

export interface SessionSummary {
  duration: number;
  totalMessages: number;
  correctAnswers: number;
  incorrectAnswers: number;
  sessionScore: number;
  engagementLevel: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiTutorService {
  private apiUrl = `${environment.apiUrl}/ai-tutor`;
  
  // Current active session
  private currentSessionSubject = new BehaviorSubject<TutorSession | null>(null);
  public currentSession$ = this.currentSessionSubject.asObservable();
  
  // Messages for current session
  private messagesSubject = new BehaviorSubject<TutorMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Start new tutoring session
  startSession(moduleId: string, sessionType: string = 'practice', isTeacherTest: boolean = false): Observable<any> {
    const endpoint = isTeacherTest ? '/start-teacher-test' : '/start-session';
    const fullUrl = `${this.apiUrl}${endpoint}`;
    
    console.log('🔗 AI Tutor Service - Starting session:', {
      moduleId,
      sessionType,
      isTeacherTest,
      endpoint,
      fullUrl,
      apiUrl: this.apiUrl,
      environment: environment
    });
    
    const requestBody = {
      moduleId,
      sessionType
    };
    
    console.log('📤 Request body:', requestBody);
    console.log('🌐 Making HTTP request to:', fullUrl);
    
    return this.http.post(fullUrl, requestBody, { withCredentials: true }).pipe(
      tap(response => {
        console.log('✅ Session start response:', response);
      }),
      catchError(error => {
        console.error('❌ Session start error:', error);
        console.error('❌ Error details:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message,
          error: error.error
        });
        throw error;
      })
    );
  }

  // Send message to AI tutor
  sendMessage(sessionId: string, message: string, messageType: string = 'text', exerciseAnswer?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-message`, {
      sessionId,
      message,
      messageType,
      exerciseAnswer
    }, { withCredentials: true });
  }

  // End current session
  endSession(sessionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/end-session`, {
      sessionId
    }, { withCredentials: true });
  }

  // Save session record to database for teacher review
  saveSessionRecord(sessionData: {
    sessionId: string;
    moduleId: string;
    sessionType: string;
    messages: TutorMessage[];
    summary: any;
    sessionState: string;
    isModuleCompleted?: boolean;
  }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/session-records`, sessionData, {
      withCredentials: true
    }).pipe(
      tap(response => {
        console.log('✅ Session record saved successfully:', response);
      }),
      catchError(error => {
        console.error('❌ Error saving session record:', error);
        throw error;
      })
    );
  }

  // Get student's tutoring sessions
  getSessions(moduleId?: string, page: number = 1, limit: number = 10): Observable<any> {
    const params: any = { page, limit };
    if (moduleId) params.moduleId = moduleId;

    return this.http.get(`${this.apiUrl}/sessions`, {
      params,
      withCredentials: true
    });
  }

  // Get specific session details
  getSession(sessionId: string): Observable<TutorSession> {
    return this.http.get<TutorSession>(`${this.apiUrl}/sessions/${sessionId}`, {
      withCredentials: true
    });
  }

  // Update current session state
  setCurrentSession(session: TutorSession | null): void {
    this.currentSessionSubject.next(session);
    if (session) {
      this.messagesSubject.next(session.messages || []);
    } else {
      this.messagesSubject.next([]);
    }
  }

  // Add message to current session
  addMessageToCurrentSession(message: TutorMessage): void {
    const currentMessages = this.messagesSubject.value;
    const updatedMessages = [...currentMessages, message];
    this.messagesSubject.next(updatedMessages);
    
    // Update current session if exists
    const currentSession = this.currentSessionSubject.value;
    if (currentSession) {
      currentSession.messages = updatedMessages;
      this.currentSessionSubject.next(currentSession);
    }
  }

  // Get current session
  getCurrentSession(): TutorSession | null {
    return this.currentSessionSubject.value;
  }

  // Get current messages
  getCurrentMessages(): TutorMessage[] {
    return this.messagesSubject.value;
  }

  // Clear current session
  clearCurrentSession(): void {
    this.currentSessionSubject.next(null);
    this.messagesSubject.next([]);
  }

  // Helper methods for message formatting
  formatMessage(content: string, role: 'student' | 'tutor', messageType: string = 'text'): TutorMessage {
    return {
      role,
      content,
      messageType: messageType as any,
      timestamp: new Date()
    };
  }

  // Check if there's an active session
  hasActiveSession(): boolean {
    const session = this.currentSessionSubject.value;
    return session !== null && session.status === 'active';
  }

  // Get session types
  getSessionTypes(): Array<{value: string, label: string, description: string}> {
    return [
      {
        value: 'practice',
        label: 'Practice Session',
        description: 'Interactive practice with exercises and feedback'
      },
      {
        value: 'conversation',
        label: 'Conversation Practice',
        description: 'Free-form German conversation practice'
      },
      {
        value: 'assessment',
        label: 'Assessment',
        description: 'Test your knowledge with structured exercises'
      },
      {
        value: 'help',
        label: 'Get Help',
        description: 'Ask questions and get explanations'
      },
      {
        value: 'review',
        label: 'Review Session',
        description: 'Review previous topics and reinforce learning'
      }
    ];
  }

  // Format duration for display
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  }

  // Calculate session score percentage
  calculateScorePercentage(correctAnswers: number, totalAnswers: number): number {
    if (totalAnswers === 0) return 0;
    return Math.round((correctAnswers / totalAnswers) * 100);
  }

  // Get engagement level color
  getEngagementColor(level: string): string {
    switch (level) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'danger';
      default: return 'secondary';
    }
  }
}