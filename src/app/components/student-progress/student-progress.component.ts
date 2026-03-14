// src/app/components/student-progress/student-progress.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentProgressService } from '../../services/student-progress.service';

@Component({
  selector: 'app-student-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-progress.component.html',
  styleUrls: ['./student-progress.component.css']
})
export class StudentProgressComponent implements OnInit {
  isLoading: boolean = true;
  studentLevel: string = '';
  levelProgression: any[] = [];

  constructor(private studentProgressService: StudentProgressService) {}

  ngOnInit(): void {
    this.loadStudentLevelProgression();
  }

  loadStudentLevelProgression(): void {
    this.isLoading = true;
    this.studentProgressService.getStudentLevelProgression().subscribe({
      next: (data) => {
        this.studentLevel = data.currentLevel;
        this.levelProgression = data.levelProgression;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading level progression:', error);
        this.isLoading = false;
      }
    });
  }
}
