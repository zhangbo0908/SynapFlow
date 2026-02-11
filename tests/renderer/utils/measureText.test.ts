import { describe, it, expect } from 'vitest';
import { measureText } from '../../../src/renderer/src/utils/measureText';

describe('measureText', () => {
  it('should measure text with default style (rounded)', () => {
    const size = measureText('Hello');
    // Mock implementation: width = length * 10
    // "Hello" length 5 -> 50
    // Rounded padding: h=20 -> width = 50 + 40 = 90
    expect(size.width).toBe(90);
    expect(size.height).toBeGreaterThan(0);
  });

  it('should apply diamond shape padding and ratio', () => {
    const size = measureText('Hello', { shape: 'diamond' });
    // Diamond padding: h=30 -> textWidth 50 + 60 = 110
    // Diamond ratio: 2.0 -> 110 * 2.0 = 220
    expect(size.width).toBe(220);
  });

  it('should apply cloud shape padding and ratio', () => {
    const size = measureText('Hello', { shape: 'cloud' });
    // Cloud padding: h=25 -> textWidth 50 + 50 = 100
    // Cloud ratio: 1.3 -> 100 * 1.3 = 130
    expect(size.width).toBe(130);
  });

  it('should respect minimum dimensions', () => {
    const size = measureText('');
    // Empty text width 0
    // Rounded padding 40
    // Min width for small font is 60
    expect(size.width).toBe(60);
  });

  it('should handle large font size minimums', () => {
    const size = measureText('', { fontSize: 24 });
    // Min width for large font is 120
    expect(size.width).toBe(120);
  });
});
