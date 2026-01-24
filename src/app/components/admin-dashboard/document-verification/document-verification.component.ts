import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { StudentDocumentsService } from '../../../services/student-documents.service';
import { map, startWith } from 'rxjs/operators';

interface StudentDocument {
  _id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  documentType: string;
  documentName: string;
  fileName: string;
  fileSize: number;
  formattedFileSize?: string;
  documentTypeDisplay?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  uploadedAt: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  verificationNotes?: string;
}

interface DocumentStats {
  totalDocuments: number;
  pendingDocuments: number;
  verifiedDocuments: number;
  rejectedDocuments: number;
  totalStudents: number;
}

@Component({
  selector: 'app-document-verification',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatTabsModule,
    MatCheckboxModule,
    MatAutocompleteModule
  ],
  templateUrl: './document-verification.component.html',
  styleUrls: ['./document-verification.component.css']
})
export class DocumentVerificationComponent implements OnInit {
  documents: StudentDocument[] = [];
  filteredDocuments: StudentDocument[] = [];
  paginatedDocuments: StudentDocument[] = [];
  
  stats: DocumentStats = {
    totalDocuments: 0,
    pendingDocuments: 0,
    verifiedDocuments: 0,
    rejectedDocuments: 0,
    totalStudents: 0
  };
  
  // Filters
  selectedStatus: string = 'ALL';
  selectedDocumentType: string = 'ALL';
  searchQuery: string = '';
  
  // Pagination
  pageSize: number = 10;
  pageIndex: number = 0;
  totalDocuments: number = 0;
  
  // Loading states
  loading: boolean = false;
  
  // Document types
  documentTypes = [
    { value: 'CV', label: 'CV' },
    { value: 'O_LEVEL_CERTIFICATE', label: 'O Level Certificate' },
    { value: 'A_LEVEL_CERTIFICATE', label: 'A Level Certificate' },
    { value: 'BROWN_CERTIFICATE', label: 'Brown Certificate' },
    { value: 'DEGREE_DIPLOMA', label: 'Degree / Diploma' },
    { value: 'ACADEMIC_TRANSCRIPT', label: 'Academic Transcript' },
    { value: 'PASSPORT', label: 'Passport' },
    { value: 'EXPERIENCE_LETTER', label: 'Experience Letter' },
    { value: 'LANGUAGE_CERTIFICATE', label: 'Language Certificate' },
    { value: 'EXTRACURRICULAR_CERTIFICATE', label: 'Extra-curricular Certificate' },
    { value: 'AFFIDAVIT', label: 'Affidavit' },
    { value: 'POLICE_CLEARANCE', label: 'Police Clearance' }
  ];
  
  displayedColumns: string[] = [
    'select',
    'studentName',
    'documentType',
    'documentName',
    'fileSize',
    'uploadedAt',
    'status',
    'actions'
  ];
  
  selectedDocument: StudentDocument | null = null;
  verificationNotes: string = '';
  showVerificationDialog: boolean = false;
  verificationAction: 'VERIFIED' | 'REJECTED' | null = null;
  
  // Selection for bulk operations
  selectedDocuments: string[] = [];
  allSelected: boolean = false;
  
  // Bulk upload
  showBulkUploadDialog: boolean = false;
  bulkUploadForm = {
    studentEmail: '',
    documentType: '',
    files: [] as File[]
  };
  students: any[] = [];
  studentSearchControl = new FormControl('');
  filteredStudents: any[] = [];
  
  // Mark as verified without upload
  showMarkVerifiedDialog: boolean = false;
  markVerifiedForm = {
    studentEmail: '',
    documentType: '',
    documentName: '',
    verificationNotes: ''
  };
  markVerifiedStudentControl = new FormControl('');
  markVerifiedFilteredStudents: any[] = [];
  
  // Requirements Management
  requirements: any[] = [];
  showRequirementForm: boolean = false;
  editingRequirement: any = null;
  requirementForm = {
    type: '',
    label: '',
    description: '',
    required: false,
    category: 'OTHER',
    order: 0
  };
  categories = [
    { value: 'ACADEMIC', label: 'Academic' },
    { value: 'IDENTIFICATION', label: 'Identification' },
    { value: 'PROFESSIONAL', label: 'Professional' },
    { value: 'LEGAL', label: 'Legal' },
    { value: 'OTHER', label: 'Other' }
  ];

