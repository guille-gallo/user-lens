import { hasValidCoordinates } from '../index';

describe('Utility Functions', () => {
  describe('hasValidCoordinates', () => {
    it('should return true for valid coordinates', () => {
      expect(hasValidCoordinates('40.7128', '-74.0060')).toBe(true);
      expect(hasValidCoordinates('-90', '180')).toBe(true);
      expect(hasValidCoordinates('90', '-180')).toBe(true);
    });

    it('should return false for null or undefined coordinates', () => {
      expect(hasValidCoordinates(null, '-74.0060')).toBe(false);
      expect(hasValidCoordinates('40.7128', null)).toBe(false);
      expect(hasValidCoordinates(null, null)).toBe(false);
      expect(hasValidCoordinates(undefined, '-74.0060')).toBe(false);
      expect(hasValidCoordinates('40.7128', undefined)).toBe(false);
    });

    it('should return false for empty strings', () => {
      expect(hasValidCoordinates('', '-74.0060')).toBe(false);
      expect(hasValidCoordinates('40.7128', '')).toBe(false);
      expect(hasValidCoordinates('', '')).toBe(false);
    });

    it('should return false for whitespace-only strings', () => {
      expect(hasValidCoordinates('   ', '-74.0060')).toBe(false);
      expect(hasValidCoordinates('40.7128', '   ')).toBe(false);
    });

    it('should return false for zero coordinates', () => {
      expect(hasValidCoordinates('0', '-74.0060')).toBe(false);
      expect(hasValidCoordinates('40.7128', '0')).toBe(false);
      expect(hasValidCoordinates('0', '0')).toBe(false);
    });

    it('should return false for invalid number strings', () => {
      expect(hasValidCoordinates('not-a-number', '-74.0060')).toBe(false);
      expect(hasValidCoordinates('40.7128', 'invalid')).toBe(false);
      expect(hasValidCoordinates('abc', 'xyz')).toBe(false);
    });

    it('should return false for coordinates out of valid range', () => {
      expect(hasValidCoordinates('91', '0')).toBe(false); // lat > 90
      expect(hasValidCoordinates('-91', '0')).toBe(false); // lat < -90
      expect(hasValidCoordinates('0', '181')).toBe(false); // lng > 180
      expect(hasValidCoordinates('0', '-181')).toBe(false); // lng < -180
    });

    it('should handle edge cases at valid boundaries', () => {
      expect(hasValidCoordinates('90', '180')).toBe(true);
      expect(hasValidCoordinates('-90', '-180')).toBe(true);
      expect(hasValidCoordinates('89.99', '179.99')).toBe(true);
      expect(hasValidCoordinates('-89.99', '-179.99')).toBe(true);
    });

    it('should handle decimal coordinates', () => {
      expect(hasValidCoordinates('40.7128', '-74.0060')).toBe(true);
      expect(hasValidCoordinates('-37.3159', '81.1496')).toBe(true);
      expect(hasValidCoordinates('25.123456', '-80.987654')).toBe(true);
    });

    it('should trim whitespace before validation', () => {
      expect(hasValidCoordinates(' 40.7128 ', ' -74.0060 ')).toBe(true);
      expect(hasValidCoordinates('\t40.7128\t', '\n-74.0060\n')).toBe(true);
    });
  });
});
