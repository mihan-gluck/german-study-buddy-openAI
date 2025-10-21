// src/app/components/login/login.component.ts

import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, HttpClientModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  regNo: string = '';
  password: string = '';
  errorMessage: string = '';   // <-- holds error messages
  loading: boolean = false;    // <-- for optional spinner

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.errorMessage = '';
    this.loading = true;

    const user = { regNo: this.regNo, password: this.password };

    this.authService.login(user).subscribe({
      next: (response) => {
        console.log('Full login response:', response);
        this.loading = false;

        const role = response.user?.role || response.role; 

        if (role === 'ADMIN') {
          this.router.navigate(['/admin-dashboard']);
        } else if (role === 'TEACHER') {
          this.router.navigate(['/teacher-dashboard']);
        } else if (role === 'STUDENT') {
          this.router.navigate(['/student-dashboard']);
        } else {
          this.errorMessage = 'Unknown user role.';
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Login failed', err);
        if (err.status === 401 || err.status === 400) {
          this.errorMessage = 'Invalid username or password!';
        } else {
          this.errorMessage = 'Server error. Please try again later.';
        }
      }
    });
  }
}
