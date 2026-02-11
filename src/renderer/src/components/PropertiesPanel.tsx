import React, { useState, useEffect } from 'react';
import { useMindmapStore } from '../store/useMindmapStore';
import { THEME_PRESETS } from '../utils/themePresets';
import clsx from 'clsx';

type TabType = 'style' | 'canvas';

const PropertiesPanel: React.FC = () => {
  const selectedId = useMindmapStore(state => {
    const sheet = state.data.sheets?.find(s => s.id === state.data.activeSheetId);
    return sheet?.editorState.selectedId;
  });
  const node = useMindmapStore(state => {
    const sheet = state.data.sheets?.find(s => s.id === state.data.activeSheetId);
    const id = sheet?.editorState.selectedId;
    return (id && sheet) ? sheet.nodes[id] : null;
  });
  const updateNodeStyle = useMindmapStore(state => state.updateNodeStyle);
  const updateLayout = useMindmapStore(state => state.updateLayout);
  const updateTheme = useMindmapStore(state => state.updateTheme);
  const currentLayout = useMindmapStore(state => {
    const sheet = state.data.sheets?.find(s => s.id === state.data.activeSheetId);
    return sheet?.layout || 'logic';
  });
  const currentTheme = useMindmapStore(state => {
    const sheet = state.data.sheets?.find(s => s.id === state.data.activeSheetId);
    return sheet?.theme || 'default';
  });
  const parentNode = useMindmapStore(state => {
    const sheet = state.data.sheets?.find(s => s.id === state.data.activeSheetId);
    const id = sheet?.editorState.selectedId;
    const node = (id && sheet) ? sheet.nodes[id] : null;
    if (node && node.parentId && sheet) {
      return sheet.nodes[node.parentId];
    }
    return null;
  });
  
  const [activeTab, setActiveTab] = useState<TabType>('canvas');

  // Automatically switch tab based on selection
  useEffect(() => {
    if (selectedId) {
      setActiveTab('style');
    } else {
      setActiveTab('canvas');
    }
  }, [selectedId]);

  const handleStyleChange = (key: string, value: string | number) => {
    if (node) {
      updateNodeStyle(node.id, { [key]: value });
    }
  };

  const getDefaultBorderColor = () => {
    if (!node) return '#000000';
    const theme = THEME_PRESETS[currentTheme] || THEME_PRESETS.business; // Fallback to business as default
    let style = theme.secondaryStyle;
    
    if (node.isRoot) {
      style = theme.rootStyle;
    } else if (parentNode && parentNode.isRoot) {
      style = theme.primaryStyle;
    }
    
    return style.borderColor || '#000000';
  };
  
  const defaultBorderColor = getDefaultBorderColor();

  return (
    <div className="w-64 bg-panel border-l border-ui-border flex flex-col h-full shadow-lg z-10 transition-colors duration-200">
      {/* Tab Header */}
      <div className="flex border-b border-ui-border bg-panel">
        <button
          onClick={() => setActiveTab('style')}
          className={clsx(
            "flex-1 py-3 text-sm font-medium transition-colors relative",
            activeTab === 'style' 
              ? "text-brand bg-panel" 
              : "text-ui-secondary hover:text-ui-primary hover:bg-panel-hover"
          )}
        >
          节点样式
          {activeTab === 'style' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('canvas')}
          className={clsx(
            "flex-1 py-3 text-sm font-medium transition-colors relative",
            activeTab === 'canvas' 
              ? "text-brand bg-panel" 
              : "text-ui-secondary hover:text-ui-primary hover:bg-panel-hover"
          )}
        >
          画布设置
          {activeTab === 'canvas' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand"></div>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-panel">
        {activeTab === 'canvas' && (
          <div className="p-4 space-y-6">
            {/* Layout Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ui-secondary uppercase tracking-wide">布局结构</label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => updateLayout('logic')}
                  className={`px-3 py-2 text-sm border border-ui-border rounded text-left hover:bg-panel-hover transition-colors ${currentLayout === 'logic' ? 'ring-2 ring-brand border-transparent' : ''}`}
                >
                  <div className="font-medium text-ui-primary">逻辑图</div>
                  <div className="text-xs text-ui-secondary">自左向右发散</div>
                </button>
                <button
                  onClick={() => updateLayout('mindmap')}
                  className={`px-3 py-2 text-sm border border-ui-border rounded text-left hover:bg-panel-hover transition-colors ${currentLayout === 'mindmap' ? 'ring-2 ring-brand border-transparent' : ''}`}
                >
                  <div className="font-medium text-ui-primary">思维导图</div>
                  <div className="text-xs text-ui-secondary">中心发散</div>
                </button>
                <button
                  onClick={() => updateLayout('orgChart')}
                  className={`px-3 py-2 text-sm border border-ui-border rounded text-left hover:bg-panel-hover transition-colors ${currentLayout === 'orgChart' ? 'ring-2 ring-brand border-transparent' : ''}`}
                >
                  <div className="font-medium text-ui-primary">组织结构图</div>
                  <div className="text-xs text-ui-secondary">自上而下</div>
                </button>
              </div>
            </div>

            <div className="border-t border-ui-border pt-4"></div>

            {/* Theme Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ui-secondary uppercase tracking-wide">风格主题</label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(THEME_PRESETS).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => updateTheme(key)}
                    className={`flex items-center p-2 border border-ui-border rounded hover:bg-panel-hover transition-colors ${currentTheme === key ? 'ring-2 ring-brand border-transparent' : ''}`}
                  >
                    <div 
                      className="w-8 h-8 rounded border mr-3 flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: theme.rootStyle.backgroundColor, borderColor: theme.rootStyle.borderColor, borderWidth: theme.rootStyle.borderWidth }}
                    ></div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-ui-primary">{theme.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'style' && (
          node ? (
            <div className="p-4 space-y-6">
              {/* Background Color */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ui-secondary uppercase tracking-wide">背景颜色</label>
                <div className="flex items-center space-x-3">
                  <input 
                    type="color" 
                    aria-label="背景颜色"
                    value={node.style?.backgroundColor || '#ffffff'} 
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                    className="w-10 h-10 rounded border border-ui-border cursor-pointer p-1 bg-panel"
                  />
                  <span className="text-xs text-ui-secondary font-mono bg-panel-hover px-2 py-1 rounded border border-ui-border">{node.style?.backgroundColor || '#ffffff'}</span>
                </div>
              </div>

              {/* Text Color */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ui-secondary uppercase tracking-wide">文本颜色</label>
                <div className="flex items-center space-x-3">
                  <input 
                    type="color" 
                    aria-label="文本颜色"
                    value={node.style?.color || '#1A1A1A'} 
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    className="w-10 h-10 rounded border border-ui-border cursor-pointer p-1 bg-panel"
                  />
                  <span className="text-xs text-ui-secondary font-mono bg-panel-hover px-2 py-1 rounded border border-ui-border">{node.style?.color || '#1A1A1A'}</span>
                </div>
              </div>

              {/* Border Color */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ui-secondary uppercase tracking-wide">边框颜色</label>
                <div className="flex items-center space-x-3">
                  <input 
                    type="color" 
                    aria-label="边框颜色"
                    value={node.style?.borderColor || defaultBorderColor} 
                    onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                    className="w-10 h-10 rounded border border-ui-border cursor-pointer p-1 bg-panel"
                  />
                   <span className="text-xs text-ui-secondary font-mono bg-panel-hover px-2 py-1 rounded border border-ui-border">{node.style?.borderColor || defaultBorderColor}</span>
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ui-secondary uppercase tracking-wide">字体大小 (px)</label>
                <input 
                  type="number" 
                  aria-label="字体大小"
                  value={node.style?.fontSize || 14} 
                  onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value) || 14)}
                  className="w-full px-3 py-2 text-sm bg-panel text-ui-primary border border-ui-border rounded focus:ring-2 focus:ring-brand focus:outline-none"
                  min="8"
                  max="72"
                />
              </div>

              {/* Shape */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ui-secondary uppercase tracking-wide">节点形状</label>
                <select
                  aria-label="节点形状"
                  value={node.style?.shape || 'rounded'}
                  onChange={(e) => handleStyleChange('shape', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-panel text-ui-primary border border-ui-border rounded focus:ring-2 focus:ring-brand focus:outline-none"
                >
                  <option value="rounded">圆角矩形</option>
                  <option value="rectangle">矩形</option>
                  <option value="ellipse">椭圆</option>
                  <option value="diamond">菱形</option>
                  <option value="capsule">胶囊形</option>
                  <option value="hexagon">六边形</option>
                  <option value="cloud">云朵</option>
                  <option value="underline">下划线</option>
                </select>
              </div>

              {/* Line Style */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ui-secondary uppercase tracking-wide">连线样式</label>
                <select
                  aria-label="连线样式"
                  value={node.style?.lineStyle || 'bezier'}
                  onChange={(e) => handleStyleChange('lineStyle', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-panel text-ui-primary border border-ui-border rounded focus:ring-2 focus:ring-brand focus:outline-none"
                >
                  <option value="bezier">贝塞尔曲线</option>
                  <option value="straight">直线</option>
                  <option value="step">折线</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-ui-secondary p-4 text-center">
              <p>请选择一个节点以编辑样式</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
