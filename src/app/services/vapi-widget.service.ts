// vapi-widget.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VapiWidgetService {
  private vapiInstance: any;

  loadWidget(apiKey: string, assistantId: string): void {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .vapi-widget {
          z-index: 9999;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          right: auto !important;
          bottom: auto !important;
      }
      html, body {
          height: 100%;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
      }
    `;
    document.head.appendChild(styleElement);

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js';
    script.defer = true;
    script.async = true;

    script.onload = () => {
      try {
        this.vapiInstance = (window as any).vapiSDK.run({
          apiKey,
          assistant: assistantId,
          config: {
            position: 'center',
            offset: '0px',
            width: '50px',
            height: '50px',
            idle: {
              color: '#0447dd',
              type: 'pill',
              title: 'Have a quick question?',
              subtitle: 'Talk with our AI assistant',
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
          },
        });
      } catch (error) {
        console.error('VAPI Widget Initialization Error:', error);
      }
    };

    document.head.appendChild(script);
  }
}
