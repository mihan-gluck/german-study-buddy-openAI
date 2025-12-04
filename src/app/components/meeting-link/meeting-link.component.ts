import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MeetingLinkService } from '../../services/meetingLink.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-meeting-link',
  standalone: true,
  templateUrl: './meeting-link.component.html',
  styleUrls: ['./meeting-link.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule
  ]
})
export class MeetingLinkComponent implements OnInit {
  meetingLinkForm!: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  subscriptionPlan: string = '';
  editId: string | null = null; // store ID for editing

  constructor(
    private fb: FormBuilder,
    private meetingLinkService: MeetingLinkService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    // ✅ Detect route parameter for edit mode
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.editId = id;
        this.loadMeetingLink(id);
      }
    });
  }

  private initializeForm(): void {
    this.meetingLinkForm = this.fb.group({
      batch: ['', [Validators.required]],
      subscriptionPlan: ['', [Validators.required]],
      platform: ['', [Validators.required]],
      link: ['', [Validators.required, Validators.minLength(5)]]
    });
  }


  // ✅ Load existing link for editing
  private loadMeetingLink(id: string): void {
    this.meetingLinkService.getLinkById(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          const data = res.data;
          this.meetingLinkForm.patchValue({
            batch: data.batch,
            subscriptionPlan: data.subscriptionPlan,
            platform: data.platform,
            link: data.link
          });
        } else {
          this.errorMessage = res.message || 'Failed to load meeting link.';
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load meeting link.';
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.meetingLinkForm.invalid) return;

    const payload = {
      ...this.meetingLinkForm.value,
    };

    if (this.editId) {
      // ✅ Update existing link
      this.meetingLinkService.updateLink(this.editId, payload).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.successMessage = 'Meeting link updated successfully!';
            this.router.navigate(['/meeting-link-list']);
          } else {
            this.errorMessage = res.message || 'Failed to update link.';
          }
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Failed to update link.';
        }
      });
    } else {

      // ✅ Add new link
      this.meetingLinkService.saveLink(payload).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.successMessage = 'Meeting link added successfully!';
            this.meetingLinkForm.reset();
            this.submitted = false;
            this.router.navigate(['/meeting-link-list']);
          } else {
            this.errorMessage = res.message || 'Something went wrong.';
          }
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Failed to submit meeting link.';
        }
      });
    }
  }
}
