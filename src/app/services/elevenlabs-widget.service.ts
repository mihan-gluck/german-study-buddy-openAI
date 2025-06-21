// src/app/services/elevenlabs-widget.service.ts

import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ElevenLabsWidgetService {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  loadWidget(agentId: string): void {
    // Prevent duplicate script or widget
    if (this.document.getElementById('elevenlabs-script')) return;

    // Inject ElevenLabs widget tag
    const widget = this.document.createElement('elevenlabs-convai');
    widget.setAttribute('agent-id', agentId);
    this.document.body.appendChild(widget);

    // Inject ElevenLabs script
    const script = this.document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    script.id = 'elevenlabs-script';

    this.document.body.appendChild(script);
  }

  unloadWidget(): void {
    const widget = this.document.querySelector('elevenlabs-convai');
    const script = this.document.getElementById('elevenlabs-script');

    if (widget) widget.remove();
    if (script) script.remove();
  }
}

