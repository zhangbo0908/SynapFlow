import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';

// Mock electron
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/mock/user/data'),
  },
}));

// Mock fs to avoid writing to disk
vi.mock('fs', async (importOriginal) => {
  return {
    default: {
      existsSync: vi.fn(),
      readFileSync: vi.fn(),
      writeFileSync: vi.fn(),
      mkdirSync: vi.fn(),
    },
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
  };
});

// We need to import the class AFTER mocking
import { UserDataManager } from '../../src/main/userData';
import { UserPreferences } from '../../src/shared/types';

describe('UserDataManager', () => {
  const mockPath = '/mock/user/data/user-preferences.json';
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Default behavior for mocks
    (fs.existsSync as any).mockReturnValue(false);
  });

  it('should initialize with empty recent files if file does not exist', () => {
    const manager = new UserDataManager();
    expect(manager.getRecentFiles()).toEqual([]);
  });

  it('should initialize with default hasCompletedOnboarding = false', () => {
    const manager = new UserDataManager();
    expect(manager.getPreferences().hasCompletedOnboarding).toBe(false);
  });

  it('should load existing recent files from disk', () => {
    (fs.existsSync as any).mockReturnValue(true);
    (fs.readFileSync as any).mockReturnValue(JSON.stringify({
      recentFiles: ['/path/to/file1.synap', '/path/to/file2.synap']
    }));

    const manager = new UserDataManager();
    expect(manager.getRecentFiles()).toHaveLength(2);
    expect(manager.getRecentFiles()[0]).toBe('/path/to/file1.synap');
  });

  it('should load existing onboarding status from disk', () => {
    (fs.existsSync as any).mockReturnValue(true);
    (fs.readFileSync as any).mockReturnValue(JSON.stringify({
      recentFiles: [],
      hasCompletedOnboarding: true
    }));

    const manager = new UserDataManager();
    expect(manager.getPreferences().hasCompletedOnboarding).toBe(true);
  });

  it('should add a recent file and save to disk', () => {
    const manager = new UserDataManager();
    manager.addRecentFile('/path/to/new.synap');

    expect(manager.getRecentFiles()).toContain('/path/to/new.synap');
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('user-preferences.json'),
      expect.stringContaining('/path/to/new.synap')
    );
  });

  it('should move existing file to top when added again', () => {
    (fs.existsSync as any).mockReturnValue(true);
    (fs.readFileSync as any).mockReturnValue(JSON.stringify({
      recentFiles: ['/path/to/old.synap', '/path/to/other.synap']
    }));

    const manager = new UserDataManager();
    manager.addRecentFile('/path/to/other.synap');

    const recentFiles = manager.getRecentFiles();
    expect(recentFiles[0]).toBe('/path/to/other.synap');
    expect(recentFiles[1]).toBe('/path/to/old.synap');
    expect(recentFiles).toHaveLength(2);
  });

  it('should limit recent files to 10', () => {
    const manager = new UserDataManager();
    
    // Add 15 files
    for (let i = 1; i <= 15; i++) {
      manager.addRecentFile(`/path/to/file${i}.synap`);
    }

    const recentFiles = manager.getRecentFiles();
    expect(recentFiles).toHaveLength(10);
    // The last added file (file15) should be first
    expect(recentFiles[0]).toBe('/path/to/file15.synap');
    // file6 should be the last one (file1..file5 should be dropped)
    expect(recentFiles[9]).toBe('/path/to/file6.synap');
  });

  it('should handle invalid JSON gracefully', () => {
    (fs.existsSync as any).mockReturnValue(true);
    (fs.readFileSync as any).mockReturnValue('invalid json');

    const manager = new UserDataManager();
    expect(manager.getRecentFiles()).toEqual([]);
    expect(manager.getPreferences().hasCompletedOnboarding).toBe(false);
  });

  it('should update preferences and save to disk', () => {
    const manager = new UserDataManager();
    manager.updatePreferences({ hasCompletedOnboarding: true });

    expect(manager.getPreferences().hasCompletedOnboarding).toBe(true);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('user-preferences.json'),
      expect.stringContaining('"hasCompletedOnboarding": true')
    );
  });
});
