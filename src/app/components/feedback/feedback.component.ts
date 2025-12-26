import { Component, OnInit } from '@angular/core';
import { FeedbackService } from '../../services/feedback.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-feedback-list',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class FeedbackListComponent implements OnInit {
  feedbackList: any[] = [];
  loading = false;
  errorMessage = '';

  constructor(private feedbackService: FeedbackService) {}

  ngOnInit(): void {
    this.fetchFeedback();
  }

  fetchFeedback(): void {
    this.loading = true;
    this.feedbackService.getAllFeedback().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.feedbackList = res.data;
        } else {
          this.errorMessage = res.message || 'Failed to load feedback';
        }
        this.loading = false;
      },
      error: (err) => {
        //console.error('Error fetching feedback:', err);
        this.errorMessage = 'Failed to load feedback';
        this.loading = false;
      }
    });
  }
}
