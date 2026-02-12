import { describe, it, expect } from 'vitest';
import { THEME_PRESETS, THEME_PRESETS_DARK, getThemeConfig } from '../../../src/renderer/src/utils/themePresets';

describe('THEME_PRESETS', () => {
  it('minimal theme should use explicit colors for secondary nodes', () => {
    const minimalTheme = THEME_PRESETS.minimal;
    
    // 验证 secondaryStyle 的 color 属性已明确定义（遵循设计规范）
    expect(minimalTheme.secondaryStyle.color).toBe('#000000');
  });

  it('minimal theme should keep root and primary styles consistent', () => {
    const minimalTheme = THEME_PRESETS.minimal;
    
    // Root 仍然保持黑底白字
    expect(minimalTheme.rootStyle.backgroundColor).toBe('#000000');
    expect(minimalTheme.rootStyle.color).toBe('#FFFFFF');
    
    // Primary 保持白底黑字
    expect(minimalTheme.primaryStyle.color).toBe('#000000');
  });

  it('all themes should have required properties', () => {
    Object.values(THEME_PRESETS).forEach(theme => {
      expect(theme.name).toBeDefined();
      expect(theme.rootStyle).toBeDefined();
      expect(theme.primaryStyle).toBeDefined();
      expect(theme.secondaryStyle).toBeDefined();
      expect(theme.palette).toBeDefined();
      expect(theme.lineStyle).toBeDefined();
    });
  });
});

describe('THEME_PRESETS_DARK', () => {
  it('should have dark mode configuration for all base themes', () => {
    const baseThemeKeys = Object.keys(THEME_PRESETS);
    baseThemeKeys.forEach(key => {
      expect(THEME_PRESETS_DARK[key]).toBeDefined();
    });
  });

  it('minimal theme dark mode should invert colors', () => {
    const minimalDark = THEME_PRESETS_DARK.minimal;
    // Dark mode: Root white bg, black text
    expect(minimalDark.rootStyle.backgroundColor).toBe('#FFFFFF');
    expect(minimalDark.rootStyle.color).toBe('#000000');
    // Dark mode: Primary black bg, white text
    expect(minimalDark.primaryStyle.backgroundColor).toBe('#000000');
    expect(minimalDark.primaryStyle.color).toBe('#FFFFFF');
  });
});

describe('getThemeConfig', () => {
  it('should return light theme by default', () => {
    const config = getThemeConfig('business');
    expect(config.name).toBe('商务专业');
    expect(config.backgroundColor).toBe('#F5F7FA');
  });

  it('should return dark theme when mode is dark', () => {
    const config = getThemeConfig('business', 'dark');
    expect(config.name).toBe('商务专业 (Dark)');
    expect(config.backgroundColor).toBe('#1E1E1E');
  });

  it('should merge base theme with dark overrides', () => {
    // Check that properties not in dark override are preserved from base
    const config = getThemeConfig('business', 'dark');
    // lineStyle is defined in both, but let's check a property that might be inherited if we didn't redefine everything
    // In our implementation, we redefine most things, but 'lineStyle' is consistent
    expect(config.lineStyle).toBe('step');
  });
  
  it('should handle "dark" theme (Cyber Tech) specifically', () => {
     const lightCyber = getThemeConfig('dark', 'light');
     expect(lightCyber.name).toBe('赛博科技 (Light)');
     expect(lightCyber.backgroundColor).toBe('#F0F4F8');

     const darkCyber = getThemeConfig('dark', 'dark');
     expect(darkCyber.name).toBe('赛博科技 (Dark)');
     expect(darkCyber.backgroundColor).toBe('#1E1E1E');
  });
});
