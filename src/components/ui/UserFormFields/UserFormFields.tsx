import React from 'react';
import type { User } from '../../../types';
import { FormField } from '../FormField';
import { EditableField } from '../EditableField';
import { PLACEHOLDERS } from '../../../constants/ui';
import { validateField } from '../../../utils/validation';
import { USER_FIELD_CONFIG } from '../../../constants/fieldConfig';

interface UserFormFieldsProps {
  user: Partial<User>;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
  mode?: 'form' | 'inline';
  editingField?: string | null;
  onEditField?: (field: string) => void;
  onSaveField?: (field: string, value: string | number) => Promise<boolean>;
  onCancelEdit?: () => void;
  fieldsGroup?: 'personal' | 'address' | 'company' | 'all';
  showSectionTitles?: boolean;
}

/**
 * Unified User Form Fields Component
 * 
 * Can be used in two modes:
 * - 'form': Traditional form fields (for modals/sidepanels)
 * - 'inline': Editable fields (for detail pages)
 * 
 * Ensures consistent validation, styling, and behavior across the app
 */
export const UserFormFields: React.FC<UserFormFieldsProps> = ({
  user,
  errors,
  onChange,
  disabled = false,
  mode = 'form',
  editingField,
  onEditField,
  onSaveField,
  onCancelEdit,
  fieldsGroup = 'all',
  showSectionTitles = true
}) => {
  
  // Enhanced save handler with validation
  const handleSaveWithValidation = async (field: string, value: string | number): Promise<boolean> => {
    const fieldRules = USER_FIELD_CONFIG[field] || [];
    const validationError = validateField(value, fieldRules);
    if (validationError) {
      return false; // Invalid value, don't save
    }
    return await onSaveField?.(field, value) || false;
  };

  // Render personal information fields
  const renderPersonalFields = () => (
    <>
      <EditableField
        label="Full Name"
        value={user.name || ''}
        field="name"
        isEditing={editingField === 'name'}
        onEdit={() => onEditField?.('name')}
        onSave={(value) => handleSaveWithValidation('name', value)}
        onCancel={() => onCancelEdit?.()}
      />
      <EditableField
        label="Email"
        value={user.email || ''}
        field="email"
        isEditing={editingField === 'email'}
        onEdit={() => onEditField?.('email')}
        onSave={(value) => handleSaveWithValidation('email', value)}
        onCancel={() => onCancelEdit?.()}
      />
      <EditableField
        label="Phone"
        value={user.phone || ''}
        field="phone"
        isEditing={editingField === 'phone'}
        onEdit={() => onEditField?.('phone')}
        onSave={(value) => handleSaveWithValidation('phone', value)}
        onCancel={() => onCancelEdit?.()}
      />
      <EditableField
        label="Website"
        value={user.website || ''}
        field="website"
        isEditing={editingField === 'website'}
        onEdit={() => onEditField?.('website')}
        onSave={(value) => handleSaveWithValidation('website', value)}
        onCancel={() => onCancelEdit?.()}
      />
    </>
  );

  // Render address fields
  const renderAddressFields = () => (
    <>
      <EditableField
        label="Street"
        value={user.address?.street || ''}
        field="address.street"
        isEditing={editingField === 'address.street'}
        onEdit={() => onEditField?.('address.street')}
        onSave={(value) => handleSaveWithValidation('address.street', value)}
        onCancel={() => onCancelEdit?.()}
      />
      <EditableField
        label="Suite"
        value={user.address?.suite || ''}
        field="address.suite"
        isEditing={editingField === 'address.suite'}
        onEdit={() => onEditField?.('address.suite')}
        onSave={(value) => handleSaveWithValidation('address.suite', value)}
        onCancel={() => onCancelEdit?.()}
      />
      <EditableField
        label="City"
        value={user.address?.city || ''}
        field="address.city"
        isEditing={editingField === 'address.city'}
        onEdit={() => onEditField?.('address.city')}
        onSave={(value) => handleSaveWithValidation('address.city', value)}
        onCancel={() => onCancelEdit?.()}
      />
      <EditableField
        label="Zip Code"
        value={user.address?.zipcode || ''}
        field="address.zipcode"
        isEditing={editingField === 'address.zipcode'}
        onEdit={() => onEditField?.('address.zipcode')}
        onSave={(value) => handleSaveWithValidation('address.zipcode', value)}
        onCancel={() => onCancelEdit?.()}
      />
    </>
  );

  // Render company fields
  const renderCompanyFields = () => (
    <>
      <EditableField
        label="Company Name"
        value={user.company?.name || ''}
        field="company.name"
        isEditing={editingField === 'company.name'}
        onEdit={() => onEditField?.('company.name')}
        onSave={(value) => handleSaveWithValidation('company.name', value)}
        onCancel={() => onCancelEdit?.()}
      />
      <EditableField
        label="Catch Phrase"
        value={user.company?.catchPhrase || ''}
        field="company.catchPhrase"
        isEditing={editingField === 'company.catchPhrase'}
        onEdit={() => onEditField?.('company.catchPhrase')}
        onSave={(value) => handleSaveWithValidation('company.catchPhrase', value)}
        onCancel={() => onCancelEdit?.()}
      />
      <EditableField
        label="Business"
        value={user.company?.bs || ''}
        field="company.bs"
        isEditing={editingField === 'company.bs'}
        onEdit={() => onEditField?.('company.bs')}
        onSave={(value) => handleSaveWithValidation('company.bs', value)}
        onCancel={() => onCancelEdit?.()}
      />
    </>
  );

  if (mode === 'inline') {
    // Inline editing mode (UserDetailPage)
    if (fieldsGroup === 'personal') {
      return <>{renderPersonalFields()}</>;
    } else if (fieldsGroup === 'address') {
      return (
        <>
          {showSectionTitles && <h3 className="user-fields__section-title">Address</h3>}
          {renderAddressFields()}
        </>
      );
    } else if (fieldsGroup === 'company') {
      return (
        <>
          {showSectionTitles && <h3 className="user-fields__section-title">Company</h3>}
          {renderCompanyFields()}
        </>
      );
    } else {
      // Render all sections
      return (
        <>
          {/* Personal Information */}
          <div className="user-fields__section">
            <h3 className="user-fields__section-title">Personal Information</h3>
            <div className="user-fields__grid">
              {renderPersonalFields()}
            </div>
          </div>

          {/* Address Information */}
          <div className="user-fields__section">
            <h3 className="user-fields__section-title">Address</h3>
            <div className="user-fields__grid">
              {renderAddressFields()}
            </div>
          </div>

          {/* Company Information */}
          <div className="user-fields__section">
            <h3 className="user-fields__section-title">Company</h3>
            <div className="user-fields__grid">
              {renderCompanyFields()}
            </div>
          </div>
        </>
      );
    }
  }

  // Form mode (UserForm in modals/sidepanels)
  return (
    <>
      {/* Personal Information */}
      <div className="user-fields__section">
        <h3 className="user-fields__section-title">Personal Information</h3>
        <div className="user-fields__row">
          <FormField
            label="Full Name"
            required
            error={errors.name}
            htmlFor="name"
          >
            <input
              id="name"
              type="text"
              className="form-input"
              value={user.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder={PLACEHOLDERS.FULL_NAME}
              disabled={disabled}
            />
          </FormField>

          <FormField
            label="Username"
            required
            error={errors.username}
            htmlFor="username"
          >
            <input
              id="username"
              type="text"
              className="form-input"
              value={user.username || ''}
              onChange={(e) => onChange('username', e.target.value)}
              placeholder={PLACEHOLDERS.USERNAME}
              disabled={disabled}
            />
          </FormField>
        </div>

        <div className="user-fields__row">
          <FormField
            label="Email"
            required
            error={errors.email}
            htmlFor="email"
          >
            <input
              id="email"
              type="text"
              className="form-input"
              value={user.email || ''}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder={PLACEHOLDERS.EMAIL}
              disabled={disabled}
            />
          </FormField>

          <FormField
            label="Phone"
            required
            error={errors.phone}
            htmlFor="phone"
          >
            <input
              id="phone"
              type="text"
              className="form-input"
              value={user.phone || ''}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder={PLACEHOLDERS.PHONE}
              disabled={disabled}
            />
          </FormField>
        </div>

        <FormField
          label="Website"
          error={errors.website}
          htmlFor="website"
        >
          <input
            id="website"
            type="text"
            className="form-input"
            value={user.website || ''}
            onChange={(e) => onChange('website', e.target.value)}
            placeholder={PLACEHOLDERS.WEBSITE}
            disabled={disabled}
          />
        </FormField>
      </div>

      {/* Address Information */}
      <div className="user-fields__section">
        <h3 className="user-fields__section-title">Address</h3>

        <div className="user-fields__row">
          <FormField
            label="Street"
            error={errors['address.street']}
            htmlFor="address.street"
          >
            <input
              id="address.street"
              type="text"
              className="form-input"
              value={user.address?.street || ''}
              onChange={(e) => onChange('address.street', e.target.value)}
              placeholder="Enter street address"
              disabled={disabled}
            />
          </FormField>

          <FormField
            label="Suite"
            error={errors['address.suite']}
            htmlFor="address.suite"
          >
            <input
              id="address.suite"
              type="text"
              className="form-input"
              value={user.address?.suite || ''}
              onChange={(e) => onChange('address.suite', e.target.value)}
              placeholder="Enter suite/apartment"
              disabled={disabled}
            />
          </FormField>
        </div>

        <div className="user-fields__row">
          <FormField
            label="City"
            error={errors['address.city']}
            htmlFor="address.city"
          >
            <input
              id="address.city"
              type="text"
              className="form-input"
              value={user.address?.city || ''}
              onChange={(e) => onChange('address.city', e.target.value)}
              placeholder="Enter city"
              disabled={disabled}
            />
          </FormField>

          <FormField
            label="Zip Code"
            error={errors['address.zipcode']}
            htmlFor="address.zipcode"
          >
            <input
              id="address.zipcode"
              type="text"
              className="form-input"
              value={user.address?.zipcode || ''}
              onChange={(e) => onChange('address.zipcode', e.target.value)}
              placeholder="Enter zip code"
              disabled={disabled}
            />
          </FormField>
        </div>

        <div className="user-fields__row">
          <FormField
            label="Latitude"
            error={errors['address.geo.lat']}
            htmlFor="address.geo.lat"
          >
            <input
              id="address.geo.lat"
              type="text"
              className="form-input"
              value={user.address?.geo?.lat || ''}
              onChange={(e) => onChange('address.geo.lat', e.target.value)}
              placeholder="Enter latitude"
              disabled={disabled}
            />
          </FormField>

          <FormField
            label="Longitude"
            error={errors['address.geo.lng']}
            htmlFor="address.geo.lng"
          >
            <input
              id="address.geo.lng"
              type="text"
              className="form-input"
              value={user.address?.geo?.lng || ''}
              onChange={(e) => onChange('address.geo.lng', e.target.value)}
              placeholder="Enter longitude"
              disabled={disabled}
            />
          </FormField>
        </div>
      </div>

      {/* Company Information */}
      <div className="user-fields__section">
        <h3 className="user-fields__section-title">Company</h3>

        <FormField
          label="Company Name"
          required
          error={errors['company.name']}
          htmlFor="company.name"
        >
          <input
            id="company.name"
            type="text"
            className="form-input"
            value={user.company?.name || ''}
            onChange={(e) => onChange('company.name', e.target.value)}
            placeholder="Enter company name"
            disabled={disabled}
          />
        </FormField>

        <FormField
          label="Company Catch Phrase"
          htmlFor="company.catchPhrase"
        >
          <input
            id="company.catchPhrase"
            type="text"
            className="form-input"
            value={user.company?.catchPhrase || ''}
            onChange={(e) => onChange('company.catchPhrase', e.target.value)}
            placeholder="Enter company catch phrase"
            disabled={disabled}
          />
        </FormField>

        <FormField
          label="Business"
          htmlFor="company.bs"
        >
          <input
            id="company.bs"
            type="text"
            className="form-input"
            value={user.company?.bs || ''}
            onChange={(e) => onChange('company.bs', e.target.value)}
            placeholder="Enter business description"
            disabled={disabled}
          />
        </FormField>
      </div>
    </>
  );
};
