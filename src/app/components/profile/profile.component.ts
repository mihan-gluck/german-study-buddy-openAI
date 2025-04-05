//profile.component.ts

import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,  // Set standalone to true
  imports: [CommonModule, HttpClientModule, RouterModule],  // Include necessary imports (HttpClientModule is needed for HTTP requests)
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit {
  userProfile: any = null; // Store user profile data

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.authService.getUserProfile().subscribe(
      (response: any) => {
        this.userProfile = response; // Assign the response to userProfile
      },
      (error: any) => {
        console.error('Error loading profile:', error);
      }
    );
  }
}


/* export class ProfileComponent implements OnInit {
  userProfile: any = null; // Declare the userProfile variable

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserProfile(); // Call the function to load user profile when the component initializes
  }

  loadUserProfile() {
    // Assuming that the AuthService has a method to get the profile data (e.g., getProfile)
    this.authService.getUserProfile().subscribe(
      (response: any) => {
        this.userProfile = response; // Assign the response to userProfile
      },
      (error: any) => {
        console.error('Error loading profile:', error);
      }
    );
  }
} */


/* export class ProfileComponent implements OnInit {
  userProfile: any;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.fetchUserProfile();
  }

  fetchUserProfile() {
    // Assuming there's a protected endpoint to fetch the user's profile details
    this.authService.fetchProtectedData('/api/user/profile').subscribe(
      (response: any) => {
        this.userProfile = response.user;
      },
      (error: any) => {
        console.error('Error fetching profile', error);
        // Handle errors (e.g., redirect to login if not authorized)
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    );
  }
} */

  /* ngOnInit() {
    // Fetch protected data (e.g., user profile)
    this.authService.fetchProtectedData('http://localhost:5000/api/user-profile').subscribe(
      (response) => {
        this.userProfile = response;  // Store the user profile data
      },
      (error) => {
        console.error('Error fetching profile data', error);
      }
    );
  }
}
 */