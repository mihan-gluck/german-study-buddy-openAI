//profile.component.ts

import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userProfile: any = null;            // Store user profile data including profile photo URL
  selectedFile: File | null = null;   // Store the selected file from input
  uploading: boolean = false;         // Upload in progress flag
  uploadError: string = '';           // Upload error message

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.authService.getUserProfile().subscribe(
      (response: any) => {
        this.userProfile = response.user || response; // Adapt to your API response shape
      },
      (error: any) => {
        console.error('Error loading profile:', error);
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    );
  }

  // Called when user selects a file
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadError = '';
    }
  }

  // Upload selected photo to backend
  uploadPhoto(event: Event) {
    event.preventDefault();

    if (!this.selectedFile) {
      this.uploadError = 'Please select a photo first.';
      return;
    }

    this.uploading = true;
    this.uploadError = '';

    const formData = new FormData();
    formData.append('profilePhoto', this.selectedFile);

    // Use AuthService method to get token or directly from localStorage
    const token = this.authService.getToken();

    this.http.post('http://localhost:4000/api/profile/upload-photo', formData, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token || ''}`
      })
    }).subscribe({
      next: (res: any) => {
        this.uploading = false;
        alert('Profile photo uploaded successfully!');
        if (res.profilePhoto) {
          this.userProfile.profilePhoto = res.profilePhoto;
        }
        this.selectedFile = null;
      },
      error: (err) => {
        this.uploading = false;
        console.error('Error uploading photo:', err);
        this.uploadError = 'Failed to upload photo. Please try again.';
      }
    });
  }
}
