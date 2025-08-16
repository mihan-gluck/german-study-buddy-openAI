//student-card.component.ts

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';


@Component({
  selector: 'app-student-card',
  standalone: true,
  imports: [ CommonModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTableModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule,
   MatTableModule,
    MatPaginatorModule,
    MatSortModule,],
  templateUrl: './student-card.component.html',
  styleUrl: './student-card.component.css'
})
export class StudentCardComponent {
  @Input() student: any; // shape: { name, email, verageFluency, averageGrammar, progress, photo }

}
