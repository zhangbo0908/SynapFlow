import React from 'react'
import CanvasWorkspace from './components/CanvasWorkspace'
import PropertiesPanel from './components/PropertiesPanel'
import SaveStatus from './components/SaveStatus'
import SheetBar from './components/SheetBar'
import ExportDropdown from './components/ExportDropdown'
import WelcomeScreen from './components/WelcomeScreen'
import { OnboardingOverlay } from './components/OnboardingOverlay'
import { useMindmapStore } from './store/useMindmapStore'
import { useUIStore } from './store/useUIStore'
import { useAutoSave } from './hooks/useAutoSave'
import logo from './assets/logo.svg'

import { generateMarkdown, exportToPng, exportToJpeg, generatePdf } from './utils/exportEngine'

function App(): JSX.Element {
  const setMindmap = useMindmapStore((state) => state.setMindmap)
  const setFilePath = useMindmapStore((state) => state.setFilePath)
  const themeMode = useUIStore((state) => state.themeMode)
  const setThemeMode = useUIStore((state) => state.setThemeMode)
  const viewMode = useUIStore((state) => state.viewMode)
  const setViewMode = useUIStore((state) => state.setViewMode)
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const { isSaving, lastSavedTime, markAsSaved } = useAutoSave()
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)
  const [showOnboarding, setShowOnboarding] = React.useState(false)

  // Track system theme
  const [systemIsDark, setSystemIsDark] = React.useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  // Calculate effective theme
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemIsDark)

  // Listen for system theme changes
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Check Onboarding status
  React.useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const prefs = await window.api.user.getPreferences()
        if (!prefs.hasCompletedOnboarding) {
          setShowOnboarding(true)
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error)
      }
    }
    
    checkOnboardingStatus()
  }, [])

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false)
    try {
      await window.api.user.updatePreferences({ hasCompletedOnboarding: true })
    } catch (error) {
      console.error('Failed to set onboarding status:', error)
    }
  }

  // Apply theme effect
  React.useEffect(() => {
    const root = window.document.documentElement
    
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  const handleOpenFile = async () => {
    try {
      const result = await window.api.file.open()
      if (!result.canceled && result.data) {
        setMindmap(result.data)
        if (result.filePath) {
          setFilePath(result.filePath)
        }
        setViewMode('editor')
      }
    } catch (error) {
      console.error('Failed to open file', error)
    }
  }

  const handleSaveFile = async () => {
    const { data: currentData, currentFilePath: latestFilePath } = useMindmapStore.getState()
    try {
      // If we already have a path, save directly (useAutoSave handles this too, but this is forced save)
      // We use getState() to ensure we have the latest path even inside the useEffect closure
      const result = await window.api.file.save(currentData, latestFilePath || undefined)
      if (result.success && result.filePath) {
        setFilePath(result.filePath)
        markAsSaved()
      }
    } catch (error) {
      console.error('Failed to save file', error)
    }
  }

  const handleImportXMind = async () => {
    try {
      const result = await window.api.file.importXMind()
      if (!result.canceled && result.data) {
        setMindmap(result.data)
        // If import provides a filePath, use it to allow saving back to XMind
        if (result.filePath) {
          setFilePath(result.filePath)
          markAsSaved()
        } else {
          setFilePath(null) 
        }
        setViewMode('editor')
      }
    } catch (error) {
      console.error('Failed to import XMind file', error)
    }
  }

  const handleExportMarkdown = async () => {
    const { data } = useMindmapStore.getState()
    const activeSheet = data.sheets?.find(s => s.id === data.activeSheetId)
    if (!activeSheet) return

    const markdown = generateMarkdown(activeSheet.rootId, activeSheet.nodes)
    try {
      // @ts-ignore - The saveMarkdown type is defined in env.d.ts but not picked up by TS server in some cases
      await window.api.file.saveMarkdown(markdown)
    } catch (error) {
      console.error('Failed to export markdown', error)
    }
  }

  const handleExportImage = async (format: 'png' | 'jpeg') => {
    const { data } = useMindmapStore.getState()
    const activeSheet = data.sheets?.find(s => s.id === data.activeSheetId)
    if (!activeSheet) return

    try {
      let dataUrl: string
      if (format === 'png') {
        dataUrl = await exportToPng(activeSheet.rootId, activeSheet.nodes)
      } else {
        dataUrl = await exportToJpeg(activeSheet.rootId, activeSheet.nodes)
      }
      // @ts-ignore - The saveImage type is defined in env.d.ts
      await window.api.file.saveImage(dataUrl, format)
    } catch (error) {
      console.error(`Failed to export ${format}`, error)
    }
  }

  const handleExportPdf = async () => {
    const { data } = useMindmapStore.getState()
    const activeSheet = data.sheets?.find(s => s.id === data.activeSheetId)
    if (!activeSheet) return

    const getCssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const bgColor = getCssVar('--color-bg-canvas');

    try {
      const pdfData = await generatePdf(activeSheet.nodes, {
        backgroundColor: bgColor,
        padding: 50
      })
      // @ts-ignore - The savePdf type is defined in env.d.ts
      await window.api.file.savePdf(pdfData)
    } catch (error) {
      console.error('Failed to export PDF', error)
    }
  }


  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSaveFile()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'o') {
        e.preventDefault()
        handleOpenFile()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex flex-col h-screen bg-canvas text-ui-primary transition-colors duration-200">
      {viewMode === 'welcome' ? (
        <WelcomeScreen />
      ) : (
        <>
          <div className={`h-10 bg-panel border-b border-ui-border flex items-center px-4 space-x-2 draggable-region z-20 relative transition-colors duration-200 ${isMac ? 'pl-20' : ''}`}>
            <div className="flex-1 font-medium text-sm text-ui-secondary flex items-center space-x-2">
              <img src={logo} alt="Logo" className="w-6 h-6" />
              <span>SynapFlow</span>
              <span className="mx-2 text-ui-border">|</span>
              <SaveStatus isSaving={isSaving} lastSavedTime={lastSavedTime} />
            </div>
            <div className="no-drag flex space-x-2">
              <button 
                onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
                className="px-3 py-1 text-xs bg-panel hover:bg-panel-hover border border-ui-border rounded text-ui-secondary transition-colors"
                title="Toggle Theme"
              >
                {isDark ? '🌞' : '🌙'}
              </button>
              <button 
                onClick={toggleSidebar}
                className={`px-3 py-1 text-xs bg-panel hover:bg-panel-hover border border-ui-border rounded transition-colors ${isSidebarOpen ? 'text-brand bg-panel-active' : 'text-ui-secondary'}`}
                title={isSidebarOpen ? "收起侧边栏" : "展开侧边栏"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="15" y1="3" x2="15" y2="21" />
                </svg>
              </button>
              <button 
                onClick={handleOpenFile}
                className="px-3 py-1 text-xs bg-panel hover:bg-panel-hover border border-ui-border rounded text-ui-primary transition-colors"
              >
                Open
              </button>
              <button 
                onClick={handleImportXMind}
                className="px-3 py-1 text-xs bg-panel hover:bg-panel-hover border border-ui-border text-ui-primary rounded transition-colors"
              >
                Import XMind
              </button>
              <ExportDropdown 
                onExportMarkdown={handleExportMarkdown}
                onExportImage={handleExportImage}
                onExportPdf={handleExportPdf}
              />
              <button 
                onClick={handleSaveFile}
                className="px-3 py-1 text-xs bg-brand hover:bg-blue-600 text-white rounded transition-colors"
              >
                Save
              </button>
            </div>
          </div>
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 bg-canvas relative flex flex-col overflow-hidden transition-colors duration-200">
              <div className="flex-1 relative">
                <CanvasWorkspace />
              </div>
              <SheetBar />
            </div>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden flex flex-col ${isSidebarOpen ? 'w-64 opacity-100' : 'w-0 opacity-0'}`}>
              <div className="w-64 h-full flex flex-col">
                <PropertiesPanel />
              </div>
            </div>
          </div>
        </>
      )}
      <OnboardingOverlay visible={showOnboarding} onComplete={handleOnboardingComplete} />
    </div>
  )
}

export default App
