// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

interface DecodeToken {
  name: string;
  email: string;
  level?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Change backend API URL to your EC2 URL or keep localhost for development
  private apiUrl = 'http://localhost:4000/api';  // Base API URL
  //getUserId: any;
  

  constructor(private http: HttpClient) {}

  getUser(): DecodeToken | null {
    const token = localStorage.getItem('authToken'); // FIXED
    if (!token) return null;

    try {
      return jwtDecode(token) as DecodeToken;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }


  getUserId(): string {
    const token = localStorage.getItem('authToken'); // FIXED
    if (!token) return '';

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || '';
    } catch (error) {
      console.error('Invalid token format', error);
      return '';
    }
  }

  // ✅ Get teachers for a specific level and medium
  getTeachers(level: string, medium: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/auth/teachers`, {
      params: { level, medium }
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
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/signup`, user);
  }

  login(user: { regNo: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, user);
  }

  saveToken(token: string) {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
  

  // Fetch user profile (with photo URL included)
  getUserProfile(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    // Corrected route to match backend profile route
    return this.http.get(`${this.apiUrl}/profile`, { headers });
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() > expiry;
    } catch {
      return true;
    }
  }

  logOut() {
    localStorage.removeItem('authToken');
  }

  // Additional methods for VAPI data - you can adjust these endpoints if needed
  getStudentVapiData() {
    return this.http.get<any>(`${this.apiUrl}/student/vapi-access`);
  }

  getVapiCourses() {
    return this.http.get<any[]>(`${this.apiUrl}/student/vapi-courses`);
  }

  // Upload profile photo
  uploadProfilePhoto(file: File): Observable<any> {
  const token = this.getToken();
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  const formData = new FormData();
  formData.append('profilePhoto', file);

  // Backend endpoint for photo upload — adjust if needed
  return this.http.post(`${this.apiUrl}/profile/upload-photo`, formData, { headers });
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