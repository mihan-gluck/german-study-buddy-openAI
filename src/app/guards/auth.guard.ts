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
    return this.authService.getUserProfile().pipe(
      map(user => {
        // ✅ User exists → allow access
        return true;
      }),
      catchError(err => {
        // ❌ Not authenticated → redirect to login
        //console.error('AuthGuard: Not authenticated', err);
        return of(this.router.createUrlTree(['/login']));
      })
    );
  }
}
