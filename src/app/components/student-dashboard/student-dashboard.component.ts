//student-dashboard.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: false,
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
  
})
export class StudentDashboardComponent implements OnInit, OnDestroy {

  private readonly scriptId = 'vapi-widget';

  ngOnInit(): void {
    this.loadVapiWidget();
  }

  ngOnDestroy(): void {
    this.removeVapiWidget();
  }

  private loadVapiWidget(): void {
    // Prevent loading if already loaded
    if (document.getElementById(this.scriptId)) return;

    const script = document.createElement('script');
    script.id = this.scriptId;
    script.src = 'https://cdn.jsdelivr.net/npm/@vapi-ai/web';
    script.async = true;

    script.onload = () => {
      // @ts-ignore
      if (window.Vapi) {
        // @ts-ignore
        const vapi = new window.Vapi({
          apiKey: '',
          agentId: 'ag_b1dJIEgFTlDCEIXGcCymD',
        });
      }
    };

    document.body.appendChild(script);
  }

  private removeVapiWidget(): void {
    const script = document.getElementById(this.scriptId);
    if (script) {
      script.remove();
    }

    // Remove widget container (it's a floating div injected by Vapi)
    const vapiWidget = document.querySelector('[data-testid="vapi-widget"]');
    if (vapiWidget && vapiWidget.parentElement) {
      vapiWidget.parentElement.removeChild(vapiWidget);
    }
  }
}



/* import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-student-dashboard',
  standalone: false,
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit, AfterViewInit {
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

  ngAfterViewInit() {
    this.loadVapiAgent();
  }

  loadVapiAgent() {
    const assistant = 'd6c86545-f5b8-4bf3-9b8d-085ea08038c8';
    const apiKey = '90d61da6-0eb0-444e-a78e-d59d8ff2dbde';

    const buttonConfig = {
      position: 'custom',
      idle: {
        color: '#0447dd',
        type: 'pill',
        title: 'Need Help?',
        subtitle: 'Ask our AI Assistant',
        icon: 'https://unpkg.com/lucide-static@0.321.0/icons/phone.svg',
      },
      loading: {
        color: '#0447dd',
        type: 'pill',
        title: 'Connecting...',
        subtitle: 'Please wait',
        icon: 'https://unpkg.com/lucide-static@0.321.0/icons/loader-2.svg',
      },
      active: {
        color: 'rgb(255, 0, 0)',
        type: 'pill',
        title: 'Call is in progress...',
        subtitle: 'End the call.',
        icon: 'https://unpkg.com/lucide-static@0.321.0/icons/phone-off.svg',
      },
    };

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js';
    script.defer = true;
    script.async = true;

    script.onload = () => {
      try {
        const vapiInstance = (window as any).vapiSDK.run({
          apiKey,
          assistant,
          config: buttonConfig,
          targetElement: document.getElementById('vapi-widget-container'),
        });
      } catch (err) {
        console.error('Failed to load Vapi Agent:', err);
      }
    };

    document.body.appendChild(script);
  }
}
 */


/* import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-student-dashboard',
  standalone: false,
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit, AfterViewInit {
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

  ngAfterViewInit() {
    const assistant = "d6c86545-f5b8-4bf3-9b8d-085ea08038c8";
    const apiKey = "90d61da6-0eb0-444e-a78e-d59d8ff2dbde";

    const buttonConfig = {
      position: "custom", // 👈 important
      mountTo: "#vapi-widget-container", // 👈 mount inside this div
      width: "60px",
      height: "60px",
      idle: {
        color: "#0447dd",
        type: "pill",
        title: "Have a quick question?",
        subtitle: "Talk with our AI assistant",
        icon: "https://unpkg.com/lucide-static@0.321.0/icons/phone.svg",
      },
      loading: {
        color: "#0447dd",
        type: "pill",
        title: "Connecting...",
        subtitle: "Please wait",
        icon: "https://unpkg.com/lucide-static@0.321.0/icons/loader-2.svg",
      },
      active: {
        color: "rgb(255, 0, 0)",
        type: "pill",
        title: "Call is in progress...",
        subtitle: "End the call.",
        icon: "https://unpkg.com/lucide-static@0.321.0/icons/phone-off.svg",
      },
    };

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
    script.defer = true;
    script.async = true;

    script.onload = () => {
      try {
        (window as any).vapiSDK.run({
          apiKey,
          assistant,
          config: buttonConfig,
        });
      } catch (error) {
        console.error("VAPI Widget Initialization Error:", error);
      }
    };

    document.body.appendChild(script);
  }

  openAgent(url: string) {
    window.open(url, '_blank');
  }
} */


