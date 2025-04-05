// src/app/components/subscriptions/subscriptions.component.ts

import { Component, OnInit } from '@angular/core';
import { SubscriptionsService } from '../../services/subscriptions.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// Define a Subscription interface
interface Subscription {
  type: string;
  expiryDate: string;
}

@Component({
  selector: 'app-subscriptions',
  imports: [FormsModule, CommonModule, HttpClientModule],
  standalone: true,
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.css']
})

export class SubscriptionsComponent implements OnInit {
  // Initialize subscription with default values to avoid null
  subscription: Subscription = {
    type: 'free',   // Default type
    expiryDate: ''  // Default expiry date
  };
  currentSubscription: Subscription | null = null;

  constructor(private subscriptionsService: SubscriptionsService) {}

  ngOnInit(): void {
    this.loadSubscription();
  }

  // Fetch the current subscription
  loadSubscription(): void {
    this.subscriptionsService.getSubscription().subscribe(
      (data: Subscription) => {
        this.currentSubscription = data; // Set the current subscription
        // If you want, you can also update `subscription` with `currentSubscription` data:
        this.subscription = { ...data };
      },
      (error) => {
        console.error('Error fetching subscription', error);
      }
    );
  }

  // Upgrade to premium subscription
  upgradeToPremium(): void {
    const upgradedSubscription: Subscription = { type: 'premium', expiryDate: '' };
    this.subscriptionsService.updateSubscription(upgradedSubscription).subscribe(
      (response) => {
        console.log('Upgraded to premium successfully', response);
        this.loadSubscription(); // Reload subscription details
      },
      (error) => {
        console.error('Error upgrading to premium', error);
      }
    );
  }

  onSubmit(): void {
    if (this.subscription) {
      this.subscriptionsService.updateSubscription(this.subscription).subscribe(
        (response) => {
          console.log('Subscription updated successfully', response);
        },
        (error) => {
          console.error('Error updating subscription', error);
        }
      );
    }
  }
}