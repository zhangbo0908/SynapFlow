import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { UserPreferences } from '../shared/types';

export class UserDataManager {
  private preferencesPath: string;
  private preferences: UserPreferences;
  private readonly MAX_RECENT_FILES = 10;

  constructor() {
    this.preferencesPath = path.join(app.getPath('userData'), 'user-preferences.json');
    this.preferences = this.loadPreferences();
  }

  private loadPreferences(): UserPreferences {
    const defaultPreferences: UserPreferences = { 
      recentFiles: [],
      hasCompletedOnboarding: false
    };
    
    try {
      if (fs.existsSync(this.preferencesPath)) {
        const data = fs.readFileSync(this.preferencesPath, 'utf-8');
        return { ...defaultPreferences, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
    
    return defaultPreferences;
  }

  private savePreferences(): void {
    try {
      fs.writeFileSync(this.preferencesPath, JSON.stringify(this.preferences, null, 2));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }

  getRecentFiles(): string[] {
    return this.preferences.recentFiles;
  }

  getPreferences(): UserPreferences {
    return this.preferences;
  }

  updatePreferences(prefs: Partial<UserPreferences>): void {
    this.preferences = { ...this.preferences, ...prefs };
    this.savePreferences();
  }

  addRecentFile(filePath: string): void {
    // Remove if already exists to move it to the top
    this.preferences.recentFiles = this.preferences.recentFiles.filter(p => p !== filePath);
    
    // Add to the beginning
    this.preferences.recentFiles.unshift(filePath);
    
    // Enforce limit
    if (this.preferences.recentFiles.length > this.MAX_RECENT_FILES) {
      this.preferences.recentFiles = this.preferences.recentFiles.slice(0, this.MAX_RECENT_FILES);
    }
    
    this.savePreferences();
  }
}
