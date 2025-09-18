import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
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
    this.authService.getUserProfile().subscribe({
      next: (response: any) => {
        this.userProfile = response.user || response; // adapt to API
      },
      error: (error: any) => {
        console.error('Error loading profile:', error);
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
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

    this.authService.uploadProfilePhoto(this.selectedFile).subscribe({
      next: (res: any) => {
        this.uploading = false;
        alert('Profile photo uploaded successfully!');

        if (res.profilePhoto) {
          if (res.profilePhoto.startsWith('/uploads')) {
            this.userProfile.profilePhoto = `http://localhost:4000${res.profilePhoto}`;
          } else {
            this.userProfile.profilePhoto = res.profilePhoto;
          }
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
