import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { CourseMaterialService, CourseMaterial } from '../../services/courseMaterial.service';
import { CoursesService } from '../../services/courses.service';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

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
    apiBaseUrl = environment.apiUrl; // https://gluckstudentsportal.com
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
                //console.error('Error fetching materials or courses', err);
                this.error = 'Failed to load course materials.';
                this.loading = false;
            }
        });
    }

    loadProfile(): void {
        this.authService.getUserProfile().subscribe({
            next: (data) => {
                //console.log('User profile', data);
                this.userRole = data.role;  // Assuming the role is part of the user profile
            },
            error: (err) => {
                //console.error('Error fetching user profile', err);
            }
        });
    }

    deleteFile(materialId: string, file: any) {
        if (!confirm('Are you sure you want to delete this file?')) return;
        //console.log('Attempting to delete file', materialId, file);

        // ✅ Find the correct material document that contains this file
        const targetMaterial = this.materials.find(m =>
            m.materials.some(f => f.fileName === file.fileName)
        );

        if (!targetMaterial || !targetMaterial._id) {
            //console.error('❌ Material not found or invalid ID for file', file.fileName);
            return;
        }

        // ✅ Use non-null assertion (!) to satisfy TypeScript
        const targetMaterialId = targetMaterial._id!;

        this.materialService.deleteMaterialFile(targetMaterialId, file.fileName).subscribe({
            next: (res) => {
            //console.log('✅ File deleted successfully:', file.fileName);
            alert('File deleted successfully');
            window.location.reload();

            // Remove the file from the UI
            targetMaterial.materials = targetMaterial.materials.filter(f => f.fileName !== file.fileName);

            // ✅ If no files left, remove the whole course material
            if (targetMaterial.materials.length === 0) {
                this.materialService.deleteMaterial(targetMaterialId).subscribe({
                next: () => {
                    alert('Course material removed since it had no files left.');
                    this.materials = this.materials.filter(m => m._id !== targetMaterialId);
                    window.location.reload();
                },
                error: (error: any) => console.error('❌ Error deleting empty course material', error)
                });
            }
            },
            error: (error) => console.error('❌ Error deleting file', error)
        });
    }
}
