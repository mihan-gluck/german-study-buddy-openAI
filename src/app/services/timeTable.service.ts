// src/app/services/timeTable.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

// Define time range type
interface TimeRange {
  start: string;  // e.g. "09:00"
  end: string;    // e.g. "11:00"
}

export interface TimeTable {
  _id?: string;
  batch: string;
  medium: string;
  plan: string;
  weekStartDate: Date;
  weekEndDate: Date;
  assignedTeacher: string;
  monday?: TimeRange[];
  tuesday?: TimeRange[];
  wednesday?: TimeRange[];
  thursday?: TimeRange[];
  friday?: TimeRange[];
  saturday?: TimeRange[];
  sunday?: TimeRange[];
}

@Injectable({
  providedIn: 'root'
})
export class TimeTableService {
  private apiUrl = 'http://localhost:4000/api/timeTable'; // Base path

  constructor(private http: HttpClient) {}

  // Add a new timetable
  addTimeTable(timeTable: TimeTable): Observable<TimeTable> {
    return this.http.post<TimeTable>(this.apiUrl, timeTable, { withCredentials: true });
  }

  // Fetch all timetables for admin
  getTimeTables(): Observable<TimeTable[]> {
    return this.http.get<TimeTable[]>(this.apiUrl, { withCredentials: true });
  }

  // Fetch timetable for student
  getTimeTablesbyBatchMediumPlan(batch: string, medium: string, plan: string): Observable<TimeTable[]> {
    const params = { batch, medium, plan };
    return this.http.get<TimeTable[]>(`${this.apiUrl}/forStudent`, { params, withCredentials: true });
  }

  getTimeTableById(id: string) {
    return this.http.get<TimeTable>(`${this.apiUrl}/${id}`);
  }

  updateTimeTable(id: string, timeTable: TimeTable) {
    return this.http.put(`${this.apiUrl}/${id}`, timeTable);
  }

  // Fetch timetables for a specific teacher
  getTimeTablesByTeacher(teacherId: string): Observable<TimeTable[]> {
    const params = { teacherId };
    return this.http.get<TimeTable[]>(`${this.apiUrl}/forTeacher`, { params, withCredentials: true });
  }

}


