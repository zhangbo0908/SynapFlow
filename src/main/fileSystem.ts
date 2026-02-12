import { dialog } from 'electron'
import { readFile, writeFile, access } from 'fs/promises'
import writeFileAtomic from 'write-file-atomic'
import { LocalMindmap } from '../shared/types'
import { normalize, extname } from 'path'
import { generateXMindBuffer, parseXMindFile } from './xmindParser'

export async function saveMarkdown(content: string): Promise<{ success: boolean; filePath?: string }> {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Export as Markdown',
    defaultPath: 'untitled.md',
    filters: [{ name: 'Markdown Files', extensions: ['md'] }],
  })

  if (canceled || !filePath) {
    return { success: false }
  }

  let finalPath = filePath;
  if (!finalPath.toLowerCase().endsWith('.md')) {
    finalPath += '.md';
  }

  try {
    await writeFile(finalPath, content, 'utf-8')
    return { success: true, filePath: finalPath }
  } catch (error) {
    console.error('Failed to save markdown file:', error)
    return { success: false }
  }
}

export async function saveImage(dataUrl: string, format: 'png' | 'jpeg'): Promise<{ success: boolean; filePath?: string }> {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: `Export as ${format.toUpperCase()}`,
    defaultPath: `mindmap.${format}`,
    filters: [{ name: `${format.toUpperCase()} Image`, extensions: [format] }],
  })

  if (canceled || !filePath) {
    return { success: false }
  }

  let finalPath = filePath;
  const extension = `.${format}`;
  if (!finalPath.toLowerCase().endsWith(extension)) {
    finalPath += extension;
  }

  try {
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "")
    const buffer = Buffer.from(base64Data, 'base64')
    await writeFile(finalPath, buffer)
    return { success: true, filePath: finalPath }
  } catch (error) {
    console.error('Failed to save image file:', error)
    return { success: false }
  }
}

export async function savePdf(data: ArrayBuffer): Promise<{ success: boolean; filePath?: string }> {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Export as PDF',
    defaultPath: 'mindmap.pdf',
    filters: [{ name: 'PDF Document', extensions: ['pdf'] }],
  })

  if (canceled || !filePath) {
    return { success: false }
  }

  let finalPath = filePath;
  if (!finalPath.toLowerCase().endsWith('.pdf')) {
    finalPath += '.pdf';
  }

  try {
    await writeFile(finalPath, Buffer.from(data))
    return { success: true, filePath: finalPath }
  } catch (error) {
    console.error('Failed to save PDF file:', error)
    return { success: false }
  }
}

export async function saveMindmap(data: LocalMindmap, filePath?: string): Promise<{ success: boolean; filePath?: string }> {
  let targetPath = filePath

  if (!targetPath) {
    const { canceled, filePath: selectedPath } = await dialog.showSaveDialog({
      title: 'Save Mindmap',
      defaultPath: 'untitled.synap',
      filters: [
        { name: 'SynapFlow Files', extensions: ['synap'] },
        { name: 'XMind Files', extensions: ['xmind'] }
      ],
    })

    if (canceled || !selectedPath) {
      return { success: false }
    }

    targetPath = selectedPath
  }

  // Normalize path for cross-platform compatibility
  targetPath = normalize(targetPath)

  try {
    const ext = extname(targetPath).toLowerCase()
    
    if (ext === '.xmind') {
      // Handle XMind save
      let existingBuffer: Buffer | undefined
      
      try {
        // Try to read existing file to preserve resources
        // Check if file exists first
        await access(targetPath)
        existingBuffer = await readFile(targetPath)
      } catch (e) {
        // File doesn't exist or not readable, treat as new
        existingBuffer = undefined
      }
      
      const buffer = await generateXMindBuffer(data, existingBuffer)
      await writeFileAtomic(targetPath, buffer)
      
    } else {
      // Default SynapFlow JSON format
      await writeFileAtomic(targetPath, JSON.stringify(data, null, 2), { encoding: 'utf-8' })
    }
    
    return { success: true, filePath: targetPath }
  } catch (error) {
    console.error('Failed to save file:', error)
    return { success: false }
  }
}

export async function openMindmap(filePath?: string): Promise<{ canceled: boolean; data?: LocalMindmap; filePath?: string }> {
  let targetPath = filePath

  if (!targetPath) {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Open Mindmap',
      properties: ['openFile'],
      filters: [
        { name: 'Mindmap Files', extensions: ['synap', 'xmind'] }
      ],
    })

    if (canceled || filePaths.length === 0) {
      return { canceled: true }
    }
    targetPath = filePaths[0]
  }

  targetPath = normalize(targetPath)

  try {
    const ext = extname(targetPath).toLowerCase()
    
    if (ext === '.xmind') {
      const buffer = await readFile(targetPath)
      const data = await parseXMindFile(buffer)
      
      if (!data) {
        console.error('Failed to parse XMind file')
        return { canceled: true }
      }
      
      // Ensure the data has the correct file path associated with it
      // Although LocalMindmap doesn't strictly have a filePath field in its type definition usually,
      // it's returned as part of the result object here.
      return { canceled: false, data, filePath: targetPath }
    } else {
      // Default .synap behavior
      const content = await readFile(targetPath, 'utf-8')
      const data = JSON.parse(content) as LocalMindmap
      return { canceled: false, data, filePath: targetPath }
    }
  } catch (error) {
    console.error('Failed to open file:', error)
    return { canceled: true }
  }
}
