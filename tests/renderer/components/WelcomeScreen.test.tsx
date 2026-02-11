import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WelcomeScreen from '../../../src/renderer/src/components/WelcomeScreen';
import { useUIStore } from '../../../src/renderer/src/store/useUIStore';

// Mock UI Store
vi.mock('../../../src/renderer/src/store/useUIStore', () => ({
  useUIStore: vi.fn(),
}));

// Mock window.api
const mockOpen = vi.fn();
const mockGetRecentFiles = vi.fn();

window.api = {
  file: {
    open: mockOpen,
    save: vi.fn(),
    importXMind: vi.fn(),
  },
  app: {
    getRecentFiles: mockGetRecentFiles,
  },
} as any;

describe('WelcomeScreen', () => {
  const setViewMode = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUIStore as any).mockReturnValue(setViewMode);
    
    // Default mock implementation
    mockGetRecentFiles.mockResolvedValue([]);
    mockOpen.mockResolvedValue({ canceled: true });
  });

  it('renders correctly', async () => {
    render(<WelcomeScreen />);
    // Basic render check via logo alt text or title
    expect(screen.getByText('SynapFlow')).toBeInTheDocument();
  });

  it('displays logo and title', async () => {
    render(<WelcomeScreen />);
    expect(screen.getByText('SynapFlow')).toBeInTheDocument();
  });

  it('has action buttons', async () => {
    render(<WelcomeScreen />);
    expect(screen.getByText('新建思维导图')).toBeInTheDocument();
    expect(screen.getByText('打开文件')).toBeInTheDocument();
  });

  it('loads recent files on mount', async () => {
    mockGetRecentFiles.mockResolvedValue(['/path/to/file1.synap', '/path/to/file2.synap']);
    render(<WelcomeScreen />);
    
    await waitFor(() => {
      expect(screen.getByText('最近文件')).toBeInTheDocument();
      // file1.synap will be in the file name part
      expect(screen.getAllByText('file1.synap').length).toBeGreaterThan(0);
    });
  });

  it('handles New Mindmap click', () => {
    render(<WelcomeScreen />);
    fireEvent.click(screen.getByText('新建思维导图'));
    expect(setViewMode).toHaveBeenCalledWith('editor');
  });

  it('handles Open File click (success)', async () => {
    mockOpen.mockResolvedValue({ canceled: false, data: {}, filePath: '/path/to/file.synap' });
    render(<WelcomeScreen />);
    
    fireEvent.click(screen.getByText('打开文件'));
    
    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalled();
      expect(setViewMode).toHaveBeenCalledWith('editor');
    });
  });

  it('handles Recent File click', async () => {
    mockGetRecentFiles.mockResolvedValue(['/path/to/recent.synap']);
    mockOpen.mockResolvedValue({ canceled: false, data: {}, filePath: '/path/to/recent.synap' });
    
    render(<WelcomeScreen />);
    
    await waitFor(() => {
      // Expect at least one element with the filename
      expect(screen.getAllByText('recent.synap').length).toBeGreaterThan(0);
    });
    
    // Click the first one found (the button or the text inside it)
    fireEvent.click(screen.getAllByText('recent.synap')[0]);
    
    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalledWith('/path/to/recent.synap');
      expect(setViewMode).toHaveBeenCalledWith('editor');
    });
  });
});
