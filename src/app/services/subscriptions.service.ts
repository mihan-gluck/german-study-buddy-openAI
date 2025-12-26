// src/app/services/subscriptions.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define a Subscription interface
interface Subscription {
  type: string;
  expiryDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionsService {
  private apiUrl = 'http://localhost:4000/api/subscriptions'; // Adjust this to match your backend API

  constructor(private http: HttpClient) {}

  // Fetch the current subscription
  getSubscription(): Observable<Subscription> {
    return this.http.get<Subscription>(this.apiUrl);
  }

  // Update subscription (for upgrading to premium)
  updateSubscription(subscription: Subscription): Observable<Subscription> {
    return this.http.put<Subscription>(this.apiUrl, subscription);
  }
}
