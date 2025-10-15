import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MeetingLinkService } from '../../services/meetingLink.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-meeting-link-list',
  templateUrl: './meeting-link-list.component.html',
  styleUrls: ['./meeting-link-list.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class MeetingLinkListComponent implements OnInit {
  meetingLinkList: any[] = [];
  loading = false;
  errorMessage = '';
  teacherId = ''; // ✅ store teacher ID from profile

  constructor(
    private meetingLinkService: MeetingLinkService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  // ✅ Load profile to get teacherId first
  loadProfile(): void {
    this.loading = true;
    this.authService.getUserProfile().subscribe({
      next: (profile: any) => {
        if (profile && profile._id) {
          this.teacherId = profile._id;
          this.fetchMeetingLinks();
        } else {
          this.errorMessage = 'Unable to load teacher profile.';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('❌ Error loading profile:', err);
        this.errorMessage = 'Failed to load teacher profile.';
        this.loading = false;
      }
    });
  }

  // ✅ Fetch meeting links using the teacherId from the profile
  fetchMeetingLinks(): void {
    if (!this.teacherId) {
      this.errorMessage = 'Teacher ID not found.';
      this.loading = false;
      return;
    }

    this.meetingLinkService.getLinksByTeacherId(this.teacherId).subscribe({
      next: (res: any) => {
        if (res && (res.success || Array.isArray(res))) {
          this.meetingLinkList = res.data || res;
        } else {
          this.errorMessage = res?.message || 'Failed to load meeting links.';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error fetching meeting links:', err);
        this.errorMessage = err.error?.message || 'Failed to load meeting links.';
        this.loading = false;
      }
    });
  }

  // ✅ Navigate to Update Page with selected link data
  onUpdate(linkId: string): void {
    this.router.navigate(['/meeting-link', linkId]);
  }
}
