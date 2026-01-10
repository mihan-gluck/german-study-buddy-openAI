// src/app/components/admin-dashboard/module-trash/module-trash.component.ts
// Module Trash Management Component

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModuleTrashService, TrashItem, TrashStats } from '../../../services/module-trash.service';

@Component({
  selector: 'app-module-trash',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './module-trash.component.html',
  styleUrls: ['./module-trash.component.css']
})
export class ModuleTrashComponent implements OnInit {
  trashItems: TrashItem[] = [];
  stats: TrashStats | null = null;
  isLoading = false;
  selectedItems: Set<string> = new Set();
  
  // Filters
  filterLevel = '';
  filterCategory = '';
  filterExpired = '';
  searchTerm = '';
  
  // Sorting
  sortBy = 'deletedAt';
  sortOrder: 'asc' | 'desc' = 'desc';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  
  constructor(private trashService: ModuleTrashService) {}

  ngOnInit(): void {
    this.loadTrashItems();
    this.loadStats();
  }

  loadTrashItems(): void {
    this.isLoading = true;
    this.trashService.getTrashItems().subscribe({
      next: (response) => {
        this.trashItems = response.trashItems;
        this.isLoading = false;
        console.log('📋 Loaded trash items:', this.trashItems.length);
      },
      error: (error) => {
        console.error('❌ Error loading trash items:', error);
        this.isLoading = false;
      }
    });
  }

  loadStats(): void {
    this.trashService.getTrashStats().subscribe({
      next: (response) => {
        this.stats = response.stats;
        console.log('📊 Loaded trash stats:', this.stats);
      },
      error: (error) => {
        console.error('❌ Error loading trash stats:', error);
      }
    });
  }

  // Filtering and sorting
  get filteredItems(): TrashItem[] {
    let filtered = [...this.trashItems];

    // Apply filters
    if (this.filterLevel) {
      filtered = filtered.filter(item => item.level === this.filterLevel);
    }
    
    if (this.filterCategory) {
      filtered = filtered.filter(item => item.category === this.filterCategory);
    }
    
    if (this.filterExpired === 'expired') {
      filtered = filtered.filter(item => item.isExpired);
    } else if (this.filterExpired === 'active') {
      filtered = filtered.filter(item => !item.isExpired);
    }
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.deletedBy.name.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (this.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'level':
          aValue = a.level;
          bValue = b.level;
          break;
        case 'deletedAt':
          aValue = new Date(a.deletedAt);
          bValue = new Date(b.deletedAt);
          break;
        case 'daysRemaining':
          aValue = a.daysRemaining;
          bValue = b.daysRemaining;
          break;
        case 'deletedBy':
          aValue = a.deletedBy.name.toLowerCase();
          bValue = b.deletedBy.name.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return this.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }

  // Pagination
  get paginatedItems(): TrashItem[] {
    const filtered = this.filteredItems;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredItems.length / this.itemsPerPage);
  }

  // Actions
  restoreItem(item: TrashItem): void {
    if (confirm(`Are you sure you want to restore "${item.title}"?`)) {
      this.trashService.restoreFromTrash(item._id).subscribe({
        next: (response) => {
          console.log('✅ Module restored:', response);
          this.loadTrashItems();
          this.loadStats();
        },
        error: (error) => {
          console.error('❌ Error restoring module:', error);
          alert('Failed to restore module');
        }
      });
    }
  }

  permanentlyDeleteItem(item: TrashItem): void {
    const confirmMessage = `⚠️ PERMANENT DELETION WARNING ⚠️

This will permanently delete "${item.title}" from the database.
This action CANNOT be undone!

Are you absolutely sure you want to proceed?`;

    if (confirm(confirmMessage)) {
      this.trashService.permanentlyDelete(item._id).subscribe({
        next: (response) => {
          console.log('✅ Module permanently deleted:', response);
          this.loadTrashItems();
          this.loadStats();
        },
        error: (error) => {
          console.error('❌ Error permanently deleting module:', error);
          alert('Failed to permanently delete module');
        }
      });
    }
  }

