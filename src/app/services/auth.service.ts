// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';

interface DecodeToken {
  name: string;
  email: string;
  level?: string;
}

interface User {
  _id?: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  batch?: string;
  medium?: string;
  subscription?: string;
  level?: string;
  conversationId?: string;
  assignedCourses?: string[];   // for TEACHER
  assignedTeacher?: string;      // for STUDENT (teacher _id)
  profilePhotoUrl?: string;      // URL to profile photo
  studentStatus?: string;        // for STUDENT (UNCERTAIN, ONGOING, COMPLETED, DROPPED)
  [key: string]: any;            // Allow additional properties
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Change backend API URL to your EC2 URL or keep localhost for development
  private apiUrl = environment.apiUrl;  // Base API URL
  //getUserId: any;

  // ✅ Holds logged-in user state
  private currentUserSubject = new BehaviorSubject<any | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ✅ Get teachers for a specific level and medium
  getTeachers(level: string, medium: string | string[]): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/auth/teachers`, {
      params: { level, medium }, withCredentials: true
    });
  }


  // ✅ Get teachers for a specific level and medium
  getTeachersByMedium(medium: string | string[]): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/auth/teachersByMedium`, {
      params: { medium }, withCredentials: true
    });
  }


  signup(user: { 
    name: string, 
    email: string, 
    role: string, 
    batch?: string, 
    medium?: string, 
    subscription?: string,
    level?: string, 
    conversationId?: string,
    elevenLabsWidgetLink?: string, 
    elevenLabsApiKey?: string 
    assignedCourses?: string[],   // for TEACHER
    assignedTeacher?: string      // for STUDENT (teacher _id)
    studentStatus?: string      // for STUDENT (UNCERTAIN, ONGOING, COMPLETED, DROPPED)
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/signup`, user, { withCredentials: true });
  }

  login(user: { regNo: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, user, { withCredentials: true })
      .pipe(
        tap(() => {
          // ✅ Immediately fetch and update user after login
          this.refreshUserProfile().subscribe();
        })
      );
  }
  
  // Fetch user profile (with photo URL included)
  getUserProfile(): Observable<any> {
    console.log('🔍 AuthService: Fetching user profile...');
    return this.http.get(`${this.apiUrl}/auth/profile`, { withCredentials: true }).pipe(
      tap({
        next: (user: any) => console.log('✅ AuthService: Profile fetched:', (user as any)?.email, (user as any)?.role),
        error: (err) => console.error('❌ AuthService: Profile fetch failed:', err)
      })
    );
  }


  // ✅ Helper: refresh user profile and update BehaviorSubject
  refreshUserProfile(): Observable<any> {
    console.log('🔄 AuthService: Refreshing user profile...');
    return this.getUserProfile().pipe(
      tap({
        next: (user: any) => {
          console.log('✅ AuthService: Profile refreshed, updating state:', (user as any)?.email);
          this.currentUserSubject.next(user);
        },
        error: (err) => {
          console.error('❌ AuthService: Profile refresh failed:', err);
          this.currentUserSubject.next(null);
        }
      })
    );
  }

  isLoggedIn(): boolean {
    const loggedIn = this.currentUserSubject.value !== null;
    console.log('🔍 AuthService: isLoggedIn check:', loggedIn, 'Current user:', this.currentUserSubject.value?.email);
    return loggedIn;
  }

  // Logout
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.currentUserSubject.next(null); // clear state
        })
      );
  }

  // Additional methods for VAPI data - you can adjust these endpoints if needed
  getStudentVapiData() {
    return this.http.get<any>(`${this.apiUrl}/student/vapi-access`);
  }

  getVapiCourses() {
    return this.http.get<any[]>(`${this.apiUrl}/student/vapi-courses`);
  }

  // Upload profile photo with validation
  uploadProfilePhoto(file: File): Observable<any> {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    // ✅ Validate file type before sending to backend
    if (!allowedTypes.includes(file.type)) {
      return new Observable((observer) => {
        observer.error({ message: 'Invalid file type! Only JPG/PNG files are allowed.' });
      });
    }

    const formData = new FormData();
    formData.append('profilePhoto', file);

    return this.http.post(`${this.apiUrl}/profile/upload-photo`, formData, { withCredentials: true });
  }


  getUserById(id: string) {
    return this.http.get<User>(`${this.apiUrl}/auth/${id}`, { withCredentials: true });
  }

  updateUser(id: string, user: User) {
    return this.http.put(`${this.apiUrl}/auth/${id}`, user, { withCredentials: true });
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.apiUrl}/auth/${id}`, { withCredentials: true });
  }

}
