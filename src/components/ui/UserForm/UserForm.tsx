import React, { useState, useEffect } from 'react';
import type { User } from '../../../types';
import { ResponsiveEditingContainer } from '../ResponsiveEditingContainer';
import { UserFormFields } from '../UserFormFields';
import { Button } from '../Button/Button';
import { USER_FIELD_CONFIG } from '../../../constants/fieldConfig';
import { useValidation } from '../../../hooks/useValidation';
import './UserForm.scss';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: Omit<User, 'id'> | Partial<User>) => Promise<void>;
  user?: User | null;
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
  const { errors, validateForm: validateFormData, clearAllErrors } = useValidation(USER_FIELD_CONFIG);
  
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
    clearAllErrors();
  }, [user, isOpen, clearAllErrors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFormData(formData)) {
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
      }

      const result = { ...prev };
      let current: any = result;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current) || typeof current[keys[i]] !== 'object') {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return result;
    });
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
      <form id="user-form" onSubmit={handleSubmit} className="user-form" noValidate>
        <UserFormFields
          user={formData}
          errors={errors}
          onChange={handleInputChange}
          disabled={loading}
          mode="form"
        />
      </form>
    </ResponsiveEditingContainer>
  );
};