  emptyTrash(): void {
    const confirmMessage = `⚠️ EMPTY TRASH WARNING ⚠️

This will permanently delete ALL ${this.trashItems.length} modules in the trash.
This action CANNOT be undone!

Are you absolutely sure you want to empty the entire trash?`;

    if (confirm(confirmMessage)) {
      this.trashService.emptyTrash().subscribe({
        next: (response) => {
          console.log('✅ Trash emptied:', response);
          this.loadTrashItems();
          this.loadStats();
          alert(`Trash emptied successfully. ${response.deletedCount} modules permanently deleted.`);
        },
        error: (error) => {
          console.error('❌ Error emptying trash:', error);
          alert('Failed to empty trash');
        }
      });
    }
  }

  runCleanup(): void {
    if (confirm('Run cleanup job to permanently delete expired items?')) {
      this.trashService.runCleanup().subscribe({
        next: (response) => {
          console.log('✅ Cleanup completed:', response);
          this.loadTrashItems();
          this.loadStats();
          
          if (response.deletedCount > 0) {
            alert(`Cleanup completed. ${response.deletedCount} expired modules permanently deleted.`);
          } else {
            alert('Cleanup completed. No expired modules found.');
          }
        },
        error: (error) => {
          console.error('❌ Error running cleanup:', error);
          alert('Failed to run cleanup');
        }
      });
    }
  }

  // Selection management
  toggleSelection(itemId: string): void {
    if (this.selectedItems.has(itemId)) {
      this.selectedItems.delete(itemId);
    } else {
      this.selectedItems.add(itemId);
    }
  }

  selectAll(): void {
    this.paginatedItems.forEach(item => this.selectedItems.add(item._id));
  }

  deselectAll(): void {
    this.selectedItems.clear();
  }

  // Bulk actions
  bulkRestore(): void {
    if (this.selectedItems.size === 0) return;
    
    if (confirm(`Restore ${this.selectedItems.size} selected modules?`)) {
      const promises = Array.from(this.selectedItems).map(id => 
        this.trashService.restoreFromTrash(id).toPromise()
      );
      
      Promise.all(promises).then(() => {
        this.loadTrashItems();
        this.loadStats();
        this.selectedItems.clear();
      }).catch(error => {
        console.error('❌ Error in bulk restore:', error);
        alert('Some modules failed to restore');
      });
    }
  }

  bulkDelete(): void {
    if (this.selectedItems.size === 0) return;
    
    const confirmMessage = `⚠️ PERMANENT DELETION WARNING ⚠️

This will permanently delete ${this.selectedItems.size} selected modules.
This action CANNOT be undone!

Are you absolutely sure?`;

    if (confirm(confirmMessage)) {
      const promises = Array.from(this.selectedItems).map(id => 
        this.trashService.permanentlyDelete(id).toPromise()
      );
      
      Promise.all(promises).then(() => {
        this.loadTrashItems();
        this.loadStats();
        this.selectedItems.clear();
      }).catch(error => {
        console.error('❌ Error in bulk delete:', error);
        alert('Some modules failed to delete');
      });
    }
  }

  // Utility methods
  setSortBy(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
  }

  getDaysRemainingText(daysRemaining: number): string {
    return this.trashService.getDaysRemainingText(daysRemaining);
  }

  getDaysRemainingClass(daysRemaining: number): string {
    return this.trashService.getDaysRemainingClass(daysRemaining);
  }

  formatDate(date: Date | string): string {
    return this.trashService.formatDate(date);
  }

  getUniqueValues(field: keyof TrashItem): string[] {
    const values = this.trashItems.map(item => {
      if (field === 'level' || field === 'category') {
        return item[field] as string;
      }
      return '';
    }).filter(Boolean);
    
    return [...new Set(values)].sort();
  }
}