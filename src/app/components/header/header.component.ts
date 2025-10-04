// src/app/components/header/header.component.ts

import { Component, OnInit } from '@angular/core';
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
export class HeaderComponent implements OnInit {
  isAuthenticated = false;
  userRole: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to user state
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.isAuthenticated = true;
        this.userRole = user.role?.toUpperCase();
      } else {
        this.isAuthenticated = false;
        this.userRole = null;
      }
    });

    // On app start, check if session exists
    this.authService.refreshUserProfile().subscribe();
  }

  // ✅ Logout: clears cookie in backend
  logOut(): void {
    this.authService.logout().subscribe(() => {
      this.isAuthenticated = false;
      this.userRole = null;
      this.router.navigate(['/home']);
    });
  }

  // ✅ For templates
  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  getUserRole(): string | null {
    return this.userRole;
  }

  // Navigation
  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  openInternalReports() {
    window.open('https://drive.google.com/drive/folders/1VmkwmDthwT0Lf5qeohlPQrLlfDOUIssg');
  }

  openStudentReports() {
    window.open('https://drive.google.com/drive/folders/1tHsTZ7zfARUaOzQYpyEu2WAMP5SuiyTA');
  }

  openStudentFeedback() {
    window.open('https://docs.google.com/spreadsheets/d/1Wb3xMBUJeATQxSaAUFdIIB-F2p2Rrlo1vII5iO2nVZg/edit?usp=sharing');
  }

}
