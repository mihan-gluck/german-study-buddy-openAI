//src/app/components/header/header.components.ts

import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(public authService: AuthService, private router: Router) {}

  // Method to handle logout
  logOut() {
    this.authService.logOut();
    this.router.navigate(['/home']);
  }

  // Check if the user is logged in (token exists)
  isLoggedIn(): boolean {
    return !!this.authService.getToken();
  }

  // Get current user role
  getUserRole(): string | null{
    return this.authService.getUserRole();
  }

  /* // Get the user role
  getUserRole(): string {
    return this.authService.getUserRole();
  } */

  // Navigation function
  navigateTo(path: string) {
    this.router.navigate([path]);
  }

}
