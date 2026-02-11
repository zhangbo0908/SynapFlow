import React, { useState, useRef, useEffect } from 'react'

interface ExportDropdownProps {
  onExportMarkdown: () => void
  onExportImage: (format: 'png' | 'jpeg') => void
  onExportPdf: () => void
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({
  onExportMarkdown,
  onExportImage,
  onExportPdf
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleAction = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-1 px-3 py-1 text-xs border rounded transition-colors ${
          isOpen 
            ? 'bg-panel-hover border-ui-border text-ui-primary' 
            : 'bg-panel border-ui-border text-ui-primary hover:bg-panel-hover'
        }`}
        title="Export"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16 6 12 2 8 6"/>
          <line x1="12" x2="12" y1="2" y2="15"/>
        </svg>
        <span>Export</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-panel border border-ui-border rounded-lg shadow-xl z-50 py-1">
          <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-ui-secondary border-b border-ui-border mb-1">
            Export As
          </div>
          
          <button
            onClick={() => handleAction(onExportMarkdown)}
            className="w-full text-left px-3 py-2 text-sm text-ui-primary hover:bg-panel-hover transition-colors flex items-center space-x-3 group"
          >
            <div className="w-5 h-5 flex items-center justify-center bg-ui-border/20 rounded text-[10px] font-mono group-hover:bg-ui-border/40 transition-colors">MD</div>
            <span>Markdown</span>
          </button>

          <button
            onClick={() => handleAction(() => onExportImage('png'))}
            className="w-full text-left px-3 py-2 text-sm text-ui-primary hover:bg-panel-hover transition-colors flex items-center space-x-3 group"
          >
            <div className="w-5 h-5 flex items-center justify-center bg-ui-border/20 rounded text-[10px] font-mono group-hover:bg-ui-border/40 transition-colors">PNG</div>
            <span>Image (PNG)</span>
          </button>

          <button
            onClick={() => handleAction(() => onExportImage('jpeg'))}
            className="w-full text-left px-3 py-2 text-sm text-ui-primary hover:bg-panel-hover transition-colors flex items-center space-x-3 group"
          >
            <div className="w-5 h-5 flex items-center justify-center bg-ui-border/20 rounded text-[10px] font-mono group-hover:bg-ui-border/40 transition-colors">JPG</div>
            <span>Image (JPEG)</span>
          </button>

          <button
            onClick={() => handleAction(onExportPdf)}
            className="w-full text-left px-3 py-2 text-sm text-ui-primary hover:bg-panel-hover transition-colors flex items-center space-x-3 group"
          >
            <div className="w-5 h-5 flex items-center justify-center bg-ui-border/20 rounded text-[10px] font-mono group-hover:bg-ui-border/40 transition-colors">PDF</div>
            <span>Document (PDF)</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default ExportDropdown
