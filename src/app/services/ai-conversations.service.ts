import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define the Message interface
interface Message {
    text: string;
    sender: string; // sender can be either 'user' or 'ai'
  }
  
  // Define the AIConversation interface
  interface AIConversation {
    _id: string;
    messages: Message[];
    timestamp: string;
  }

@Injectable({
  providedIn: 'root',
})
export class AiConversationsService {
  private apiUrl = 'http://localhost:4000/api/aiConversations'; // Your backend API

  constructor(private http: HttpClient) {}

  // Fetch AI conversations from the backend API
  getAiConversations(): Observable<AIConversation[]> {
    return this.http.get<AIConversation[]>(this.apiUrl);
  }
}