// src/app/services/course-material.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define the CourseMaterial interface
export interface CourseMaterial {
  _id?: string;
  course: string; // refers to Course _id
  materials: {
    _id?: string;
    fileName: string;
    fileUrl: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CourseMaterialService {
  private apiUrl = 'http://localhost:4000/api/courseMaterial';

  constructor(private http: HttpClient) {}

  // ✅ Add new course materials
  addCourseMaterial(courseMaterial: CourseMaterial): Observable<CourseMaterial> {
    return this.http.post<CourseMaterial>(this.apiUrl, courseMaterial, { withCredentials: true });
  }

  // ✅ Fetch all course materials
  getAllMaterials(): Observable<CourseMaterial[]> {
    return this.http.get<CourseMaterial[]>(this.apiUrl, { withCredentials: true });
  }

  // ✅ Get materials for a specific course
  getMaterialsByCourse(courseId: string): Observable<CourseMaterial[]> {
    return this.http.get<CourseMaterial[]>(`${this.apiUrl}?course=${courseId}`);
  }

  // ✅ Delete a course material entry
  deleteMaterialFile(materialId: string, fileId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${materialId}/file`, { 
      params: { fileId },
      withCredentials: true 
    });
  }

}
