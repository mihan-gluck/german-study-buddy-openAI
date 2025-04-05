import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule } from '@angular/router'; // <-- Import RouterModule

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HomeComponent,
    RouterModule // <-- Add RouterModule here to make <router-outlet> work
  ]
})
export class HomeModule {}
