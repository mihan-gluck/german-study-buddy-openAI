import { Component } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";
import { CommonModule } from '@angular/common'; 
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-germanbuddy';
  showHeader = true;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Hide header on Home or Login routes
      this.showHeader = event.urlAfterRedirects !== '/home' && event.urlAfterRedirects !== '/login';
    });
  }
}
