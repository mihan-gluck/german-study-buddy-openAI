// src/app/services/voice-agent.service.ts

import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class VoiceAgentService {
  private vapiScriptId = 'vapi-script';
  private vapiSDKScriptId = 'vapi-sdk';
  private elevenLabsScriptId = 'elevenlabs-script';

  private vapiInstance: any = null;
  private elevenLabsWidgetLoaded = false;

  private vapiActive = false;
  private elevenLabsActive = false;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  /** ------------------------ VAPI ------------------------ **/

  loadVapi(assistantId: string, apiKey: string): void {
    this.unloadVapi(); // clean existing if any
    this.vapiActive = true;
    this.startVapiCall(assistantId, apiKey);

    const inlineScript = this.document.createElement('script');
    inlineScript.id = this.vapiScriptId;
    inlineScript.type = 'text/javascript';
    inlineScript.text = `
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
      s.id = "${this.vapiSDKScriptId}";
      s.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
      s.defer = true;
      s.async = true;
      s.onload = function () {
        try {
          window.vapiInstance = window.vapiSDK.run({ apiKey, assistant, config });
          window.vapiInstance.on("callStarted", () => window.dispatchEvent(new Event("vapi-call-start")));
          window.vapiInstance.on("callEnded", () => window.dispatchEvent(new Event("vapi-call-end")));
        } catch (e) {
          console.error("Error starting VAPI", e);
        }
      };
      document.head.appendChild(s);
    `;

    this.document.body.appendChild(inlineScript);
  }

  unloadVapi(): void {
    this.vapiActive = false;

    const inlineScript = this.document.getElementById(this.vapiScriptId);
    if (inlineScript) inlineScript.remove();

    const sdkScript = this.document.getElementById(this.vapiSDKScriptId);
    if (sdkScript) sdkScript.remove();

    try {
      if ((window as any).vapiInstance) {
        (window as any).vapiInstance.endCall();
        delete (window as any).vapiInstance;
      }
    } catch (err) {
      console.error('Error unloading VAPI:', err);
    }

    this.vapiInstance = null;
  }

  startVapiCall(assistantId: string, apiKey: string): void {
    this.loadVapi(assistantId, apiKey);
  }

  stopVapiCall(): void {
    this.unloadVapi();
  }

  /** ------------------------ ElevenLabs ------------------------ **/

  startElevenLabsCall(agentId: string): void {
    this.stopElevenLabsCall(); // cleanup if needed
    this.elevenLabsActive = true;

    const script = this.document.createElement('script');
    script.id = this.elevenLabsScriptId;
    script.src = `https://elevenlabs.io/app/talk?agentId=${agentId}`;
    script.async = true;
    script.defer = true;

    this.document.body.appendChild(script);
    this.elevenLabsWidgetLoaded = true;
  }

  stopElevenLabsCall(): void {
    const script = this.document.getElementById(this.elevenLabsScriptId);
    if (script) script.remove();

    this.elevenLabsWidgetLoaded = false;
    this.elevenLabsActive = false;
  }

  /** ------------------------ Helpers ------------------------ **/

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
