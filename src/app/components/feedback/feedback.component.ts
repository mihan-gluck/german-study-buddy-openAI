import { Component, OnInit } from '@angular/core';
import { FeedbackService } from '../../services/feedback.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-feedback-list',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class FeedbackListComponent implements OnInit {
  feedbackList: any[] = [];
  filteredFeedback: any[] = [];
  loading = false;
  errorMessage = '';
  viewMode: 'table' | 'cards' = 'table';
  selectedRating: string = '';
  averageRating: number = 0;

  constructor(private feedbackService: FeedbackService) {}

  ngOnInit(): void {
    this.loadFeedback();
  }

  loadFeedback(): void {
    this.fetchFeedback();
  }

  fetchFeedback(): void {
    this.loading = true;
    this.feedbackService.getAllFeedback().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.feedbackList = res.data;
          this.filteredFeedback = [...this.feedbackList];
          this.calculateAverageRating();
        } else {
          this.errorMessage = res.message || 'Failed to load feedback';
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load feedback';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredFeedback = this.feedbackList.filter(feedback => {
      if (this.selectedRating && feedback.rating.toString() !== this.selectedRating) {
        return false;
      }
      return true;
    });
  }

  calculateAverageRating(): void {
    if (this.feedbackList.length === 0) {
      this.averageRating = 0;
      return;
    }
    
    const totalRating = this.feedbackList.reduce((sum, feedback) => sum + feedback.rating, 0);
    this.averageRating = totalRating / this.feedbackList.length;
  }
}
