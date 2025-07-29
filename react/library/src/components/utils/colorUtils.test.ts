/**
 * Tests for colorUtils.ts
 */

import { generateColorVariants, generateLuminosityVariant, generateTransparencyVariant } from './colorUtils';

describe('colorUtils', () => {
  describe('generateLuminosityVariant', () => {
    it('should handle named colors', () => {
      const result = generateLuminosityVariant('blue', 50);
      expect(result).toContain('hsl(204, 88%, ');
    });

    it('should handle hex colors', () => {
      const result = generateLuminosityVariant('#ff0000', 50);
      expect(result).toContain('color-mix(in srgb, #ff0000, black 50%)');
    });

    it('should handle rgb colors', () => {
      const result = generateLuminosityVariant('rgb(255, 0, 0)', 50);
      expect(result).toContain('color-mix(in srgb, rgb(255, 0, 0), black 50%)');
    });

    it('should handle hsl colors', () => {
      const result = generateLuminosityVariant('hsl(0, 100%, 50%)', 50);
      expect(result).toContain('color-mix(in srgb, hsl(0, 100%, 50%), black 50%)');
    });

    it('should handle different luminosity percentages', () => {
      const result20 = generateLuminosityVariant('blue', 20);
      const result50 = generateLuminosityVariant('blue', 50);
      const result80 = generateLuminosityVariant('blue', 80);
      
      // Extract the luminosity value from the HSL string
      const getLuminosity = (hsl: string) => {
        const match = hsl.match(/hsl\(\d+, \d+%, (\d+)%\)/);
        return match ? parseInt(match[1], 10) : null;
      };
      
      const lum20 = getLuminosity(result20);
      const lum50 = getLuminosity(result50);
      const lum80 = getLuminosity(result80);
      
      // Verify that luminosity increases with percentage
      expect(lum20).toBeLessThan(lum50);
      expect(lum50).toBeLessThan(lum80);
    });
  });

  describe('generateTransparencyVariant', () => {
    it('should handle named colors', () => {
      const result = generateTransparencyVariant('blue', 50);
      expect(result).toBe('color-mix(in srgb, blue 50%, transparent)');
    });

    it('should handle hex colors', () => {
      const result = generateTransparencyVariant('#ff0000', 50);
      expect(result).toBe('color-mix(in srgb, #ff0000 50%, transparent)');
    });

    it('should handle different opacity percentages', () => {
      const result20 = generateTransparencyVariant('blue', 20);
      const result50 = generateTransparencyVariant('blue', 50);
      const result80 = generateTransparencyVariant('blue', 80);
      
      expect(result20).toBe('color-mix(in srgb, blue 20%, transparent)');
      expect(result50).toBe('color-mix(in srgb, blue 50%, transparent)');
      expect(result80).toBe('color-mix(in srgb, blue 80%, transparent)');
    });
  });

  describe('generateColorVariants', () => {
    it('should generate luminosity variants by default', () => {
      const result = generateColorVariants('blue');
      expect(result.primary).toBe('hsl(204, 88%, 53%)');
      expect(result.primary50).toContain('hsl(204, 88%, ');
      expect(result.primary20).toContain('hsl(204, 88%, ');
    });

    it('should generate transparency variants when specified', () => {
      const result = generateColorVariants('blue', 'transparency');
      expect(result.primary).toBe('hsl(204, 88%, 53%)');
      expect(result.primary50).toBe('color-mix(in srgb, hsl(204, 88%, 53%) 50%, transparent)');
      expect(result.primary20).toBe('color-mix(in srgb, hsl(204, 88%, 53%) 20%, transparent)');
    });

    it('should handle hex colors', () => {
      const result = generateColorVariants('#ff0000', 'luminosity');
      expect(result.primary).toBe('#ff0000');
      expect(result.primary50).toContain('color-mix(in srgb, #ff0000, black 50%)');
      expect(result.primary20).toContain('color-mix(in srgb, #ff0000, black 80%)');
    });

    it('should handle rgb colors', () => {
      const result = generateColorVariants('rgb(255, 0, 0)', 'transparency');
      expect(result.primary).toBe('rgb(255, 0, 0)');
      expect(result.primary50).toBe('color-mix(in srgb, rgb(255, 0, 0) 50%, transparent)');
      expect(result.primary20).toBe('color-mix(in srgb, rgb(255, 0, 0) 20%, transparent)');
    });
  });
});
