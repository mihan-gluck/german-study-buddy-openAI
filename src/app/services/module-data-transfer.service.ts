// src/app/services/module-data-transfer.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModuleDataTransferService {
  private generatedModuleData: any = null;

  setGeneratedModule(moduleData: any): void {
    this.generatedModuleData = moduleData;
    console.log('📋 Stored AI-generated module data for transfer:', moduleData?.title);
  }

  getGeneratedModule(): any {
    const data = this.generatedModuleData;
    this.generatedModuleData = null; // Clear after retrieval to prevent reuse
    console.log('📤 Retrieved AI-generated module data:', data?.title);
    return data;
  }

  hasGeneratedModule(): boolean {
    return this.generatedModuleData !== null;
  }

  clearGeneratedModule(): void {
    this.generatedModuleData = null;
    console.log('🗑️ Cleared AI-generated module data');
  }
}