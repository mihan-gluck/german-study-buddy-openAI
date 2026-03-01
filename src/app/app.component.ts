import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";
import { CommonModule } from '@angular/common'; 
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'angular-germanbuddy';
  showHeader = true;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Hide header on Home or Login routes
      const isHomeOrLogin = event.urlAfterRedirects === '/home' || event.urlAfterRedirects === '/login';
      this.showHeader = !isHomeOrLogin;
      console.log('🔍 Current URL:', event.urlAfterRedirects);
      console.log('🔍 Show Header:', this.showHeader);
    });
  }

  ngOnInit() {
    // Only refresh profile if NOT on login/home page
    const currentUrl = this.router.url;
    if (currentUrl !== '/login' && currentUrl !== '/home' && currentUrl !== '/') {
      this.authService.refreshUserProfile().subscribe({
        next: (user) => {
          console.log('User authenticated on app load:', user);
        },
        error: (err) => {
          console.log('No active session on app load');
        }
      });
    }
  }
}
