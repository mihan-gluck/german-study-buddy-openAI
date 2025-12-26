// src/app/services/subscription-guard.service.ts
// Service to check user subscription levels and restrict access

import { Injectable } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import { AuthService } from './auth.service';

export interface SubscriptionStatus {
  hasAccess: boolean;
  currentSubscription: string | null;
  requiredSubscription: string;
  message: string;
  upgradeRequired: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionGuardService {
  
  constructor(private authService: AuthService) {}

  // Check if user has required subscription level
  checkSubscriptionAccess(requiredSubscription: 'SILVER' | 'PLATINUM'): Observable<SubscriptionStatus> {
    return this.authService.currentUser$.pipe(
      map(currentUser => {
        if (!currentUser) {
          return {
            hasAccess: false,
            currentSubscription: null,
            requiredSubscription,
            message: 'Please log in to access this feature.',
            upgradeRequired: false
          };
        }

        // Non-students (teachers, admins) have full access
        if (currentUser.role !== 'STUDENT') {
          return {
            hasAccess: true,
            currentSubscription: 'ADMIN',
            requiredSubscription,
            message: 'Full access granted.',
            upgradeRequired: false
          };
        }

        const userSubscription = currentUser.subscription;
        
        if (!userSubscription) {
          return {
            hasAccess: false,
            currentSubscription: null,
            requiredSubscription,
            message: 'No subscription found. Please upgrade your account to access AI tutoring.',
            upgradeRequired: true
          };
        }

        // Define subscription hierarchy
        const subscriptionLevels = {
          'SILVER': 1,
          'PLATINUM': 2
        };

        const userLevel = subscriptionLevels[userSubscription as keyof typeof subscriptionLevels] || 0;
        const requiredLevel = subscriptionLevels[requiredSubscription] || 0;

        const hasAccess = userLevel >= requiredLevel;

        return {
          hasAccess,
          currentSubscription: userSubscription,
          requiredSubscription,
          message: hasAccess 
            ? `Access granted with ${userSubscription} subscription.`
            : `This feature requires ${requiredSubscription} subscription. You currently have ${userSubscription}.`,
          upgradeRequired: !hasAccess
        };
      })
    );
  }

  // Specific method to check PLATINUM access (for AI bot)
  checkPlatinumAccess(): Observable<SubscriptionStatus> {
    return this.checkSubscriptionAccess('PLATINUM');
  }

  // Specific method to check SILVER access
  checkSilverAccess(): Observable<SubscriptionStatus> {
    return this.checkSubscriptionAccess('SILVER');
  }

  // Get user's current subscription level
  getCurrentSubscription(): string | null {
    // Use synchronous access to current user value
    const currentUser = (this.authService as any).currentUserSubject?.value;
    return currentUser?.subscription || null;
  }

  // Check if user is PLATINUM
  isPlatinum(): boolean {
    const subscription = this.getCurrentSubscription();
    return subscription === 'PLATINUM';
  }

  // Check if user is SILVER or higher
  isSilverOrHigher(): boolean {
    const subscription = this.getCurrentSubscription();
    return subscription === 'SILVER' || subscription === 'PLATINUM';
  }
}