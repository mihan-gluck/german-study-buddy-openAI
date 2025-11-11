import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MeetingLink {
  teacherId: string;
  batch: string;
  medium: string;
  platform: string;
  link: string;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MeetingLinkService {
    private readonly BASE_URL = `${environment.apiUrl}/meetingLink`;

    constructor(private http: HttpClient) {}

    // ✅ Save meeting link
    saveLink(meetingLink: MeetingLink): Observable<any> {
        return this.http.post(`${this.BASE_URL}`, meetingLink, { withCredentials: true });
    }

    // get links by teacher ID
    getLinksByTeacherId(teacherId: string): Observable<any> {
        return this.http.get(`${this.BASE_URL}/teacher/${teacherId}`, { withCredentials: true });
    }

    
    // ✅ Get single link by ID (for edit)
    getLinkById(id: string): Observable<any> {
        return this.http.get(`${this.BASE_URL}/${id}`, { withCredentials: true });
    }

    // ✅ Update meeting link by ID
    updateLink(id: string, data: Partial<MeetingLink>): Observable<any> {
        return this.http.put(`${this.BASE_URL}/${id}`, data, { withCredentials: true });
    }

    // ✅ Delete meeting link by ID
    deleteLink(id: string): Observable<any> {
        return this.http.delete(`${this.BASE_URL}/${id}`, { withCredentials: true });
    }
}
