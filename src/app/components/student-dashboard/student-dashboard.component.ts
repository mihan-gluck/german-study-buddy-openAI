//student-dashboard.component.ts

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-student-dashboard',
  standalone: false,
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css'
})
export class StudentDashboardComponent implements OnInit {
  aiAgents = [
    { name: 'Beginner Level AI', url: 'https://elevenlabs.io/agent-beginner' },
    { name: 'Elementary Level AI', url: 'https://elevenlabs.io/agent-elementary' },
    { name: 'Intermediate Level AI', url: 'https://elevenlabs.io/agent-intermediate' },
    { name: 'Upper Intermediate AI', url: 'https://elevenlabs.io/agent-upper-intermediate' },
    { name: 'Advanced AI', url: 'https://elevenlabs.io/agent-advanced' },
    { name: 'Expert Level AI', url: 'https://elevenlabs.io/agent-expert' }
  ];

  ngOnInit() {
    console.log('AI Agents:', this.aiAgents);
  }

  openAgent(url: string) {
    window.open(url, '_blank');
  }
}

/* export class StudentDashboardComponent {


  aiAgents = [
    { name: 'Beginner Level AI', url: 'https://elevenlabs.io/app/talk-to?agent_id=R4krv9ou4aKn2rGWGw3Q' },
    { name: 'Elementary Level AI', url: 'https://elevenlabs.io/agent-elementary' },
    { name: 'Intermediate Level AI', url: 'https://elevenlabs.io/agent-intermediate' },
    { name: 'Upper Intermediate AI', url: 'https://elevenlabs.io/agent-upper-intermediate' },
    { name: 'Advanced AI', url: 'https://elevenlabs.io/agent-advanced' },
    { name: 'Expert Level AI', url: 'https://elevenlabs.io/agent-expert' }
  ];
  ngOnInit() {
    console.log('AI Agents:', this.aiAgents);
  }

  openAgent(url: string) {
    window.open(url, '_blank');



}
 */