  constructor(
    private documentService: StudentDocumentsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDocuments(); // This will also call loadStats() after documents are loaded
    this.loadRequirements();
    
    // Setup autocomplete for bulk upload
    this.studentSearchControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterStudents(value || ''))
    ).subscribe(filtered => {
      this.filteredStudents = filtered;
    });
    
    // Setup autocomplete for mark verified
    this.markVerifiedStudentControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterStudents(value || ''))
    ).subscribe(filtered => {
      this.markVerifiedFilteredStudents = filtered;
    });
  }
  
  private _filterStudents(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.students.filter(student => 
      student.name.toLowerCase().includes(filterValue) ||
      student.email.toLowerCase().includes(filterValue) ||
      (student.regNo && student.regNo.toLowerCase().includes(filterValue))
    );
  }

  loadDocuments(): void {
    this.loading = true;
    this.documentService.getAllDocuments().subscribe({
      next: (response) => {
        if (response.success) {
          this.documents = response.documents;
          this.applyFilters();
          this.loadStats(); // Calculate stats AFTER documents are loaded
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading documents:', error);
        this.snackBar.open('Error loading documents', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    // Calculate stats from documents
    this.stats.totalDocuments = this.documents.length;
    this.stats.pendingDocuments = this.documents.filter(d => d.status === 'PENDING').length;
    this.stats.verifiedDocuments = this.documents.filter(d => d.status === 'VERIFIED').length;
    this.stats.rejectedDocuments = this.documents.filter(d => d.status === 'REJECTED').length;
    
    // Count unique students
    const uniqueStudents = new Set(this.documents.map(d => d.studentId));
    this.stats.totalStudents = uniqueStudents.size;
  }

  applyFilters(): void {
    let filtered = [...this.documents];
    
    // Status filter
    if (this.selectedStatus !== 'ALL') {
      filtered = filtered.filter(doc => doc.status === this.selectedStatus);
    }
    
    // Document type filter
    if (this.selectedDocumentType !== 'ALL') {
      filtered = filtered.filter(doc => doc.documentType === this.selectedDocumentType);
    }
    
    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.studentName.toLowerCase().includes(query) ||
        doc.studentEmail.toLowerCase().includes(query) ||
        doc.documentName.toLowerCase().includes(query)
      );
    }
    
    this.filteredDocuments = filtered;
    this.totalDocuments = filtered.length;
    this.pageIndex = 0;
    this.updatePaginatedDocuments();
  }

  updatePaginatedDocuments(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedDocuments = this.filteredDocuments.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePaginatedDocuments();
  }

  clearFilters(): void {
    this.selectedStatus = 'ALL';
    this.selectedDocumentType = 'ALL';
    this.searchQuery = '';
    this.applyFilters();
  }

  downloadDocument(doc: StudentDocument): void {
    this.documentService.downloadDocument(doc._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = doc.fileName;
        link.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Document downloaded', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error downloading document:', error);
        this.snackBar.open('Error downloading document', 'Close', { duration: 3000 });
      }
    });
  }

  openVerificationDialog(document: StudentDocument, action: 'VERIFIED' | 'REJECTED'): void {
    this.selectedDocument = document;
    this.verificationAction = action;
    this.verificationNotes = document.verificationNotes || '';
    this.showVerificationDialog = true;
  }

  closeVerificationDialog(): void {
    this.showVerificationDialog = false;
    this.selectedDocument = null;
    this.verificationAction = null;
    this.verificationNotes = '';
  }

  confirmVerification(): void {
    if (!this.selectedDocument || !this.verificationAction) return;
    
    const action = this.verificationAction; // Store in local variable to avoid null check issues
    
    this.documentService.verifyDocument(
      this.selectedDocument._id,
      action,
      this.verificationNotes
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open(
            `Document ${action.toLowerCase()} successfully`,
            'Close',
            { duration: 3000 }
          );
          this.closeVerificationDialog();
          this.loadDocuments();
          this.loadStats();
        }
      },
      error: (error) => {
        console.error('Error verifying document:', error);
        this.snackBar.open('Error updating document status', 'Close', { duration: 3000 });
      }
    });
  }

  unlockDocument(doc: StudentDocument): void {
    const confirmUnlock = confirm(
      `Unlock "${doc.documentName}" for ${doc.studentName}?\n\n` +
      `This will change the status to PENDING, allowing the student to delete and re-upload this document.`
    );
    
    if (!confirmUnlock) return;
    
    this.documentService.verifyDocument(
      doc._id,
      'REJECTED',
      'Document unlocked by admin for student to update. Please upload a new version if needed.'
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open(
            'Document unlocked successfully. Student can now update it.',
            'Close',
            { duration: 4000 }
          );
          this.loadDocuments();
        }
      },
      error: (error) => {
        console.error('Error unlocking document:', error);
        this.snackBar.open('Error unlocking document', 'Close', { duration: 3000 });
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'VERIFIED': return 'success';
      case 'REJECTED': return 'warn';
      case 'PENDING': return 'accent';
      default: return 'primary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'VERIFIED': return 'check_circle';
      case 'REJECTED': return 'cancel';
      case 'PENDING': return 'schedule';
      default: return 'help';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // ========== BULK OPERATIONS ==========
  
  toggleSelectAll(): void {
    this.allSelected = !this.allSelected;
    if (this.allSelected) {
      this.selectedDocuments = this.paginatedDocuments
        .filter(doc => doc.status === 'PENDING')
        .map(doc => doc._id);
    } else {
      this.selectedDocuments = [];
    }
  }
  
  toggleDocumentSelection(docId: string): void {
    const index = this.selectedDocuments.indexOf(docId);
    if (index > -1) {
      this.selectedDocuments.splice(index, 1);
    } else {
      this.selectedDocuments.push(docId);
    }
    this.updateAllSelectedState();
  }
  
  isDocumentSelected(docId: string): boolean {
    return this.selectedDocuments.includes(docId);
  }
  
  updateAllSelectedState(): void {
    const pendingDocs = this.paginatedDocuments.filter(doc => doc.status === 'PENDING');
    this.allSelected = pendingDocs.length > 0 && 
                       pendingDocs.every(doc => this.selectedDocuments.includes(doc._id));
  }
  
  bulkVerifySelected(): void {
    if (this.selectedDocuments.length === 0) return;
    
    const confirmVerify = confirm(
      `Verify ${this.selectedDocuments.length} selected documents?\n\nAll selected documents will be marked as VERIFIED.`
    );
    
    if (!confirmVerify) return;
    
    let completed = 0;
    let failed = 0;
    
    this.selectedDocuments.forEach(docId => {
      this.documentService.verifyDocument(docId, 'VERIFIED', 'Bulk verified by admin').subscribe({
        next: () => {
          completed++;
          if (completed + failed === this.selectedDocuments.length) {
            this.finishBulkVerification(completed, failed);
          }
        },
        error: () => {
          failed++;
          if (completed + failed === this.selectedDocuments.length) {
            this.finishBulkVerification(completed, failed);
          }
        }
      });
    });
  }
  
  finishBulkVerification(completed: number, failed: number): void {
    this.selectedDocuments = [];
    this.allSelected = false;
    this.loadDocuments();
    
    if (failed === 0) {
      this.snackBar.open(
        `Successfully verified ${completed} documents`,
        'Close',
        { duration: 4000 }
      );
    } else {
      this.snackBar.open(
        `Verified ${completed} documents, ${failed} failed`,
        'Close',
        { duration: 4000 }
      );
    }
  }
  
  openBulkUploadDialog(): void {
    this.loadStudents();
    this.studentSearchControl.setValue('');
    this.showBulkUploadDialog = true;
  }
  
  closeBulkUploadDialog(): void {
    this.showBulkUploadDialog = false;
    this.bulkUploadForm = {
      studentEmail: '',
      documentType: '',
      files: []
    };
    this.studentSearchControl.setValue('');
  }
  
  selectStudent(student: any): void {
    this.bulkUploadForm.studentEmail = student.email;
    this.studentSearchControl.setValue(student.name + ' (' + student.email + ')');
  }
  
  displayStudentFn(student: any): string {
    return student ? `${student.name} (${student.email})` : '';
  }
  
  loadStudents(): void {
    console.log('🔍 Loading students...');
    this.documentService.getAllStudents().subscribe({
      next: (response: any) => {
        console.log('✅ Students loaded:', response);
        if (response.success) {
          this.students = response.data || response.students || [];
          this.filteredStudents = this.students;
          this.markVerifiedFilteredStudents = this.students;
          console.log('📋 Total students:', this.students.length);
        } else {
          console.error('❌ Response not successful:', response);
        }
      },
      error: (error) => {
        console.error('❌ Error loading students:', error);
        this.snackBar.open('Error loading students list', 'Close', { duration: 3000 });
      }
    });
  }
  
  onBulkFilesSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.bulkUploadForm.files = files;
  }
  
  uploadBulkDocuments(): void {
    if (!this.bulkUploadForm.studentEmail || !this.bulkUploadForm.documentType || this.bulkUploadForm.files.length === 0) {
      this.snackBar.open('Please fill all fields and select files', 'Close', { duration: 3000 });
      return;
    }
    
    let completed = 0;
    let failed = 0;
    const total = this.bulkUploadForm.files.length;
    
    this.bulkUploadForm.files.forEach((file, index) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('studentEmail', this.bulkUploadForm.studentEmail);
      formData.append('documentType', this.bulkUploadForm.documentType);
      formData.append('documentName', file.name);
      formData.append('description', `Uploaded by admin on behalf of student`);
      
      this.documentService.adminUploadDocument(formData).subscribe({
        next: () => {
          completed++;
          if (completed + failed === total) {
            this.finishBulkUpload(completed, failed);
          }
        },
        error: (error) => {
          console.error('Error uploading file:', error);
          failed++;
          if (completed + failed === total) {
            this.finishBulkUpload(completed, failed);
          }
        }
      });
    });
  }
  
  finishBulkUpload(completed: number, failed: number): void {
    this.closeBulkUploadDialog();
    this.loadDocuments();
    
    if (failed === 0) {
      this.snackBar.open(
        `Successfully uploaded ${completed} documents`,
        'Close',
        { duration: 4000 }
      );
    } else {
      this.snackBar.open(
        `Uploaded ${completed} documents, ${failed} failed`,
        'Close',
        { duration: 4000 }
      );
    }
  }
  
  // ========== MARK AS VERIFIED WITHOUT UPLOAD ==========
  
  openMarkVerifiedDialog(): void {
    this.loadStudents();
    this.markVerifiedStudentControl.setValue('');
    this.showMarkVerifiedDialog = true;
  }
  
  closeMarkVerifiedDialog(): void {
    this.showMarkVerifiedDialog = false;
    this.markVerifiedForm = {
      studentEmail: '',
      documentType: '',
      documentName: '',
      verificationNotes: ''
    };
    this.markVerifiedStudentControl.setValue('');
  }
  
  selectMarkVerifiedStudent(student: any): void {
    this.markVerifiedForm.studentEmail = student.email;
    this.markVerifiedStudentControl.setValue(student.name + ' (' + student.email + ')');
  }
  
  markAsVerifiedWithoutUpload(): void {
    if (!this.markVerifiedForm.studentEmail || !this.markVerifiedForm.documentType || !this.markVerifiedForm.documentName) {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }
    
    this.documentService.markDocumentAsVerified(this.markVerifiedForm).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Document marked as verified successfully', 'Close', { duration: 4000 });
          this.closeMarkVerifiedDialog();
          this.loadDocuments();
        }
      },
      error: (error) => {
        console.error('Error marking document as verified:', error);
        this.snackBar.open(error.error?.message || 'Error marking document as verified', 'Close', { duration: 3000 });
      }
    });
  }
  
  // ========== REQUIREMENTS MANAGEMENT ==========
  
  loadRequirements(): void {
    this.documentService.getDocumentRequirements().subscribe({
      next: (response) => {
        if (response.success) {
          this.requirements = response.requirements;
        }
      },
      error: (error) => {
        console.error('Error loading requirements:', error);
      }
    });
  }
  
  openRequirementForm(requirement?: any): void {
    if (requirement) {
      this.editingRequirement = requirement;
      this.requirementForm = {
        type: requirement.type,
        label: requirement.label,
        description: requirement.description,
        required: requirement.required,
        category: requirement.category,
        order: requirement.order
      };
    } else {
      this.editingRequirement = null;
      this.requirementForm = {
        type: '',
        label: '',
        description: '',
        required: false,
        category: 'OTHER',
        order: this.requirements.length
      };
    }
    this.showRequirementForm = true;
  }
  
  closeRequirementForm(): void {
    this.showRequirementForm = false;
    this.editingRequirement = null;
  }
  
  saveRequirement(): void {
    if (!this.requirementForm.label || !this.requirementForm.description) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }
    
    if (this.editingRequirement) {
      // Update existing
      this.documentService.updateDocumentRequirement(
        this.editingRequirement._id,
        this.requirementForm
      ).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Requirement updated successfully', 'Close', { duration: 3000 });
            this.closeRequirementForm();
            this.loadRequirements();
          }
        },
        error: (error) => {
          console.error('Error updating requirement:', error);
          this.snackBar.open('Error updating requirement', 'Close', { duration: 3000 });
        }
      });
    } else {
      // Create new
      if (!this.requirementForm.type) {
        this.requirementForm.type = this.requirementForm.label.toUpperCase().replace(/\s+/g, '_');
      }
      
      this.documentService.createDocumentRequirement(this.requirementForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Requirement created successfully', 'Close', { duration: 3000 });
            this.closeRequirementForm();
            this.loadRequirements();
          }
        },
        error: (error) => {
          console.error('Error creating requirement:', error);
          this.snackBar.open(error.error?.message || 'Error creating requirement', 'Close', { duration: 3000 });
        }
      });
    }
  }
  
  deleteRequirement(requirement: any): void {
    const confirmDelete = confirm(
      `Delete "${requirement.label}"?\n\nThis will hide it from students but won't delete existing uploaded documents of this type.`
    );
    
    if (!confirmDelete) return;
    
    this.documentService.deleteDocumentRequirement(requirement._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Requirement deleted successfully', 'Close', { duration: 3000 });
          this.loadRequirements();
        }
      },
      error: (error) => {
        console.error('Error deleting requirement:', error);
        this.snackBar.open('Error deleting requirement', 'Close', { duration: 3000 });
      }
    });
  }
}
