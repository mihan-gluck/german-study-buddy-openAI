import { Component, OnInit } from '@angular/core';
import { AiConversationsService } from '../../services/ai-conversations.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

// Define a Message interface
interface Message {
  text: string;
  sender: string;
}

// Define the AIConversation interface
interface AIConversation {
  _id: string;
  messages: Message[];
  timestamp: string;
}

@Component({
  selector: 'app-ai-conversations',
  imports: [CommonModule, HttpClientModule],
  standalone: true,
  templateUrl: './ai-conversations.component.html',
  styleUrls: ['./ai-conversations.component.css']
})

export class AiConversationsComponent implements OnInit {
  conversations: AIConversation[] = [];

  constructor(private aiConversationsService: AiConversationsService) {}

  ngOnInit(): void {
    this.loadConversations();
  }

  loadConversations(): void {
    this.aiConversationsService.getAiConversations().subscribe(
      (data: AIConversation[]) => {
        this.conversations = data; // TypeScript now understands the structure of conversations
      },
      (error) => {
        console.error('Error fetching conversations', error);
      }
    );
  }
}