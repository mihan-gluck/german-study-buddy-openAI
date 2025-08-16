//src/app/assign-elevenlabs-dialog.component.ts

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button'; 

@Component({
  selector: 'app-assign-elevenlabs-dialog',
  standalone: true,
  imports: [MatDialogModule, MatInputModule, MatButtonModule, FormsModule, CommonModule],
  template: `
    <h2 mat-dialog-title>Assign ElevenLabs Link</h2>
    <mat-dialog-content>
      <mat-form-field appearance="fill" class="w-100">
        <mat-label>ElevenLabs Link</mat-label>
        <input matInput [(ngModel)]="data.link">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-button color="primary" (click)="save()">Save</button>
    </mat-dialog-actions>
  `
})
export class AssignElevenlabsDialogComponent {
  constructor(public dialogRef: MatDialogRef<AssignElevenlabsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { link: string }) {}

  save() {
    this.dialogRef.close(this.data.link);
  }
}



