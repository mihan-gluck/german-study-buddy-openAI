// ============================================
// MOBILE MICROPHONE AUTO-STOP FIX
// ============================================
// Add this code to: src/app/components/ai-tutor-chat/ai-tutor-chat.component.ts

// 1. ADD THIS HELPER METHOD TO THE CLASS (around line 960, before initializeSpeechRecognition)
// ============================================

/**
 * Detect if user is on a mobile device
 * Mobile browsers have stricter speech recognition limitations
 */
private isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}


// 2. REPLACE THE ENTIRE initializeSpeechRecognition() METHOD (starting at line 961)
// ============================================

/**
 * Initialize Web Speech API for speech recognition
 * Includes mobile-specific auto-restart logic to handle browser timeouts
 */
initializeSpeechRecognition(): void {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.speechRecognition = new SpeechRecognition();
    
    this.speechRecognition.continuous = true; // Keep listening until manually stopped
    this.speechRecognition.interimResults = true; // Get interim results for better UX
    this.speechRecognition.maxAlternatives = 1; // Only need the best match
    
    // Set language based on module's target language
    if (this.module?.targetLanguage === 'English') {
      this.speechRecognition.lang = 'en-US';
    } else {
      this.speechRecognition.lang = 'de-DE'; // Default to German
    }
    
    this.speechRecognition.onstart = () => {
      this.isListening = true;
      console.log('🎤 Started listening...');
    };
    
    this.speechRecognition.onresult = (event: any) => {
      // Get the latest result (last one in the results array)
      const resultIndex = event.results.length - 1;
      const transcript = event.results[resultIndex][0].transcript;
      const confidence = event.results[resultIndex][0].confidence || 0.8; // Default confidence
      const isFinal = event.results[resultIndex].isFinal;
      
      console.log('🎤 Speech captured:', {
        transcript,
        confidence,
        isFinal,
        resultIndex,
        totalResults: event.results.length
      });
      
      // Apply confidence threshold
      if (confidence < 0.6) {
        console.warn('🎤 Low confidence transcript, ignoring');
        return;
      }
      
      // Normalize the transcript for consistent processing
      const normalizedTranscript = this.normalizeText(transcript);
      
      // Store the captured speech but DON'T send it yet
      // Always update with the latest transcript (even if not final)
      if (normalizedTranscript && normalizedTranscript.trim()) {
        this.currentMessage = normalizedTranscript;
        this.isProcessingSpeech = false;
        
        console.log('🎤 Speech stored (not sent yet):', normalizedTranscript);
        console.log('🎤 Is final result:', isFinal);
        console.log('🎤 User must manually stop microphone to send message');
        
        // Force UI update to show captured text
        this.cdr.detectChanges();
      } else {
        console.log('🎤 Empty transcript, waiting for more speech...');
      }
      
      // Show what was captured in the UI but don't send
      // The user will manually stop the mic when ready to send
    };
    
    this.speechRecognition.onerror = (event: any) => {
      console.error('🎤 Speech recognition error:', event.error);
      
      // Don't set isListening to false for 'no-speech' error on mobile
      // This allows auto-restart to work properly
      if (event.error !== 'no-speech' || !this.isMobileDevice()) {
        this.isListening = false;
      }
      
      // Provide user feedback for common errors
      let errorMessage = '';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking again.';
          // On mobile, this is normal - will auto-restart
          if (this.isMobileDevice()) {
            console.log('🎤 No speech on mobile - will auto-restart');
            return; // Don't show error on mobile
          }
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not accessible. Please check permissions.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      // Show error message briefly
      console.warn('🎤', errorMessage);
      // You could show a toast notification here if you have one
    };
    
    this.speechRecognition.onend = () => {
      console.log('🎤 Speech recognition ended');
      
      // ⭐ KEY FIX: Check if this was a user-initiated stop or browser auto-stop
      if (this.isListening) {
        // Browser auto-stopped (user didn't tap stop button)
        console.log('🎤 Browser auto-stopped speech recognition');
        
        // On mobile, automatically restart to keep listening
        if (this.isMobileDevice()) {
          console.log('🎤 Mobile device detected - auto-restarting...');
          
          // Small delay before restart to avoid rapid cycling
          setTimeout(() => {
            if (this.isListening && this.speechRecognition) {
              try {
                this.speechRecognition.start();
                console.log('🎤 Speech recognition restarted successfully');
              } catch (error) {
                console.error('🎤 Failed to restart:', error);
                this.isListening = false;
                this.cdr.detectChanges();
              }
            }
          }, 100); // 100ms delay
        } else {
          // Desktop - don't auto-restart, user has full control
          console.log('🎤 Desktop detected - not auto-restarting');
          this.isListening = false;
        }
      } else {
        // User manually stopped (stopListening() was called)
        console.log('🎤 User manually stopped speech recognition');
      }
      
      this.cdr.detectChanges();
    };
  } else {
    console.warn('Speech recognition not supported in this browser');
    this.voiceEnabled = false;
  }
}


