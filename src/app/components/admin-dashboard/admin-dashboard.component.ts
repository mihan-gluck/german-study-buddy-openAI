//src/app/components/admin-dashboard/admin-dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [HttpClientModule, CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
assignCourse: any;
students: any;
selectedCourse: any;
vapiApiKey: any;
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/auth/login']);
      return;
    }

    try {
      const decodedToken: any = jwtDecode(token);
      if (decodedToken.role !== 'admin') {
        this.router.navigate(['/dashboard']); // Redirect non-admins
      }
    } catch (error) {
      console.error('Invalid token:', error);
      this.router.navigate(['/auth/login']);
    }
  }
}
