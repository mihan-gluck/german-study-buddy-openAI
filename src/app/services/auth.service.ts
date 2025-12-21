// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment.prod';

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

  // getUser(): DecodeToken | null {
  //   const token = localStorage.getItem('authToken'); // FIXED
  //   if (!token) return null;

  //   try {
  //     return jwtDecode(token) as DecodeToken;
  //   } catch (error) {
  //     console.error('Error decoding token:', error);
  //     return null;
  //   }
  // }


  // getUserId(): string {
  //   const token = localStorage.getItem('authToken'); // FIXED
  //   if (!token) return '';

  //   try {
  //     const payload = JSON.parse(atob(token.split('.')[1]));
  //     return payload.id || '';
  //   } catch (error) {
  //     console.error('Invalid token format', error);
  //     return '';
  //   }
  // }

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

  // saveToken(token: string) {
  //   localStorage.setItem('authToken', token);
  // }

  // getToken(): string | null {
  //   return localStorage.getItem('authToken');
  // }
  

  // Fetch user profile (with photo URL included)
  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/profile`, { withCredentials: true });
  }


  // ✅ Helper: refresh user profile and update BehaviorSubject
  refreshUserProfile(): Observable<any> {
    return this.getUserProfile().pipe(
      tap({
        next: (user) => this.currentUserSubject.next(user),
        error: () => this.currentUserSubject.next(null)
      })
    );
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
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





/* export class AuthService {
  private apiUrl = 'http://localhost:4000/api/auth'; // Backend API URL
  router: any;
  getUserProfile: any;

  constructor(private http: HttpClient) {}

  signup(user: { name: string, email: string, password: string, role: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, user);
  }

  login(user: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, user);
  }

  saveToken(token: string) {
    localStorage.setItem('authToken', token); // Store token in local storage
  }

  getToken(): string | null {
    return localStorage.getItem('authToken'); // Retrieve token from local storage
  }

  // Return the user's role from the JWT token
  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT
    return payload.role; // Assuming role is stored in JWT payload
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000; // Convert to milliseconds
    return Date.now() > expiry;
  }

  // Method to perform authenticated request
  fetchProtectedData(endpoint: string): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(endpoint, { headers }); // Make GET request with the token in the header
  }

  // Log out the user: Clears the token and redirects to login page
  logOut() {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']); // Redirect to login page after logout
  }
}
 */