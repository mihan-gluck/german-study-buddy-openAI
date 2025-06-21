//student-dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { VapiWidgetService } from '../../services/vapi-widget.service';
import { Renderer2 } from '@angular/core';
import { Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { VapiUsageService, VapiUsageData } from '../../services/vapi-usage.service';
import { AuthService } from '../../services/auth.service';
// import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FeedbackService } from '../../services/feedback.service';
import { CourseProgressService } from '../../services/course-progress.service';

interface FeedbackEntry {
  timestamp: string;
  studentName: string;
  studentId: string;
  summary: string;
  conversationTime: number;
  fluency: string;
  accent: string;
  grammar: string;
  overallCfbr: string;
  commonMistakes: string;
  currentLevel: string;
  suggestedImprovement: string;
}


interface VapiCourse {

  name: string;
  //openVapiTab: string;
  assistantID: string;
  apiKey: string;
}

interface CourseProgress {
  courseId: { _id: string; name: string };
  progressPercentage: number;
  lastUpdated: string;
}

@Component({
  standalone: false,
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
})

export class StudentDashboardComponent implements OnInit {
  feedbackList: FeedbackEntry[] = [];
  feedbackLoading: boolean = false;
  feedbackError: string | null = null;


  loading: boolean = false;
  error: string | null = null;
  vapiCourses: VapiCourse[] = [];

  callStartTime: number | null = null;
  callEndTime: number | null = null;
  selectedCourse: VapiCourse | null = null;
  vapiActive: boolean = false;
  openVapi: any;

  userProfile: any = null;

  basicUser: { name: string; email: string; level?: string } | null = null;  // From token

  courseProgressList: CourseProgress[] = [];

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private http: HttpClient,
    private feedbackService: FeedbackService,
    public authService: AuthService,
    private courseProgressService: CourseProgressService,
  ) {}

  ngOnInit(): void {
    this.basicUser = this.authService.getUser();  // from token
    this.fetchCourses();
    this.loadFeedback();
    this.fetchUserProfile();
    this.loadProgress();
  }

  loadFeedback(): void {
  this.feedbackLoading = true;

  const studentId = this.authService.getUserId();  // Assuming this returns the logged-in student's _id
  if (!studentId) {
    this.feedbackError = 'Student ID not found';
    this.feedbackLoading = false;
    return;
  }

  this.feedbackService.getStudentFeedback(studentId).subscribe({
    next: (data: any) => {
      this.feedbackList = data;
      this.feedbackLoading = false;
    },
    error: (err) => {
      this.feedbackError = 'Failed to load feedback';
      console.error(err);
      this.feedbackLoading = false;
    }
  });
}



  fetchCourses(): void {
    this.loading = true;

    // Replace with your real backend call
    setTimeout(() => {
      try {
        this.vapiCourses = [
          {
            name: 'A1 Spoken German',
            assistantID: 'd6c86545-f5b8-4bf3-9b8d-085ea08038c8',
            apiKey: '90d61da6-0eb0-444e-a78e-d59d8ff2dbde'
          }
        ];
        this.loading = false;
      } catch (err: any) {
        this.error = err.message || 'Something went wrong';
        this.loading = false;
      }
    }, 1000);
  }

  startCall(course: VapiCourse): void {
    this.selectedCourse = course;
    this.callStartTime = Date.now();
    this.vapiActive = true;

    // Remove existing widget
    const existingScript = this.document.getElementById('vapi-script');
    if (existingScript) existingScript.remove();

    // Inject CSS
    const style = this.renderer.createElement('style');
    style.textContent = `
      .vapi-widget {
        z-index: 9999;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
      }
    `;
    this.renderer.appendChild(this.document.head, style);

    // Inject script
    const script = this.renderer.createElement('script');
    script.type = 'text/javascript';
    script.id = 'vapi-script';
    script.text = `
      var vapiInstance = null;
      const assistant = "${course.assistantID}";
      const apiKey = "${course.apiKey}";
      const config = {
        position: "center",
        idle: {
          color: "#0447dd",
          title: "Talk to German Buddy",
          subtitle: "Ask your question"
        },
        loading: {
          title: "Connecting...",
          subtitle: "Please wait"
        },
        active: {
          title: "In call",
          subtitle: "Speak now"
        }
      };

      document.addEventListener("DOMContentLoaded", initVapi);
      function initVapi() {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
        s.defer = true;
        s.async = true;
        s.onload = function () {
          try {
            vapiInstance = window.vapiSDK.run({ apiKey, assistant, config });

            vapiInstance.on("callStarted", () => {
              window.dispatchEvent(new Event("vapi-call-start"));
            });

            vapiInstance.on("callEnded", () => {
              window.dispatchEvent(new Event("vapi-call-end"));
            });

            window.vapiInstance = vapiInstance;
          } catch (e) {
            console.error("Error loading VAPI", e);
          }
        };
        document.head.appendChild(s);
      }
    `;
    this.renderer.appendChild(this.document.body, script);
  }

  stopCall(): void {
    this.callEndTime = Date.now();
    this.vapiActive = false;

    if (window && (window as any).vapiInstance) {
      try {
        (window as any).vapiInstance.endCall(); // Close widget and end call
      } catch (e) {
        console.error('Failed to stop VAPI call:', e);
      }
    }

    if (this.selectedCourse) {
      this.logUsage(this.selectedCourse);
    }
  }

  logUsage(course: VapiCourse): void {
    if (this.callStartTime && this.callEndTime) {
      const duration = Math.round((this.callEndTime - this.callStartTime) / 1000); // in seconds
      const payload = {
        course: course.name,
        assistantID: course.assistantID,
        duration,
        timestamp: new Date().toISOString()
      };

      this.http.post('/api/vapi-usage', payload).subscribe({
        next: () => console.log('Usage logged'),
        error: err => console.error('Logging failed', err)
      });

      this.callStartTime = null;
      this.callEndTime = null;
    }
  }

  getAverageScore(category: keyof FeedbackEntry): number {
    const validScores = this.feedbackList.map(f => parseFloat(f[category] as string)).filter(n => !isNaN(n));
    if (!validScores.length) return 0;
    return validScores.reduce((sum, val) => sum + val, 0) / validScores.length;
  }

  exportToCSV(): void {
    const headers = Object.keys(this.feedbackList[0] || {}).join(',');
    const rows = this.feedbackList.map(fb => Object.values(fb).join(','));
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feedback.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  fetchUserProfile(): void {
  this.authService.getUserProfile().subscribe({
    next: (profile) => {
      this.userProfile = profile;
    },
    error: (err) => {
      console.error('Failed to load full user profile:', err);
    }
  });
}

  loadProgress(): void {
    this.courseProgressService.getProgress().subscribe({
      next: (data) => {
        this.courseProgressList = data;
      },
      error: (err) => {
        console.error('Failed to fetch course progress:', err);
      }
    });
  }

  getProgressColor(value: number): 'primary' | 'accent' | 'warn' {
  if (value >= 75) return 'primary';
  if (value >= 40) return 'accent';
  return 'warn';
}



}

/* export class StudentDashboardComponent implements OnInit {

  loading: boolean = false;
  error: string | null = null;
  vapiCourses: VapiCourse[] = [];

  // Usage tracking
  callStartTime: number | null = null;
  callEndTime: number | null = null;
  selectedCourse: VapiCourse | null = null;
  vapiActive: boolean = false;

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.fetchCourses();
  }

  fetchCourses(): void {
    this.loading = true;

    // Replace with your real backend call
    setTimeout(() => {
      try {
        // Dummy data, fetch from backend in production
        this.vapiCourses = [
          {
            name: 'A1 Spoken German',
            assistantID: 'd6c86545-f5b8-4bf3-9b8d-085ea08038c8',
            apiKey: '90d61da6-0eb0-444e-a78e-d59d8ff2dbde'
          }
        ];
        this.loading = false;
      } catch (err: any) {
        this.error = err.message || 'Something went wrong';
        this.loading = false;
      }
    }, 1000);
  }

  openVapi(course: VapiCourse): void {
    // Remove existing widget
    const existingScript = this.document.getElementById('vapi-script');
    if (existingScript) existingScript.remove();

    // Inject CSS for centering
    const style = this.renderer.createElement('style');
    style.textContent = `
      .vapi-widget {
        z-index: 9999;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
      }
    `;
    this.renderer.appendChild(this.document.head, style);

    // Inject script
    const script = this.renderer.createElement('script');
    script.type = 'text/javascript';
    script.id = 'vapi-script';
    script.text = `
      var vapiInstance = null;
      const assistant = "${course.assistantID}";
      const apiKey = "${course.apiKey}";
      const config = {
        position: "center",
        idle: {
          color: "#0447dd",
          title: "Talk to German Buddy",
          subtitle: "Ask your question"
        },
        loading: {
          title: "Connecting...",
          subtitle: "Please wait"
        },
        active: {
          title: "In call",
          subtitle: "Speak now"
        }
      };

      document.addEventListener("DOMContentLoaded", initVapi);
      function initVapi() {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
        s.defer = true;
        s.async = true;
        s.onload = function () {
          try {
            vapiInstance = window.vapiSDK.run({
              apiKey,
              assistant,
              config
            });

            vapiInstance.on("callStarted", () => {
              window.dispatchEvent(new Event("vapi-call-start"));
            });

            vapiInstance.on("callEnded", () => {
              window.dispatchEvent(new Event("vapi-call-end"));
            });

          } catch (e) {
            console.error("Error loading VAPI", e);
          }
        };
        document.head.appendChild(s);
      }
    `;
    this.renderer.appendChild(this.document.body, script);

    // Track events in Angular
    window.addEventListener('vapi-call-start', () => {
      this.callStartTime = Date.now();
    });

    window.addEventListener('vapi-call-end', () => {
      this.callEndTime = Date.now();
      this.logUsage(course);
    });
  }

  logUsage(course: VapiCourse): void {
    if (this.callStartTime && this.callEndTime) {
      const duration = Math.round((this.callEndTime - this.callStartTime) / 1000); // seconds

      const payload = {
        course: course.name,
        assistantID: course.assistantID,
        duration,
        timestamp: new Date().toISOString()
      };

      // Send to your Express backend
      this.http.post('/api/vapi-usage', payload).subscribe({
        next: () => console.log('Usage logged'),
        error: (err) => console.error('Logging failed', err)
      });

      // Reset
      this.callStartTime = null;
      this.callEndTime = null;
    }
  }
} */
  
/* })
export class StudentDashboardComponent implements OnInit {
  loading: boolean = false;
  error!: string;
openVapiTab(arg0: string) {
throw new Error('Method not implemented.');
}
  vapiCourses: VapiCourse[] = [];
  aiAgents: any;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.fetchVapiCourses();
  }

  fetchVapiCourses(): void {
    this.authService.getVapiCourses().subscribe({
      next: (courses) => {
        this.vapiCourses = courses;
        this.loading = false;
      },
      error: (err) => {
         this.error = 'Could not load your courses.';
         this.loading = false;
      },
    });
  }

  openAgent(course: VapiCourse): void {
    const url = `/assets/vapi-launcher.html?assistant=${course.assistantID}&key=${course.apiKey}`;
    window.open(url, '_blank');
  }
} */


/* import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  aiAgents = [
    {
      name: 'A1 Beginner Agent',
      url: 'https://vapi-widget.vercel.app?bot_id=BOT_ID_FOR_A1'
    },
    {
      name: 'A2 Elementary Agent',
      url: 'https://vapi-widget.vercel.app?bot_id=BOT_ID_FOR_A2'
    },
    {
      name: 'B1 Intermediate Agent',
      url: 'https://vapi-widget.vercel.app?bot_id=BOT_ID_FOR_B1'
    },
    {
      name: 'B2 Upper Intermediate Agent',
      url: 'https://vapi-widget.vercel.app?bot_id=BOT_ID_FOR_B2'
    },
    {
      name: 'C1 Advanced Agent',
      url: 'https://vapi-widget.vercel.app?bot_id=BOT_ID_FOR_C1'
    },
    {
      name: 'C2 Proficient Agent',
      url: 'https://vapi-widget.vercel.app?bot_id=BOT_ID_FOR_C2'
    }
  ];

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

    // Remove widget container (floating UI)
    const vapiWidget = document.querySelector('[data-testid="vapi-widget"]');
    if (vapiWidget && vapiWidget.parentElement) {
      vapiWidget.parentElement.removeChild(vapiWidget);
    }
  }
} */




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
