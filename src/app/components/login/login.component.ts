// src/app/components/login/login.component.ts

import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
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
          this.authService.saveToken(response.token);

          console.log('This is admin token: ', response.token);
        } else if (response.user.role === 'teacher') {
          this.router.navigate(['/teacher-dashboard']);
          this.authService.saveToken(response.token);

        } else {
          this.router.navigate(['/student-dashboard']);
          console.log('This is student token: ', response.token);
          this.authService.saveToken(response.token);
        }
      },
      (error) => {
        console.error('Login failed', error);
        alert('Invalid email or password');
      }
    );
  }
}
