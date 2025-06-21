// src/app/services/voice-agent.service.ts

import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class VoiceAgentService {
  private vapiScriptId = 'vapi-script';
  private vapiInstance: any = null;

  private elevenLabsScriptId = 'elevenlabs-script';
  private elevenLabsWidgetLoaded = false;

  private vapiActive = false;
  private elevenLabsActive = false;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  /** ------------------------ VAPI ------------------------ **/

  startVapiCall(assistantId: string, apiKey: string): void {
    this.cleanupVapiWidget();
    this.vapiActive = true;

    const script = this.document.createElement('script');
    script.id = this.vapiScriptId;
    script.type = 'text/javascript';
    script.text = `
      const assistant = "${assistantId}";
      const apiKey = "${apiKey}";
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

      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
      s.defer = true;
      s.async = true;
      s.onload = function () {
        try {
          window.vapiInstance = window.vapiSDK.run({ apiKey, assistant, config });
          window.vapiInstance.on("callStarted", () => {
            window.dispatchEvent(new Event("vapi-call-start"));
          });
          window.vapiInstance.on("callEnded", () => {
            window.dispatchEvent(new Event("vapi-call-end"));
          });
        } catch (e) {
          console.error("Error starting VAPI", e);
        }
      };
      document.head.appendChild(s);
    `;
    this.document.body.appendChild(script);
  }

  stopVapiCall(): void {
    this.vapiActive = false;

    try {
      if ((window as any).vapiInstance) {
        (window as any).vapiInstance.endCall();
        this.cleanupVapiWidget();
      }
    } catch (err) {
      console.error('Error stopping VAPI call:', err);
    }
  }

  private cleanupVapiWidget(): void {
    const oldScript = this.document.getElementById(this.vapiScriptId);
    if (oldScript) oldScript.remove();

    const sdkScript = this.document.querySelector('script[src*="vapiSDK"]');
    if (sdkScript) sdkScript.remove();

    this.vapiInstance = null;
  }

  /** ------------------------ ElevenLabs ------------------------ **/

  startElevenLabsCall(agentId: string): void {
    this.unloadElevenLabsCall();
    this.elevenLabsActive = true;

    if (this.elevenLabsWidgetLoaded) {
      this.unloadElevenLabsCall();
    }

    const script = this.document.createElement('script');
    script.id = this.elevenLabsScriptId;
    script.src = `https://elevenlabs.io/app/talk?agentId=${agentId}`;
    script.async = true;
    script.defer = true;

    this.document.body.appendChild(script);
    this.elevenLabsWidgetLoaded = true;
  }

  stopElevenLabsCall(): void {
    this.unloadElevenLabsCall();
    this.elevenLabsActive = false;
  }

  private unloadElevenLabsCall(): void {
    const oldScript = this.document.getElementById(this.elevenLabsScriptId);
    if (oldScript) {
      oldScript.remove();
      this.elevenLabsWidgetLoaded = false;
    }
  }

  isVapiActive(): boolean {
    return this.vapiActive;
    }

    isElevenLabsActive(): boolean {
    return this.elevenLabsActive;
    }

    getActiveAgent(): 'vapi' | 'elevenlabs' | null {
    if (this.vapiActive) return 'vapi';
    if (this.elevenLabsActive) return 'elevenlabs';
    return null;
    }
}

