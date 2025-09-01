/**
 * User Field Validation Configuration
 * Centralized validation rules for all user form fields
 */

import { VALIDATION_PATTERNS, VALIDATION_MESSAGES } from './validation';
import type { FieldValidationConfig } from '../utils/validation';

export const USER_FIELD_CONFIG: FieldValidationConfig = {
  // Personal Information
  name: [
    { required: true, message: VALIDATION_MESSAGES.REQUIRED },
    { pattern: VALIDATION_PATTERNS.NAME, message: VALIDATION_MESSAGES.INVALID_NAME }
  ],
  username: [
    { required: true, message: VALIDATION_MESSAGES.REQUIRED }
  ],
  email: [
    { required: true, message: VALIDATION_MESSAGES.REQUIRED },
    { pattern: VALIDATION_PATTERNS.EMAIL, message: VALIDATION_MESSAGES.INVALID_EMAIL }
  ],
  phone: [
    { required: true, message: VALIDATION_MESSAGES.REQUIRED }
  ],
  website: [
    { pattern: VALIDATION_PATTERNS.URL, message: VALIDATION_MESSAGES.INVALID_URL }
  ],

  // Address Information
  'address.street': [],
  'address.suite': [],
  'address.city': [],
  'address.zipcode': [
    { pattern: VALIDATION_PATTERNS.ZIP_CODE, message: VALIDATION_MESSAGES.INVALID_ZIP }
  ],

  // Company Information
  'company.name': [
    { required: true, message: VALIDATION_MESSAGES.REQUIRED }
  ],
  'company.catchPhrase': [],
  'company.bs': []
};
