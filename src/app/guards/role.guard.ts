// src/app/guards/role.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const token = this.authService.getToken();
    
    // Check if the token exists
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    try {
      // Decode the JWT token
      const decodedToken: any = jwtDecode(token);
      // Extract the role from the route data
      const expectedRole = route.data['role'];

      // Check if the decoded token role matches the expected role
      if (decodedToken.role !== expectedRole) {
        this.router.navigate(['/login']); // Redirect unauthorized users
        return false;
      }

      return true; // Allow access if the roles match
    } catch (error) {
      console.error('Invalid token:', error);
      this.router.navigate(['/login']);
      return false;
    }
  }
}