// vapi agent on the bottom right ..
/* import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-student-dashboard',
  standalone: false,
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
})
export class StudentDashboardComponent implements OnInit, AfterViewInit {
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

  ngAfterViewInit() {
    this.loadVapiAgent();
  }

  loadVapiAgent() {
    const assistant = 'd6c86545-f5b8-4bf3-9b8d-085ea08038c8';
    const apiKey = '90d61da6-0eb0-444e-a78e-d59d8ff2dbde';

    const buttonConfig = {
      position: 'custom',
      idle: {
        color: '#0447dd',
        type: 'pill',
        title: 'Need Help?',
        subtitle: 'Ask our AI Assistant',
        icon: 'https://unpkg.com/lucide-static@0.321.0/icons/phone.svg',
      },
      loading: {
        color: '#0447dd',
        type: 'pill',
        title: 'Connecting...',
        subtitle: 'Please wait',
        icon: 'https://unpkg.com/lucide-static@0.321.0/icons/loader-2.svg',
      },
      active: {
        color: 'rgb(255, 0, 0)',
        type: 'pill',
        title: 'Call is in progress...',
        subtitle: 'End the call.',
        icon: 'https://unpkg.com/lucide-static@0.321.0/icons/phone-off.svg',
      },
    };

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js';
    script.defer = true;
    script.async = true;

    script.onload = () => {
      try {
        const vapiInstance = (window as any).vapiSDK.run({
          apiKey,
          assistant,
          config: buttonConfig,
          targetElement: document.getElementById('vapi-widget-container'),
        });
      } catch (err) {
        console.error('Failed to load Vapi Agent:', err);
      }
    };

    document.body.appendChild(script);
  }
}  */


/* =================================================================================

import { Component, OnInit, Renderer2 } from '@angular/core';

declare global {
  interface Window {
    vapiSDK: any;
  }
}

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

  ngAfterViewInit() {
    this.loadVapiAgent();
  }

  loadVapiAgent() {
    const assistant = 'd6c86545-f5b8-4bf3-9b8d-085ea08038c8';
    const apiKey = '90d61da6-0eb0-444e-a78e-d59d8ff2dbde';

    const buttonConfig = {
      position: 'custom', // custom means we’ll control it in the DOM
      idle: {
        color: '#0447dd',
        type: 'pill',
        title: 'Need Help?',
        subtitle: 'Ask our AI Assistant',
        icon: 'https://unpkg.com/lucide-static@0.321.0/icons/phone.svg',
      },
      loading: {
        color: '#0447dd',
        type: 'pill',
        title: 'Connecting...',
        subtitle: 'Please wait',
        icon: 'https://unpkg.com/lucide-static@0.321.0/icons/loader-2.svg',
      },
      active: {
        color: 'rgb(255, 0, 0)',
        type: 'pill',
        title: 'Call is in progress...',
        subtitle: 'End the call.',
        icon: 'https://unpkg.com/lucide-static@0.321.0/icons/phone-off.svg',
      },
    };

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js';
    script.defer = true;
    script.async = true;

    script.onload = () => {
      try {
        const vapiInstance = (window as any).vapiSDK.run({
          apiKey,
          assistant,
          config: buttonConfig,
          targetElement: document.getElementById('vapi-widget-container'),
        });
      } catch (err) {
        console.error('Failed to load Vapi Agent:', err);
      }
    };

    document.body.appendChild(script);
  }
} */

/* =======================================
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
} */

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
