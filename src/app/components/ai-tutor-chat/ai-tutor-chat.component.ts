// src/app/components/ai-tutor-chat/ai-tutor-chat.component.ts

import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AiTutorService, TutorMessage } from '../../services/ai-tutor.service';
import { LearningModulesService } from '../../services/learning-modules.service';
import { SubscriptionGuardService } from '../../services/subscription-guard.service';
import { Subscription } from 'rxjs';

// Speech Recognition interface
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

@Component({
  selector: 'app-ai-tutor-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-tutor-chat.component.html',
  styleUrls: ['./ai-tutor-chat.component.css']
})
export class AiTutorChatComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  moduleId: string = '';
  module: any = null;
  sessionId: string = '';
  sessionType: string = 'practice';
  
  // Auto-refresh mechanism
  private autoRefreshInterval: any;
  
  // Local message storage to ensure persistence
  private localMessages: TutorMessage[] = [];
  
  messages: TutorMessage[] = [];
  currentMessage: string = '';
  isLoading: boolean = false;
  isSending: boolean = false;
  sessionActive: boolean = false;
  
  suggestions: string[] = [];
  currentExercise: any = null;
  exerciseAnswer: string = '';
  
  sessionStats = {
    totalMessages: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    sessionScore: 0,
    conversationScore: 0, // New: Points for conversation participation
    totalScore: 0 // New: Combined score
  };
  
  // Role-play UI state
  showRolePlayDetails: boolean = false;
  rolePlayDetails: any = null;
  
  // Speech processing state
  isProcessingSpeech: boolean = false;
  
  // Speech functionality
  speechSynthesis: SpeechSynthesis;
  speechRecognition: any;
  isListening: boolean = false;
  isSpeaking: boolean = false;
  voiceEnabled: boolean = true;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    public router: Router, // Make router public for template access
    private aiTutorService: AiTutorService,
    private learningModulesService: LearningModulesService,
    private subscriptionGuard: SubscriptionGuardService,
    private cdr: ChangeDetectorRef // Add ChangeDetectorRef for manual change detection
  ) {
    // Initialize speech synthesis
    this.speechSynthesis = window.speechSynthesis;
    
    // Initialize speech recognition
    this.initializeSpeechRecognition();
  }

  ngOnInit(): void {
    // First check subscription access
    this.subscriptionGuard.checkPlatinumAccess().subscribe(status => {
      if (!status.hasAccess) {
        // User doesn't have PLATINUM access, redirect with message
        alert(`🤖 AI Tutoring - Premium Feature\n\n${status.message}\n\nRedirecting to learning modules...`);
        this.router.navigate(['/learning-modules']);
        return;
      }
      
      // User has access, proceed with initialization
      this.initializeComponent();
    });
  }

  private initializeComponent(): void {
    // Get module ID from route
    this.route.queryParams.subscribe(params => {
      this.moduleId = params['moduleId'];
      this.sessionType = params['sessionType'] || 'practice';
      
      console.log('🚀 AI Tutor Chat initialized:', { moduleId: this.moduleId, sessionType: this.sessionType });
      
      if (this.moduleId) {
        this.loadModule();
        this.startNewSession();
      } else {
        this.router.navigate(['/student-dashboard']);
      }
    });
    
    // Subscribe to messages with enhanced handling and automatic refresh
    const messagesSub = this.aiTutorService.messages$.subscribe(messages => {
      console.log('📨 Messages updated from service:', messages.length, messages);
      
      // Update both local and component messages
      this.localMessages = [...messages];
      this.messages = [...messages];
      
      console.log('📊 Local messages count:', this.localMessages.length);
      console.log('📊 Component messages count:', this.messages.length);
      
      // Force change detection to ensure UI updates
      this.cdr.detectChanges();
      
      // Scroll to bottom after change detection
      setTimeout(() => {
        this.scrollToBottom();
        
        // Double-check message sync and force update if needed
        if (this.messages.length !== messages.length) {
          console.log('🔄 Forcing message sync...');
          this.messages = [...messages];
          this.cdr.detectChanges();
        }
      }, 50);
    });
    
    this.subscriptions.push(messagesSub);
    
    // Start auto-refresh mechanism for real-time updates
    this.startAutoRefresh();
  }

  private startAutoRefresh(): void {
    // Auto-refresh messages every 2 seconds to ensure real-time updates
    this.autoRefreshInterval = setInterval(() => {
      if (this.sessionActive) {
        this.autoRefreshMessages();
      }
    }, 2000);
  }

  private autoRefreshMessages(): void {
    const serviceMessages = this.aiTutorService.getCurrentMessages();
    
    // Only update if there are new messages
    if (serviceMessages.length > this.messages.length) {
      console.log('🔄 Auto-refreshing messages:', serviceMessages.length, 'vs current:', this.messages.length);
      
      this.localMessages = [...serviceMessages];
      this.messages = [...serviceMessages];
      
      // Force UI update
      this.cdr.detectChanges();
      
      // Scroll to bottom
      setTimeout(() => this.scrollToBottom(), 50);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Clear auto-refresh interval
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
    
    // End session if still active
    if (this.sessionActive && this.sessionId) {
      this.endSession(false);
    }
  }

  loadModule(): void {
    this.isLoading = true;
    this.learningModulesService.getModule(this.moduleId).subscribe({
      next: (module) => {
        this.module = module;
        this.isLoading = false;
        
        // Update speech recognition language based on module
        this.updateSpeechRecognitionLanguage();
      },
      error: (error) => {
        console.error('Error loading module:', error);
        this.isLoading = false;
        alert('Failed to load module');
        this.router.navigate(['/student-dashboard']);
      }
    });
  }

  // Update speech recognition language based on module
  updateSpeechRecognitionLanguage(): void {
    if (this.speechRecognition && this.module) {
      if (this.module.targetLanguage === 'English') {
        this.speechRecognition.lang = 'en-US';
        console.log('🎤 Speech recognition set to English (en-US)');
      } else if (this.module.targetLanguage === 'German') {
        this.speechRecognition.lang = 'de-DE';
        console.log('🎤 Speech recognition set to German (de-DE)');
      } else {
        // Default to English
        this.speechRecognition.lang = 'en-US';
        console.log('🎤 Speech recognition set to English (default)');
      }
    }
  }

  startNewSession(): void {
    this.isLoading = true;
    
    // Clear previous session data
    this.aiTutorService.clearCurrentSession();
    this.localMessages = [];
    this.messages = [];
    this.sessionActive = false;
    this.sessionId = '';
    
    console.log('🔄 Starting new session, cleared previous messages');
    console.log('📊 Messages after clear - Local:', this.localMessages.length, 'Component:', this.messages.length);
    
    this.aiTutorService.startSession(this.moduleId, this.sessionType).subscribe({
      next: (response) => {
        this.sessionId = response.sessionId;
        this.sessionActive = true;
        this.suggestions = response.suggestions || [];
        
        console.log('✅ New session started:', this.sessionId);
        
        // Add welcome message
        if (response.welcomeMessage) {
          console.log('➕ Adding welcome message:', response.welcomeMessage);
          
          // Add to local storage first
          this.localMessages.push(response.welcomeMessage);
          this.messages = [...this.localMessages];
          
          // Then add to service
          this.aiTutorService.addMessageToCurrentSession(response.welcomeMessage);
          
          console.log('📊 Messages after welcome - Local:', this.localMessages.length, 'Component:', this.messages.length);
          
          // Extract role-play details if available
          if (response.welcomeMessage.metadata?.rolePlayDetails) {
            this.rolePlayDetails = response.welcomeMessage.metadata.rolePlayDetails;
          }
          
          // Speak the welcome message if voice is enabled
          if (this.voiceEnabled && response.welcomeMessage.content) {
            setTimeout(() => {
              this.speakText(response.welcomeMessage.content);
            }, 1000); // Longer delay for welcome message
          }
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error starting session:', error);
        this.isLoading = false;
        alert('Failed to start tutoring session');
      }
    });
  }

  sendMessage(fromSpeech: boolean = false): void {
    if (!this.currentMessage.trim() || this.isSending || !this.sessionActive) {
      console.log('❌ Cannot send message:', { 
        hasMessage: !!this.currentMessage.trim(), 
        isSending: this.isSending, 
        sessionActive: this.sessionActive 
      });
      return;
    }
    
    const messageContent = this.currentMessage.trim();
    this.currentMessage = '';
    
    console.log('📤 Sending message:', messageContent, 'from:', fromSpeech ? 'speech' : 'text');
    
    // Check for stop commands - end session immediately without AI response
    const stopCommands = ['stop', 'end', 'finish', 'quit', 'exit'];
    const isStopCommand = stopCommands.some(cmd => 
      messageContent.toLowerCase().includes(cmd.toLowerCase())
    );
    
    if (isStopCommand) {
      // Add student message to UI with speech indicator
      const studentMessage: TutorMessage = {
        role: 'student',
        content: messageContent,
        messageType: 'text',
        timestamp: new Date(),
        metadata: fromSpeech ? { inputMethod: 'speech' } : { inputMethod: 'text' }
      };
      this.aiTutorService.addMessageToCurrentSession(studentMessage);
      
      // End session immediately without AI response
      this.endSessionSilently();
      return;
    }
    
    this.isSending = true;
    
    // Add student message to UI immediately with input method indicator
    const studentMessage: TutorMessage = {
      role: 'student',
      content: messageContent,
      messageType: 'text',
      timestamp: new Date(),
      metadata: fromSpeech ? { inputMethod: 'speech' } : { inputMethod: 'text' }
    };
    
    console.log('➕ Adding student message to session:', studentMessage);
    
    // Add to local storage first
    this.localMessages.push(studentMessage);
    this.messages = [...this.localMessages];
    
    // Force immediate UI update
    this.cdr.detectChanges();
    
    // Then add to service
    this.aiTutorService.addMessageToCurrentSession(studentMessage);
    
    // Scroll to show new message
    setTimeout(() => this.scrollToBottom(), 50);
    
    // Log the conversation for debugging
    console.log(`💬 ${fromSpeech ? '[SPEECH]' : '[TEXT]'} Student:`, messageContent);
    console.log('📊 Current messages count - Local:', this.localMessages.length, 'Component:', this.messages.length);
    
    // Send to backend
    this.aiTutorService.sendMessage(this.sessionId, messageContent).subscribe({
      next: (response) => {
        console.log('📥 Received response from backend:', response);
        
        // Add tutor response
        if (response.response) {
          console.log('➕ Adding AI response to session:', response.response);
          
          // Add to local storage first
          this.localMessages.push(response.response);
          this.messages = [...this.localMessages];
          
          // Force immediate UI update
          this.cdr.detectChanges();
          
          // Then add to service
          this.aiTutorService.addMessageToCurrentSession(response.response);
          
          // Scroll to show new message
          setTimeout(() => this.scrollToBottom(), 50);
          
          // Log AI response for debugging
          console.log('🤖 AI Response:', response.response.content);
          console.log('📊 Messages count after AI response - Local:', this.localMessages.length, 'Component:', this.messages.length);
          
          // Check if role-play session is complete
          if (response.response.metadata?.sessionState === 'completed' || 
              response.response.metadata?.sessionEnded === true) {
            // Session completed - show completion message
            setTimeout(() => {
              const confirmEnd = confirm('Role-play session completed! Would you like to end the session now?');
              if (confirmEnd) {
                this.endSession(true);
              }
            }, 2000); // Give time to read the completion message
          }
          
          // Speak the AI response if voice is enabled
          if (this.voiceEnabled && response.response.content) {
            setTimeout(() => {
              this.speakText(response.response.content);
            }, 500); // Small delay to ensure message is displayed first
          }
        }
        
        // Update suggestions
        this.suggestions = response.suggestions || [];
        
        // Update stats
        if (response.sessionStats) {
          this.sessionStats = response.sessionStats;
        }
        
        // Check if response contains an exercise
        if (response.response.messageType === 'exercise' && response.response.metadata) {
          this.currentExercise = response.response.metadata;
        } else {
          this.currentExercise = null;
        }
        
        this.isSending = false;
        
        // Force immediate refresh to ensure all messages are visible
        setTimeout(() => {
          this.autoRefreshMessages();
        }, 100);
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.isSending = false;
        
        // Still try to refresh in case of partial success
        setTimeout(() => {
          this.autoRefreshMessages();
        }, 100);
        
        alert('Failed to send message');
      }
    });
  }

  submitExerciseAnswer(): void {
    if (!this.exerciseAnswer.trim() || this.isSending || !this.currentExercise) {
      return;
    }
    
    const answer = this.exerciseAnswer.trim();
    this.exerciseAnswer = '';
    this.isSending = true;
    
    // Add student answer to UI
    const studentMessage: TutorMessage = {
      role: 'student',
      content: answer,
      messageType: 'text',
      timestamp: new Date(),
      metadata: { studentAnswer: answer }
    };
    this.aiTutorService.addMessageToCurrentSession(studentMessage);
    
    // Send exercise answer
    this.aiTutorService.sendMessage(
      this.sessionId,
      answer,
      'exercise_answer',
      answer
    ).subscribe({
      next: (response) => {
        // Add feedback
        if (response.response) {
          this.aiTutorService.addMessageToCurrentSession(response.response);
          
          // Speak the feedback if voice is enabled
          if (this.voiceEnabled && response.response.content) {
            setTimeout(() => {
              this.speakText(response.response.content);
            }, 500);
          }
        }
        
        // Update stats
        if (response.sessionStats) {
          this.sessionStats = response.sessionStats;
        }
        
        // Clear current exercise
        this.currentExercise = null;
        this.suggestions = response.suggestions || [];
        
        this.isSending = false;
      },
      error: (error) => {
        console.error('Error submitting answer:', error);
        this.isSending = false;
        alert('Failed to submit answer');
      }
    });
  }

  useSuggestion(suggestion: string): void {
    // Since we don't have a text input anymore, directly send the suggestion as a message
    if (!this.sessionActive || this.isSending || this.isProcessingSpeech) {
      return;
    }
    
    console.log('📤 Sending suggestion as message:', suggestion);
    
    // Set the suggestion as current message and send it
    this.currentMessage = suggestion;
    this.sendMessage(false); // false indicates it's not from speech
  }

  endSession(navigate: boolean = true): void {
    if (!this.sessionId) return;
    
    this.isLoading = true;
    this.aiTutorService.endSession(this.sessionId).subscribe({
      next: (response) => {
        this.sessionActive = false;
        this.aiTutorService.clearCurrentSession();
        this.isLoading = false;
        
        if (navigate) {
          // Show session summary with improved scoring
          const totalEngagement = this.getTotalEngagementScore();
          const conversationScore = this.getConversationScore();
          const exerciseScore = response.sessionSummary.sessionScore || 0;
          
          alert(`Session completed! 🎉\n\n` +
                `Duration: ${response.sessionSummary.duration} minutes\n` +
                `Total Engagement: ${totalEngagement} points\n` +
                `• Conversation: ${conversationScore} points\n` +
                `• Exercises: ${exerciseScore} points\n` +
                `Messages: ${this.getStudentMessageCount()} (${this.getSpeechMessageCount()} spoken)\n` +
                `${response.sessionSummary.correctAnswers > 0 ? `Accuracy: ${this.getScorePercentage()}%` : 'Great conversation practice!'}`);
          
          // Navigate back to learning modules list
          this.router.navigate(['/learning-modules']);
        }
      },
      error: (error) => {
        console.error('Error ending session:', error);
        this.isLoading = false;
      }
    });
  }

  // End session silently when user says "stop" - no AI response
  endSessionSilently(): void {
    if (!this.sessionId) return;
    
    // Stop any ongoing speech immediately
    this.speechSynthesis.cancel();
    this.isSpeaking = false;
    
    // Stop listening
    if (this.isListening) {
      this.stopListening();
    }
    
    this.isLoading = true;
    this.aiTutorService.endSession(this.sessionId).subscribe({
      next: (response) => {
        this.sessionActive = false;
        this.aiTutorService.clearCurrentSession();
        this.isLoading = false;
        
        // Calculate session duration and scores
        const duration = response.sessionSummary?.duration || 0;
        const totalMessages = this.sessionStats.totalMessages || 0;
        const exerciseScore = this.sessionStats.sessionScore || 0;
        const conversationScore = this.getConversationScore();
        const totalEngagement = conversationScore + exerciseScore;
        
        // Show silent completion message (no AI speech)
        const completionMessage: TutorMessage = {
          role: 'tutor',
          content: `Session ended by your request. 🎯

📊 Session Summary:
• Duration: ${duration} minutes
• Total Engagement: ${totalEngagement} points
• Messages exchanged: ${totalMessages}
• Conversation score: ${conversationScore} points
• Exercise score: ${exerciseScore} points
• Practice completed successfully!

Thank you for practicing! You can start a new session anytime.`,
          messageType: 'text',
          timestamp: new Date()
        };
        
        this.aiTutorService.addMessageToCurrentSession(completionMessage);
        
        // Show navigation options after a brief delay
        setTimeout(() => {
          const continueChoice = confirm('Would you like to try another session or return to learning modules?');
          if (continueChoice) {
            // Stay on current page for another session
            this.router.navigate(['/learning-modules']);
          } else {
            // Go back to modules
            this.router.navigate(['/learning-modules']);
          }
        }, 2000);
      },
      error: (error) => {
        console.error('Error ending session:', error);
        this.isLoading = false;
        // Still end the session locally
        this.sessionActive = false;
        this.aiTutorService.clearCurrentSession();
      }
    });
  }

  getMessageClass(message: TutorMessage): string {
    return message.role === 'student' ? 'message-student' : 'message-tutor';
  }

  getMessageTypeIcon(messageType: string): string {
    switch (messageType) {
      case 'role-play-intro': return '🎭';
      case 'role-play-active': return '🎪';
      case 'role-play-complete': return '🎉';
      case 'exercise': return '📝';
      case 'feedback': return '💬';
      case 'hint': return '💡';
      case 'correction': return '✏️';
      case 'encouragement': return '🌟';
      default: return '';
    }
  }

  formatTimestamp(timestamp: Date): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  refreshMessages(): void {
    console.log('🔄 Manually refreshing messages...');
    
    // Get messages from service
    const serviceMessages = this.aiTutorService.getCurrentMessages();
    console.log('📊 Service messages:', serviceMessages.length, serviceMessages);
    
    // Get local messages
    console.log('📊 Local messages:', this.localMessages.length, this.localMessages);
    
    // Use the longer array (more complete data)
    const messagesToUse = serviceMessages.length >= this.localMessages.length ? serviceMessages : this.localMessages;
    
    // Update both local and component messages
    this.localMessages = [...messagesToUse];
    this.messages = [...messagesToUse];
    
    // Force change detection
    this.cdr.detectChanges();
    
    console.log('📊 After refresh - Local:', this.localMessages.length, 'Component:', this.messages.length);
    
    setTimeout(() => this.scrollToBottom(), 50);
  }

  getSessionTypeLabel(): string {
    const types = this.aiTutorService.getSessionTypes();
    const type = types.find(t => t.value === this.sessionType);
    return type ? type.label : 'Tutoring Session';
  }

  getScorePercentage(): number {
    const total = this.sessionStats.correctAnswers + this.sessionStats.incorrectAnswers;
    return this.aiTutorService.calculateScorePercentage(
      this.sessionStats.correctAnswers,
      total
    );
  }

  // Calculate conversation participation score
  getConversationScore(): number {
    const studentMessages = this.getStudentMessageCount();
    const speechMessages = this.getSpeechMessageCount();
    
    // Base points for participation: 2 points per message, 3 points for speech
    const conversationPoints = (studentMessages * 2) + (speechMessages * 1); // Extra point for speech
    return conversationPoints;
  }

  // Get total engagement score
  getTotalEngagementScore(): number {
    const exerciseScore = this.sessionStats.sessionScore || 0;
    const conversationScore = this.getConversationScore();
    return exerciseScore + conversationScore;
  }

  // Helper method for template to convert index to letter (A, B, C, etc.)
  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  // Check if current module is a role-play module
  isRolePlayModule(): boolean {
    return this.module?.content?.rolePlayScenario ? true : false;
  }

  // Get role-play information for display
  getRolePlayInfo(): any {
    if (!this.isRolePlayModule()) return null;
    return {
      situation: this.module.content.rolePlayScenario.situation,
      studentRole: this.module.content.rolePlayScenario.studentRole,
      aiRole: this.module.content.rolePlayScenario.aiRole,
      objective: this.module.content.rolePlayScenario.objective
    };
  }

  // Speech Recognition Methods
  initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.speechRecognition = new SpeechRecognition();
      
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = false;
      
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
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        console.log('🎤 Speech captured:', transcript, 'Confidence:', confidence);
        
        // Set the transcript in the currentMessage for processing
        this.currentMessage = transcript;
        this.isListening = false;
        this.isProcessingSpeech = true;
        
        // Show what was captured briefly before sending
        console.log('🎤 You said:', transcript);
        
        // Automatically send the captured speech with speech indicator
        if (transcript.trim()) {
          setTimeout(() => {
            // Mark this message as coming from speech recognition
            this.sendMessage(true); // Pass true to indicate speech input
            this.isProcessingSpeech = false;
            // Clear the message since we don't have a visible input field
            this.currentMessage = '';
          }, 800); // Slightly longer delay so user can see what was captured
        } else {
          this.isProcessingSpeech = false;
          this.currentMessage = '';
        }
      };
      
      this.speechRecognition.onerror = (event: any) => {
        console.error('🎤 Speech recognition error:', event.error);
        this.isListening = false;
        
        // Provide user feedback for common errors
        let errorMessage = '';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking again.';
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
        this.isListening = false;
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
      this.voiceEnabled = false;
    }
  }

  // Start listening for speech input
  startListening(): void {
    if (this.speechRecognition && !this.isListening) {
      this.speechRecognition.start();
    }
  }

  // Stop listening
  stopListening(): void {
    if (this.speechRecognition && this.isListening) {
      this.speechRecognition.stop();
    }
  }

  // Text-to-Speech: Speak the AI tutor's response
  speakText(text: string): void {
    if (!this.voiceEnabled || this.isSpeaking) return;
    
    // Stop any current speech
    this.speechSynthesis.cancel();
    
    // Clean up markdown formatting and emojis for better speech
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold** formatting
      .replace(/\*(.*?)\*/g, '$1')     // Remove *italic* formatting
      .replace(/🎭|📝|💬|💡|✏️|🌟|🎪|🎉/g, '') // Remove emojis
      .replace(/\n\n/g, '. ')          // Replace double newlines with periods
      .replace(/\n/g, ' ')             // Replace single newlines with spaces
      .trim();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Debug: Log module language info
    console.log('🔊 TTS Debug:', {
      moduleTitle: this.module?.title,
      targetLanguage: this.module?.targetLanguage,
      nativeLanguage: this.module?.nativeLanguage
    });
    
    // Configure voice based on target language
    const voices = this.speechSynthesis.getVoices();
    let targetVoice;
    let selectedLang = 'en-US'; // Default to English
    
    if (this.module?.targetLanguage === 'English') {
      targetVoice = voices.find(voice => 
        voice.lang.startsWith('en') || voice.name.toLowerCase().includes('english')
      );
      utterance.lang = 'en-US';
      selectedLang = 'en-US';
      console.log('🔊 Using English TTS for English module');
    } else if (this.module?.targetLanguage === 'German') {
      targetVoice = voices.find(voice => 
        voice.lang.startsWith('de') || voice.name.toLowerCase().includes('german')
      );
      utterance.lang = 'de-DE';
      selectedLang = 'de-DE';
      console.log('🔊 Using German TTS for German module');
    } else {
      // Fallback: Use English as default
      targetVoice = voices.find(voice => 
        voice.lang.startsWith('en') || voice.name.toLowerCase().includes('english')
      );
      utterance.lang = 'en-US';
      selectedLang = 'en-US';
      console.log('🔊 Using English TTS as fallback (unknown target language)');
    }
    
    console.log('🔊 Selected voice:', targetVoice?.name || 'Default', 'Language:', selectedLang);
    
    if (targetVoice) {
      utterance.voice = targetVoice;
    }
    
    utterance.rate = 0.8; // Slightly slower for learning
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => {
      this.isSpeaking = true;
    };
    
    utterance.onend = () => {
      this.isSpeaking = false;
      
      // Auto-enable microphone after AI finishes speaking (for role-play intro)
      if (this.isRolePlayModule() && this.voiceEnabled && !this.isListening) {
        // Small delay to ensure speech has fully ended
        setTimeout(() => {
          this.startListening();
        }, 500);
      }
    };
    
    utterance.onerror = () => {
      this.isSpeaking = false;
    };
    
    this.speechSynthesis.speak(utterance);
  }

  // Stop current speech
  stopSpeaking(): void {
    this.speechSynthesis.cancel();
    this.isSpeaking = false;
  }

  // Toggle voice functionality
  toggleVoice(): void {
    this.voiceEnabled = !this.voiceEnabled;
    if (!this.voiceEnabled) {
      this.stopSpeaking();
      this.stopListening();
    }
  }

  // Get conversation statistics
  getStudentMessageCount(): number {
    return this.messages.filter(m => m.role === 'student').length;
  }

  getAIMessageCount(): number {
    return this.messages.filter(m => m.role === 'tutor').length;
  }

  getSpeechMessageCount(): number {
    return this.messages.filter(m => 
      m.role === 'student' && m.metadata?.inputMethod === 'speech'
    ).length;
  }

  getTypedMessageCount(): number {
    return this.messages.filter(m => 
      m.role === 'student' && m.metadata?.inputMethod === 'text'
    ).length;
  }
}