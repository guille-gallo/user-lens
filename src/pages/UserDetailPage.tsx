import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { Header } from '../components/layout';
import { Button, LoadingSpinner, Toast, EditableField } from '../components/ui';
import type { User } from '../services/userService';
import './UserDetailPage.scss';

/**
 * User Detail Page - Showcase individual user information
 */
export const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    users,
    loading,
    error,
    fetchUserById,
    updateUser
  } = useUserStore();

  const [user, setUser] = useState<User | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<User>>({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    
    const userId = parseInt(id, 10);
    if (isNaN(userId)) return;

    // First check if user is already in store
    const existingUser = users.find(u => u.id === userId);
    if (existingUser) {
      setUser(existingUser);
    } else {
      // Fetch from API if not in store
      fetchUserById(userId);
    }
  }, [id, users, fetchUserById]);

  // Update user when store changes
  useEffect(() => {
    if (id) {
      const userId = parseInt(id, 10);
      const updatedUser = users.find(u => u.id === userId);
      if (updatedUser) {
        setUser(updatedUser);
      }
    }
  }, [users, id]);

  const handleBack = () => {
    navigate('/');
  };

  const handleEditField = (field: string) => {
    setEditingField(field);
    setEditValues({ ...editValues, [field]: (user as any)[field] });
  };

  const handleSaveField = async (field: string, value: string | number) => {
    if (!user) return;
    
    let updatedUser = { ...user };
    
    // TODO: move to hook:
    // handle nested field updates:
    if (field.includes('.')) {
      const fieldParts = field.split('.');
      if (fieldParts.length === 2) {
        const [parent, child] = fieldParts;
        updatedUser = {
          ...user,
          [parent]: {
            ...(user as any)[parent],
            [child]: value
          }
        };
      } else if (fieldParts.length === 3) {
        const [parent, nested, child] = fieldParts;
        updatedUser = {
          ...user,
          [parent]: {
            ...(user as any)[parent],
            [nested]: {
              ...(user as any)[parent][nested],
              [child]: value
            }
          }
        };
      }
    } else {
      updatedUser = { ...user, [field]: value };
    }
    
    await updateUser(user.id, updatedUser);
    setEditingField(null);
    setSuccessMessage(`${field.replace(/\./g, ' ')} updated successfully`);
    setShowSuccessToast(true);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValues({});
  };

  if (loading) {
    return (
      <div className="user-detail-page">
        <div className="user-detail-page__loading">
          <LoadingSpinner size="large" message="Loading user details..." />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="user-detail-page">
        <Header
          title="User Not Found"
          subtitle={error || "The requested user could not be found"}
          actions={
            <Button variant="outline" onClick={handleBack}>
              ← Back to Users
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="user-detail-page">
      <Header
        title={user.name}
        subtitle={`@${user.username} • ${user.company.name}`}
        actions={
          <div className="user-detail-page__header-actions">
            <Button
              variant="outline"
              onClick={handleBack}
            >
              ← Back to Users
            </Button>
          </div>
        }
      />

      <div className="user-detail-page__content">
        <div className="user-detail-page__grid">
          {/* Personal Information */}
          <div className="user-detail-page__section">
            <h3 className="user-detail-page__section-title">
              👤 Personal Information
            </h3>
            <div className="user-detail-page__fields">
              <EditableField
                label="Full Name"
                value={user.name}
                field="name"
                isEditing={editingField === 'name'}
                onEdit={() => handleEditField('name')}
                onSave={(value) => handleSaveField('name', value)}
                onCancel={handleCancelEdit}
              />
              <EditableField
                label="Username"
                value={user.username}
                field="username"
                isEditing={editingField === 'username'}
                onEdit={() => handleEditField('username')}
                onSave={(value) => handleSaveField('username', value)}
                onCancel={handleCancelEdit}
              />
              <EditableField
                label="Email"
                value={user.email}
                field="email"
                type="email"
                isEditing={editingField === 'email'}
                onEdit={() => handleEditField('email')}
                onSave={(value) => handleSaveField('email', value)}
                onCancel={handleCancelEdit}
              />
              <EditableField
                label="Phone"
                value={user.phone}
                field="phone"
                type="tel"
                isEditing={editingField === 'phone'}
                onEdit={() => handleEditField('phone')}
                onSave={(value) => handleSaveField('phone', value)}
                onCancel={handleCancelEdit}
              />
              <EditableField
                label="Website"
                value={user.website}
                field="website"
                type="url"
                isEditing={editingField === 'website'}
                onEdit={() => handleEditField('website')}
                onSave={(value) => handleSaveField('website', value)}
                onCancel={handleCancelEdit}
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="user-detail-page__section">
            <h3 className="user-detail-page__section-title">
              📍 Address
            </h3>
            <div className="user-detail-page__fields">
              <EditableField
                label="Street"
                value={user.address.street}
                field="address.street"
                isEditing={editingField === 'address.street'}
                onEdit={() => handleEditField('address.street')}
                onSave={(value) => handleSaveField('address.street', value)}
                onCancel={handleCancelEdit}
              />
              <EditableField
                label="Suite"
                value={user.address.suite}
                field="address.suite"
                isEditing={editingField === 'address.suite'}
                onEdit={() => handleEditField('address.suite')}
                onSave={(value) => handleSaveField('address.suite', value)}
                onCancel={handleCancelEdit}
              />
              <EditableField
                label="City"
                value={user.address.city}
                field="address.city"
                isEditing={editingField === 'address.city'}
                onEdit={() => handleEditField('address.city')}
                onSave={(value) => handleSaveField('address.city', value)}
                onCancel={handleCancelEdit}
              />
              <EditableField
                label="Zip Code"
                value={user.address.zipcode}
                field="address.zipcode"
                isEditing={editingField === 'address.zipcode'}
                onEdit={() => handleEditField('address.zipcode')}
                onSave={(value) => handleSaveField('address.zipcode', value)}
                onCancel={handleCancelEdit}
              />
              <EditableField
                label="Latitude"
                value={user.address.geo.lat}
                field="address.geo.lat"
                type="number"
                isEditing={editingField === 'address.geo.lat'}
                onEdit={() => handleEditField('address.geo.lat')}
                onSave={(value) => handleSaveField('address.geo.lat', value)}
                onCancel={handleCancelEdit}
              />
              <EditableField
                label="Longitude"
                value={user.address.geo.lng}
                field="address.geo.lng"
                type="number"
                isEditing={editingField === 'address.geo.lng'}
                onEdit={() => handleEditField('address.geo.lng')}
                onSave={(value) => handleSaveField('address.geo.lng', value)}
                onCancel={handleCancelEdit}
              />
            </div>
          </div>

          {/* Company Information */}
          <div className="user-detail-page__section">
            <h3 className="user-detail-page__section-title">
              🏢 Company
            </h3>
            <div className="user-detail-page__fields">
              <EditableField
                label="Company Name"
                value={user.company.name}
                field="company.name"
                isEditing={editingField === 'company.name'}
                onEdit={() => handleEditField('company.name')}
                onSave={(value) => handleSaveField('company.name', value)}
                onCancel={handleCancelEdit}
              />
              <EditableField
                label="Catch Phrase"
                value={user.company.catchPhrase}
                field="company.catchPhrase"
                isEditing={editingField === 'company.catchPhrase'}
                onEdit={() => handleEditField('company.catchPhrase')}
                onSave={(value) => handleSaveField('company.catchPhrase', value)}
                onCancel={handleCancelEdit}
              />
              <EditableField
                label="Business"
                value={user.company.bs}
                field="company.bs"
                isEditing={editingField === 'company.bs'}
                onEdit={() => handleEditField('company.bs')}
                onSave={(value) => handleSaveField('company.bs', value)}
                onCancel={handleCancelEdit}
              />
            </div>
          </div>
        </div>
      </div>
      
      <Toast
        message={successMessage}
        type="success"
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
    </div>
  );
};

export default UserDetailPage;
