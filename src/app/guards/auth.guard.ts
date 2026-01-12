// src/app/guards/auth.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    console.log('🔐 AuthGuard: Checking authentication...');
    
    // First check if user is already logged in (from BehaviorSubject)
    if (this.authService.isLoggedIn()) {
      console.log('✅ AuthGuard: User already logged in');
      return of(true);
    }

    console.log('⏳ AuthGuard: Refreshing user profile...');
    // If not, try to refresh user profile from server
    return this.authService.refreshUserProfile().pipe(
      map(user => {
        // ✅ User exists → allow access
        console.log('✅ AuthGuard: User authenticated:', user?.email, user?.role);
        return true;
      }),
      catchError(err => {
        // ❌ Not authenticated → redirect to login
        console.error('❌ AuthGuard: Authentication failed:', err);
        return of(this.router.createUrlTree(['/login']));
      })
    );
  }
}
