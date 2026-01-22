// services/student-log.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StudentLog {

    _id?: string;
    action: string;
    studentId: {
        _id: string;
        name: string;
        email: string;
        regNo: string;
    };

    levelAtUpdate?: string;
    batchAtUpdate?: string;
    mediumAtUpdate?: string[];
    statusAtUpdate?: string;
    subscriptionAtUpdate?: string;
    updatedAt?: Date;

    assignedTeacherAtUpdate?: {
        _id: string;
        name: string;
        regNo: string;
    };
}

@Injectable({
    providedIn: 'root'
})

export class StudentLogService {

  private apiUrl = environment.apiUrl;  // Base API URL

    constructor(private http: HttpClient) {}

    // Fetch all student logs
    getAllStudentLogs(): Observable<{ success: boolean; data: StudentLog[] }> {
        return this.http.get<{ success: boolean; data: StudentLog[] }>(`${this.apiUrl}/studentLog/`);
    }

    // Fetch logs for a specific student
    getLogsByStudentId(studentId: string): Observable<{ success: boolean; data: StudentLog[] }> {
        return this.http.get<{ success: boolean; data: StudentLog[] }>(`${this.apiUrl}/studentLog/student/${studentId}`);
    }
}

