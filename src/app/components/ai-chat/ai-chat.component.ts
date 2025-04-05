// ai-chat.component.ts
import { Component, AfterViewInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [HttpClientModule, CommonModule],
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.css']
})
export class AiChatComponent implements AfterViewInit {

  constructor() { }

  ngAfterViewInit() {
    // Dynamically load the Elevan Labs script
    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/convai-widget/index.js';  // Correct script URL
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);

    script.onload = () => {
      // Ensure that the widget is initialized after the script is loaded
      if (window['ElevenLabsWidget']) {
        // Initialize the widget with only the agent_id
        const agentId = 'm3dXLKXquxjv9KBGtTfs';  // Replace with your actual Agent ID

        if (!agentId) {
          console.error('Agent ID is missing!');
          return;
        }

        // Initialize the widget after the script is loaded
        window['ElevenLabsWidget'].initialize({
          containerId: 'ai-chat-widget', // ID of the container where the widget will be rendered
          agentId: agentId,              // Your actual Agent ID (from ElevenLabs)
        });
      } else {
        console.error('ElevenLabsWidget not loaded correctly');
      }
    };

    script.onerror = () => {
      console.error('Failed to load ElevenLabs widget script');
    };
  }
}
