import React, { useState, useEffect } from 'react';
import type { User } from '../../../types';
import { ResponsiveEditingContainer } from '../ResponsiveEditingContainer';
import { FormField } from '../FormField';
import { Button } from '../Button/Button';
import { PLACEHOLDERS } from '../../../constants/ui';
import './UserForm.scss';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: Omit<User, 'id'> | Partial<User>) => Promise<void>;
  user?: User | null; // If provided, it's edit mode
  loading?: boolean;
}

interface FormData {
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

interface FormErrors {
  [key: string]: string;
}

/**
 * User Form component for creating and editing users
 */
export const UserForm: React.FC<UserFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  loading = false
}) => {
  const isEditMode = !!user;
  
  // Initialize form data
  const [formData, setFormData] = useState<FormData>({
    name: '',
    username: '',
    email: '',
    phone: '',
    website: '',
    address: {
      street: '',
      suite: '',
      city: '',
      zipcode: '',
      geo: {
        lat: '',
        lng: ''
      }
    },
    company: {
      name: '',
      catchPhrase: '',
      bs: ''
    }
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Populate form when editing
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        website: user.website || '',
        address: {
          street: user.address?.street || '',
          suite: user.address?.suite || '',
          city: user.address?.city || '',
          zipcode: user.address?.zipcode || '',
          geo: {
            lat: user.address?.geo?.lat || '',
            lng: user.address?.geo?.lng || ''
          }
        },
        company: {
          name: user.company?.name || '',
          catchPhrase: user.company?.catchPhrase || '',
          bs: user.company?.bs || ''
        }
      });
    } else {
      // Reset form for new user
      setFormData({
        name: '',
        username: '',
        email: '',
        phone: '',
        website: '',
        address: {
          street: '',
          suite: '',
          city: '',
          zipcode: '',
          geo: {
            lat: '',
            lng: ''
          }
        },
        company: {
          name: '',
          catchPhrase: '',
          bs: ''
        }
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }

    if (!formData.company.name.trim()) {
      newErrors['company.name'] = 'Company name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else if (keys.length === 2) {
        return {
          ...prev,
          [keys[0]]: {
            ...(prev[keys[0] as keyof FormData] as Record<string, unknown>),
            [keys[1]]: value
          }
        };
      } else if (keys.length === 3) {
        return {
          ...prev,
          [keys[0]]: {
            ...(prev[keys[0] as keyof FormData] as Record<string, unknown>),
            [keys[1]]: {
              ...((prev[keys[0] as keyof FormData] as Record<string, unknown>)[keys[1]] as Record<string, unknown>),
              [keys[2]]: value
            }
          }
        };
      }
      return prev;
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const footer = (
    <>
      <Button
        variant="primary"
        type="submit"
        loading={loading}
        disabled={loading}
        form="user-form"
      >
        {isEditMode ? 'Update User' : 'Create User'}
      </Button>
      <Button
        variant="outline"
        onClick={onClose}
        disabled={loading}
      >
        Cancel
      </Button>
    </>
  );

  return (
    <ResponsiveEditingContainer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit User' : 'Add New User'}
      subtitle={isEditMode ? `Editing ${user?.name}` : 'Add a new user to the system'}
      size="large"
      footer={footer}
      className="user-form-container"
    >
      <form id="user-form" onSubmit={handleSubmit} className="user-form">
        {/* Personal Information */}
        <div className="user-form__section">
          <h3 className="user-form__section-title">Personal Information</h3>
          
          <div className="user-form__row">
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
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={PLACEHOLDERS.FULL_NAME}
                disabled={loading}
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
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder={PLACEHOLDERS.USERNAME}
                disabled={loading}
              />
            </FormField>
          </div>

          <div className="user-form__row">
            <FormField
              label="Email"
              required
              error={errors.email}
              htmlFor="email"
            >
              <input
                id="email"
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                disabled={loading}
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
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
                disabled={loading}
              />
            </FormField>
          </div>

          <FormField
            label="Website"
            htmlFor="website"
          >
            <input
              id="website"
              type="url"
              className="form-input"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="Enter website URL"
              disabled={loading}
            />
          </FormField>
        </div>

        {/* Address Information */}
        <div className="user-form__section">
          <h3 className="user-form__section-title">Address</h3>
          
          <div className="user-form__row">
            <FormField
              label="Street"
              htmlFor="address.street"
            >
              <input
                id="address.street"
                type="text"
                className="form-input"
                value={formData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
                placeholder="Enter street address"
                disabled={loading}
              />
            </FormField>

            <FormField
              label="Suite"
              htmlFor="address.suite"
            >
              <input
                id="address.suite"
                type="text"
                className="form-input"
                value={formData.address.suite}
                onChange={(e) => handleInputChange('address.suite', e.target.value)}
                placeholder="Enter suite/apt"
                disabled={loading}
              />
            </FormField>
          </div>

          <div className="user-form__row">
            <FormField
              label="City"
              htmlFor="address.city"
            >
              <input
                id="address.city"
                type="text"
                className="form-input"
                value={formData.address.city}
                onChange={(e) => handleInputChange('address.city', e.target.value)}
                placeholder="Enter city"
                disabled={loading}
              />
            </FormField>

            <FormField
              label="Zip Code"
              htmlFor="address.zipcode"
            >
              <input
                id="address.zipcode"
                type="text"
                className="form-input"
                value={formData.address.zipcode}
                onChange={(e) => handleInputChange('address.zipcode', e.target.value)}
                placeholder="Enter zip code"
                disabled={loading}
              />
            </FormField>
          </div>
        </div>

        {/* Company Information */}
        <div className="user-form__section">
          <h3 className="user-form__section-title">Company Information</h3>
          
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
              value={formData.company.name}
              onChange={(e) => handleInputChange('company.name', e.target.value)}
              placeholder="Enter company name"
              disabled={loading}
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
              value={formData.company.catchPhrase}
              onChange={(e) => handleInputChange('company.catchPhrase', e.target.value)}
              placeholder="Enter company catch phrase"
              disabled={loading}
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
              value={formData.company.bs}
              onChange={(e) => handleInputChange('company.bs', e.target.value)}
              placeholder="Enter business description"
              disabled={loading}
            />
          </FormField>
        </div>
      </form>
    </ResponsiveEditingContainer>
  );
};
