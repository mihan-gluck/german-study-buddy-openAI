// src/app/components/login/login.component.ts

import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    const user = { email: this.email, password: this.password };
    this.authService.login(user).subscribe(
      (response) => {
        // Save token using the AuthService method (already stored in localStorage)
        this.authService.saveToken(response.token);

        // Redirect the user based on their role after login
        if (response.user.role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else if (response.user.role === 'teacher') {
          this.router.navigate(['/teacher-dashboard']);
        } else {
          this.router.navigate(['/student-dashboard']);
        }
      },
      (error) => {
        console.error('Login failed', error);
        alert('Invalid email or password');
      }
    );
  }
}
