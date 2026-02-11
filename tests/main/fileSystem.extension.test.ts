// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { dialog } from 'electron'
import * as fs from 'fs/promises'
import { saveImage, savePdf, saveMarkdown } from '../../src/main/fileSystem'

// Mock electron dialog
vi.mock('electron', () => ({
  dialog: {
    showSaveDialog: vi.fn(),
  },
}))

// Mock fs
vi.mock('fs/promises', () => ({
  writeFile: vi.fn(),
}))

describe('FileSystem Extension Enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('saveImage', () => {
    it('should append .png extension if missing', async () => {
      // Mock dialog returning path without extension
      vi.mocked(dialog.showSaveDialog).mockResolvedValue({
        canceled: false,
        filePath: '/path/to/image',
      })

      await saveImage('data:image/png;base64,data', 'png')

      expect(fs.writeFile).toHaveBeenCalledWith(
        '/path/to/image.png',
        expect.any(Buffer)
      )
    })

    it('should append .jpeg extension if missing', async () => {
      vi.mocked(dialog.showSaveDialog).mockResolvedValue({
        canceled: false,
        filePath: '/path/to/image',
      })

      await saveImage('data:image/jpeg;base64,data', 'jpeg')

      expect(fs.writeFile).toHaveBeenCalledWith(
        '/path/to/image.jpeg',
        expect.any(Buffer)
      )
    })

    it('should not append extension if already present', async () => {
      vi.mocked(dialog.showSaveDialog).mockResolvedValue({
        canceled: false,
        filePath: '/path/to/image.png',
      })

      await saveImage('data:image/png;base64,data', 'png')

      expect(fs.writeFile).toHaveBeenCalledWith(
        '/path/to/image.png',
        expect.any(Buffer)
      )
    })
  })

  describe('savePdf', () => {
    it('should append .pdf extension if missing', async () => {
      vi.mocked(dialog.showSaveDialog).mockResolvedValue({
        canceled: false,
        filePath: '/path/to/document',
      })

      await savePdf(new ArrayBuffer(8))

      expect(fs.writeFile).toHaveBeenCalledWith(
        '/path/to/document.pdf',
        expect.any(Buffer)
      )
    })
  })

  describe('saveMarkdown', () => {
    it('should append .md extension if missing', async () => {
      vi.mocked(dialog.showSaveDialog).mockResolvedValue({
        canceled: false,
        filePath: '/path/to/notes',
      })

      await saveMarkdown('# Title')

      expect(fs.writeFile).toHaveBeenCalledWith(
        '/path/to/notes.md',
        '# Title',
        'utf-8'
      )
    })
  })
})
