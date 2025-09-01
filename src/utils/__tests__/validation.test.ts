import { validateField, validateForm } from '../validation';

describe('Validation Utilities', () => {
  describe('validateField', () => {
    it('should return null for valid input', () => {
      const rules = [{ required: true, message: 'Required' }];
      const result = validateField('test value', rules);
      expect(result).toBeNull();
    });

    it('should return error for required field when empty', () => {
      const rules = [{ required: true, message: 'Field is required' }];
      const result = validateField('', rules);
      expect(result).toBe('Field is required');
    });

    it('should return null for empty rules', () => {
      const result = validateField('any value', []);
      expect(result).toBeNull();
    });

    it('should handle null/undefined input', () => {
      const rules = [{ required: true, message: 'Required' }];
      expect(validateField(null, rules)).toBe('Required');
      expect(validateField(undefined, rules)).toBe('Required');
    });
  });

  describe('validateForm', () => {
    it('should return empty object for valid form', () => {
      const data = { name: 'John' };
      const config = { name: [{ required: true, message: 'Required' }] };
      const errors = validateForm(data, config);
      expect(errors).toEqual({});
    });

    it('should return errors for invalid fields', () => {
      const data = { name: '' };
      const config = { name: [{ required: true, message: 'Name required' }] };
      const errors = validateForm(data, config);
      expect(errors.name).toBe('Name required');
    });

    it('should handle missing fields gracefully', () => {
      const data = {};
      const config = { name: [{ required: true, message: 'Required' }] };
      const errors = validateForm(data, config);
      expect(errors.name).toBe('Required');
    });
  });
});