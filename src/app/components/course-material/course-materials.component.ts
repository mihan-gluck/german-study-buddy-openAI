import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { CourseMaterialService, CourseMaterial } from '../../services/courseMaterial.service';
import { CoursesService } from '../../services/courses.service';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';


interface Course {
  _id: string;
  title: string;
}

@Component({
  selector: 'app-course-materials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-materials.component.html',
  styleUrls: ['./course-materials.component.css']
})
export class CourseMaterialsComponent implements OnInit {
  materials: (CourseMaterial & { courseTitle?: string })[] = [];
  loading = true;
  error = '';
    userRole: any;

  constructor(
    private materialService: CourseMaterialService,
    private coursesService: CoursesService,
    private authService: AuthService
  ) {}

    ngOnInit(): void {
        this.loadProfile();

        forkJoin({
            materialsResp: this.materialService.getAllMaterials(),
            courses: this.coursesService.getCourses()
        }).subscribe({
            next: ({ materialsResp, courses }) => {
            // ✅ Correctly get the data array
            const materialArray: CourseMaterial[] = (materialsResp as any).data;

           // Merge course title
            const mergedMaterialsMap: { [key: string]: CourseMaterial & { courseTitle?: string } } = {};

            materialArray.forEach(mat => {
            const courseId = typeof mat.course === 'string' ? mat.course : (mat.course && (mat.course as any)._id);
            const course = courses.find(c => c._id === courseId);
            const title = course ? course.title : 'Unknown Course';

            if (!mergedMaterialsMap[courseId]) {
                mergedMaterialsMap[courseId] = { ...mat, courseTitle: title };
            } else {
                // Append new files to existing card
                mergedMaterialsMap[courseId].materials.push(...mat.materials);
            }
    });

            // Filter out empty materials
            this.materials = Object.values(mergedMaterialsMap).filter(m => m.materials && m.materials.length > 0);

                this.loading = false;
            },
            error: (err) => {
                console.error('Error fetching materials or courses', err);
                this.error = 'Failed to load course materials.';
                this.loading = false;
            }
        });
    }

    loadProfile(): void {
        this.authService.getUserProfile().subscribe({
            next: (data) => {
                console.log('User profile', data);
                this.userRole = data.role;  // Assuming the role is part of the user profile
            },
            error: (err) => {
                console.error('Error fetching user profile', err);
            }
        });
    }

    // Delete a specific file from course materials
    deleteFile(materialId: string, fileId: string) {
        this.materialService.deleteMaterialFile(materialId, fileId).subscribe({
            next: () => {
            alert('File deleted successfully');
            // Remove it from the UI
            const material = this.materials.find(m => m._id === materialId);
            if (material) {
                material.materials = material.materials.filter(f => f._id !== fileId);
            }
            // Remove card if empty
                this.materials = this.materials.filter(m => m.materials.length > 0);
            },

            error: (err) => console.error('Error deleting file', err)
        });
    }
}
