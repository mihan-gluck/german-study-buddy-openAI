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

  constructor(
    private meetingLinkService: MeetingLinkService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchMeetingLinks();
  }

  // ✅ Fetch meeting links using the teacherId from the profile
  fetchMeetingLinks(): void {
    this.loading = true;

    this.meetingLinkService.getAllLinks().subscribe({
      next: (res: any) => {
        if (res && (res.success || Array.isArray(res))) {
          this.meetingLinkList = res.data || res;
        } else {
          this.errorMessage = res?.message || 'Failed to load meeting links.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load meeting links.';
        this.loading = false;
      }
    });
  }

  // ✅ Navigate to Update Page with selected link data
  onUpdate(linkId: string): void {
    this.router.navigate(['/meeting-link', linkId]);
  }

  deleteLink(id: string): void {
    if (confirm('Are you sure you want to delete this link?')) {
      this.meetingLinkService.deleteLink(id).subscribe({
        next: (response) => {
          window.alert('Link deleted successfully!');
          window.location.reload();
        },
        error: (error) => {
          window.alert('Failed to delete link: ' + (error.error?.message || 'Please try again.'));
        }
      });
    }
  }
}
