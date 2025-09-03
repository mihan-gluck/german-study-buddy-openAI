//src/app/component/signup/signup.component.ts

import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  name: string = '';
  regNo: string = '';
  email: string = '';
  password: string = '';
  role: string = 'student'; // default role
  batch: string = '';
  subscription: string = '';
  elevenLabsWidgetLink: string = '';
  elevenLabsApiKey: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    const user: any = {
      regNo: this.regNo,
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role,
    };

    if (this.role === 'student') {
      user.batch = this.batch;
      user.subscription = this.subscription;
      user.elevenLabsWidgetLink = this.elevenLabsWidgetLink;
      user.elevenLabsApiKey = this.elevenLabsApiKey;
    };

    this.authService.signup(user).subscribe(
      (response: any) => {
        alert(user.role + ' registered successfully');
        console.log('User registered', user);
        this.router.navigate(['/auth/login']);  // Redirect to login after signup
      },
      (error: any) => {
        console.error('Signup failed', error);
      }
    );
  }
  scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

scrollToBottom() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

}
