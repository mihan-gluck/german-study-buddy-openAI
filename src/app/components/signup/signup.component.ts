//src/app/component/signup/signup.component.ts

import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CoursesService } from '../../services/courses.service'

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  name: string = '';
  email: string = '';
  role: string = 'STUDENT'; // default role
  batch: string = '';
  medium: string = '';
  conversationId: string = '';
  subscription: string = '';
  level: string = 'A1'; // default level
  elevenLabsWidgetLink: string = '';
  elevenLabsApiKey: string = '';

   // Teacher fields
  assignedCourses: string[] = []; // selected course IDs
  courses: any[] = []; // list fetched from backend


  constructor(private authService: AuthService, private router: Router, private coursesService: CoursesService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses() {
    this.coursesService.getCourses().subscribe({
      next: (data) => this.courses = data,
      error: (err) => console.error('Failed to load courses', err)
    });
  }

  onSubmit() {

  if (this.role === 'STUDENT') {
    if (!this.medium || !this.subscription || !this.batch) {
      alert("Batch, Medium, and Subscription are required for students!");
      return;
    }
  }

  if (this.role === 'TEACHER') {
    if (!this.medium || this.assignedCourses.length === 0) {
      alert("Medium and at least one course are required for teachers!");
      return;
    }
  }


    const user: any = {
      name: this.name,
      email: this.email,
      role: this.role,
      
    };

    if (this.role === 'STUDENT') {
      user.batch = this.batch;
      user.medium = this.medium;
      user.conversationId = this.conversationId;
      user.subscription = this.subscription;
      user.level = this.level;
      user.elevenLabsWidgetLink = this.elevenLabsWidgetLink;
      user.elevenLabsApiKey = this.elevenLabsApiKey;
    };

    if (this.role === 'TEACHER') {
      user.medium = this.medium;
      user.assignedCourses = this.assignedCourses; // IDs from dropdown
    }

    console.log('Registering user:', user);
    this.authService.signup(user).subscribe(
      (response: any) => {
        alert(user.role + ' Registered Successfully');
        console.log('User registered', user);
        this.router.navigate(['/admin-dashboard']);  // Redirect to login after signup
      },
      (error: any) => {
        alert('Registration failed: ' + (error.error?.msg || 'Please try again later.'));
        console.error('Register failed', error);
      }
    );
  }
  scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

scrollToBottom() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

onCourseChange(event: any, courseId: string) {
  if (event.target.checked) {
    this.assignedCourses.push(courseId);
  } else {
    this.assignedCourses = this.assignedCourses.filter(id => id !== courseId);
  }
}

}