// 3. UPDATE THE stopListening() METHOD (around line 1079)
// ============================================
// CRITICAL: Set isListening = false BEFORE calling stop()
// This tells onend that the stop was user-initiated

/**
 * Stop listening and send the captured message
 * Sets isListening to false BEFORE stopping to prevent auto-restart
 */
stopListening(): void {
  if (this.speechRecognition && this.isListening) {
    console.log('🎤 Stopping microphone, current message:', this.currentMessage);
    
    // ⭐ KEY FIX: Set to false BEFORE calling stop()
    // This tells onend that this was user-initiated, not browser auto-stop
    this.isListening = false;
    
    // Stop speech recognition
    this.speechRecognition.stop();
    
    // Wait a bit longer to ensure speech recognition has fully processed
    setTimeout(() => {
      // If there's a captured message, send it now
      if (this.currentMessage && this.currentMessage.trim()) {
        console.log('🎤 Microphone stopped - sending captured message:', this.currentMessage);
        
        // Send the message that was captured during listening
        this.sendMessage(true); // true indicates speech input
      } else {
        console.log('🎤 Microphone stopped - no message to send');
        console.warn('⚠️ Speech was not captured. This might be due to:');
        console.warn('   - Speaking too quickly after starting');
        console.warn('   - Network issues');
        console.warn('   - Browser speech recognition limitations');
        console.warn('   - Low audio quality or background noise');
        
        // Show non-intrusive inline error message instead of alert popup
        this.showSpeechError = true;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          this.showSpeechError = false;
          this.cdr.detectChanges();
        }, 5000);
        
        this.cdr.detectChanges();
      }
    }, 800); // Increased delay from 500ms to 800ms to ensure processing completes
  }
}


// ============================================
// TESTING INSTRUCTIONS
// ============================================

/*
MOBILE TESTING (Android Chrome / iOS Safari):
1. Open app on mobile phone
2. Navigate to AI tutor chat
3. Tap microphone button (should turn red and pulse)
4. Speak a German phrase
5. Wait 5-10 seconds (silence)
6. ✅ Mic should auto-restart (stays red, keeps pulsing)
7. Continue speaking or tap stop
8. ✅ Full message should be captured and sent

DESKTOP TESTING (Chrome / Edge / Safari):
1. Open app on desktop browser
2. Navigate to AI tutor chat
3. Tap microphone button
4. Speak a phrase
5. Wait 10+ seconds
6. ✅ Mic should NOT auto-restart (manual control)
7. Tap stop to send message

CONSOLE LOGS TO WATCH FOR:
- "🎤 Started listening..."
- "🎤 Speech captured: ..."
- "🎤 Speech recognition ended"
- "🎤 Browser auto-stopped speech recognition"
- "🎤 Mobile device detected - auto-restarting..."
- "🎤 Speech recognition restarted successfully"
- "🎤 User manually stopped speech recognition"
*/


// ============================================
// OPTIONAL ENHANCEMENTS
// ============================================

// ENHANCEMENT 1: Add vibration feedback on mobile (optional)
// Add this inside the onend handler after successful restart:
/*
if (this.isMobileDevice() && 'vibrate' in navigator) {
  navigator.vibrate(50); // Short 50ms vibration
}
*/

// ENHANCEMENT 2: Add visual indicator for auto-restart (optional)
// Add this property to the class:
/*
isAutoRestarting: boolean = false;
*/

// Then in the onend handler:
/*
if (this.isMobileDevice()) {
  this.isAutoRestarting = true;
  
  setTimeout(() => {
    if (this.isListening && this.speechRecognition) {
      try {
        this.speechRecognition.start();
        
        // Hide indicator after successful restart
        setTimeout(() => {
          this.isAutoRestarting = false;
          this.cdr.detectChanges();
        }, 500);
      } catch (error) {
        this.isAutoRestarting = false;
        this.isListening = false;
        this.cdr.detectChanges();
      }
    }
  }, 100);
}
*/

// And add this to the template:
/*
<div class="auto-restart-indicator" *ngIf="isAutoRestarting">
  <i class="fas fa-sync fa-spin"></i>
  <small>Reconnecting mic...</small>
</div>
*/


// ============================================
// TROUBLESHOOTING
// ============================================

/*
ISSUE: Mic still stops on mobile
SOLUTION: 
- Check browser console for errors
- Verify microphone permissions granted
- Test on different mobile browser (Chrome vs Safari)
- Check if battery saver mode is enabled
- Ensure stable internet connection

ISSUE: Mic keeps restarting on desktop
SOLUTION:
- Verify isMobileDevice() returns false on desktop
- Check user agent string in console
- Clear browser cache and reload

ISSUE: No speech captured
SOLUTION:
- Speak louder and clearer
- Check microphone is not muted
- Test microphone in other apps
- Grant microphone permissions
- Check network connection (speech API requires internet)
*/
