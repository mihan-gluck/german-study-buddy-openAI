// src/app/services/level-access.service.ts

import { Injectable } from '@angular/core';

export interface LevelInfo {
  code: string;
  name: string;
  order: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class LevelAccessService {
  
  // CEFR Level hierarchy (lower order = easier level)
  private readonly levels: LevelInfo[] = [
    { code: 'A1', name: 'Beginner', order: 1, description: 'Basic user - breakthrough or beginner' },
    { code: 'A2', name: 'Elementary', order: 2, description: 'Basic user - waystage or elementary' },
    { code: 'B1', name: 'Intermediate', order: 3, description: 'Independent user - threshold or intermediate' },
    { code: 'B2', name: 'Upper Intermediate', order: 4, description: 'Independent user - vantage or upper intermediate' },
    { code: 'C1', name: 'Advanced', order: 5, description: 'Proficient user - effective operational proficiency or advanced' },
    { code: 'C2', name: 'Proficiency', order: 6, description: 'Proficient user - mastery or proficiency' }
  ];

  constructor() { }

  /**
   * Get level information by code
   */
  getLevelInfo(levelCode: string): LevelInfo | null {
    return this.levels.find(level => level.code === levelCode) || null;
  }

  /**
   * Get all levels
   */
  getAllLevels(): LevelInfo[] {
    return [...this.levels];
  }

  /**
   * Get levels that a student can access (their level and below)
   */
  getAccessibleLevels(studentLevel: string): string[] {
    const studentLevelInfo = this.getLevelInfo(studentLevel);
    if (!studentLevelInfo) {
      return []; // Invalid level
    }

    return this.levels
      .filter(level => level.order <= studentLevelInfo.order)
      .map(level => level.code);
  }

  /**
   * Check if a student can access a module based on level
   */
  canAccessModule(studentLevel: string, moduleLevel: string): boolean {
    const studentLevelInfo = this.getLevelInfo(studentLevel);
    const moduleLevelInfo = this.getLevelInfo(moduleLevel);

    if (!studentLevelInfo || !moduleLevelInfo) {
      return false; // Invalid levels
    }

    // Student can access modules at their level or below
    return moduleLevelInfo.order <= studentLevelInfo.order;
  }

  /**
   * Get access status for a module
   */
  getModuleAccessStatus(studentLevel: string, moduleLevel: string): {
    canAccess: boolean;
    reason: string;
    levelDifference: number;
  } {
    const studentLevelInfo = this.getLevelInfo(studentLevel);
    const moduleLevelInfo = this.getLevelInfo(moduleLevel);

    if (!studentLevelInfo || !moduleLevelInfo) {
      return {
        canAccess: false,
        reason: 'Invalid level information',
        levelDifference: 0
      };
    }

    const levelDifference = moduleLevelInfo.order - studentLevelInfo.order;

    if (levelDifference <= 0) {
      return {
        canAccess: true,
        reason: levelDifference === 0 ? 'Perfect match for your level' : 'Good for review and practice',
        levelDifference
      };
    } else {
      return {
        canAccess: false,
        reason: `Too advanced - requires ${moduleLevelInfo.name} level`,
        levelDifference
      };
    }
  }

  /**
   * Get recommended modules for a student level
   */
  getRecommendedLevels(studentLevel: string): string[] {
    const studentLevelInfo = this.getLevelInfo(studentLevel);
    if (!studentLevelInfo) {
      return [];
    }

    // Recommend current level and one level below (if exists)
    const recommendedOrders = [studentLevelInfo.order];
    if (studentLevelInfo.order > 1) {
      recommendedOrders.push(studentLevelInfo.order - 1);
    }

    return this.levels
      .filter(level => recommendedOrders.includes(level.order))
      .map(level => level.code);
  }

  /**
   * Get level progression path
   */
  getLevelProgression(currentLevel: string): {
    previous: LevelInfo | null;
    current: LevelInfo | null;
    next: LevelInfo | null;
  } {
    const currentLevelInfo = this.getLevelInfo(currentLevel);
    if (!currentLevelInfo) {
      return { previous: null, current: null, next: null };
    }

    const previousLevel = this.levels.find(level => level.order === currentLevelInfo.order - 1) || null;
    const nextLevel = this.levels.find(level => level.order === currentLevelInfo.order + 1) || null;

    return {
      previous: previousLevel,
      current: currentLevelInfo,
      next: nextLevel
    };
  }

  /**
   * Format level for display
   */
  formatLevel(levelCode: string): string {
    const levelInfo = this.getLevelInfo(levelCode);
    return levelInfo ? `${levelInfo.code} - ${levelInfo.name}` : levelCode;
  }

  /**
   * Get level color for UI
   */
  getLevelColor(levelCode: string): string {
    const levelInfo = this.getLevelInfo(levelCode);
    if (!levelInfo) return 'secondary';

    const colorMap: { [key: string]: string } = {
      'A1': 'success',    // Green - Beginner
      'A2': 'info',       // Blue - Elementary  
      'B1': 'warning',    // Yellow - Intermediate
      'B2': 'primary',    // Purple - Upper Intermediate
      'C1': 'danger',     // Red - Advanced
      'C2': 'dark'        // Dark - Proficiency
    };

    return colorMap[levelCode] || 'secondary';
  }

  /**
   * Get access icon for module
   */
  getAccessIcon(canAccess: boolean): string {
    return canAccess ? 'fas fa-unlock' : 'fas fa-lock';
  }
}