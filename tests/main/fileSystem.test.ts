// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fs from 'fs/promises'
import { dialog } from 'electron'
import { saveMindmap, openMindmap } from '../../src/main/fileSystem'
import { LocalMindmap } from '../../src/shared/types'

// Mock electron dialog
vi.mock('electron', () => ({
  dialog: {
    showOpenDialog: vi.fn(),
    showSaveDialog: vi.fn(),
  },
}))

// Mock fs
vi.mock('fs/promises', () => ({
  writeFile: vi.fn(),
  readFile: vi.fn(),
}))

describe('FileSystem Module', () => {
  const mockData: LocalMindmap = {
    version: '1.0',
    rootId: 'root',
    nodes: {},
    theme: 'default',
    editorState: { zoom: 1, offset: { x: 0, y: 0 } },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('saveMindmap', () => {
    it('should write data to the provided file path', async () => {
      const filePath = '/path/to/file.synap'
      await saveMindmap(mockData, filePath)
      
      expect(fs.writeFile).toHaveBeenCalledWith(
        filePath,
        JSON.stringify(mockData, null, 2),
        'utf-8'
      )
    })

    it('should open save dialog if no path provided', async () => {
      // Mock user selecting a path
      const selectedPath = '/user/selected/path.synap'
      vi.mocked(dialog.showSaveDialog).mockResolvedValue({
        canceled: false,
        filePath: selectedPath,
      })

      const result = await saveMindmap(mockData)

      expect(dialog.showSaveDialog).toHaveBeenCalled()
      expect(fs.writeFile).toHaveBeenCalledWith(
        selectedPath,
        JSON.stringify(mockData, null, 2),
        'utf-8'
      )
      expect(result).toEqual({ success: true, filePath: selectedPath })
    })

    it('should return failure if user cancels save dialog', async () => {
      vi.mocked(dialog.showSaveDialog).mockResolvedValue({
        canceled: true,
        filePath: undefined,
      })

      const result = await saveMindmap(mockData)

      expect(fs.writeFile).not.toHaveBeenCalled()
      expect(result).toEqual({ success: false })
    })
  })

  describe('openMindmap', () => {
    it('should read data from selected file', async () => {
      const selectedPath = '/path/to/existing.synap'
      vi.mocked(dialog.showOpenDialog).mockResolvedValue({
        canceled: false,
        filePaths: [selectedPath],
      })
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockData))

      const result = await openMindmap()

      expect(dialog.showOpenDialog).toHaveBeenCalledWith(expect.objectContaining({
        properties: ['openFile'],
        filters: [
          { name: 'Mindmap Files', extensions: ['synap', 'xmind'] }
        ]
      }))
      expect(fs.readFile).toHaveBeenCalledWith(selectedPath, 'utf-8')
      expect(result).toEqual({
        canceled: false,
        data: mockData,
        filePath: selectedPath,
      })
    })
  })
})
