import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUserStore } from '../store';
import { useDocumentTitle, useUserFieldEditor, useToast } from '../hooks';
import { LoadingSpinner, Toast, EditableField, Icon } from '../components/ui';
import { formatFieldName, hasValidCoordinates } from '../utils';
import type { User } from '../types';
import './UserDetailPage.scss';

/**
 * User Detail Page - Display individual user information
 */
export const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const {
    users,
    loading,
    error,
    fetchUsers,
    fetchUserById,
    updateUser
  } = useUserStore();

  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Use custom hooks for separated concerns
  const { 
    editingField,
    handleEditField,
    handleSaveField,
    handleCancelEdit
  } = useUserFieldEditor(user, updateUser);

  const { toast, showSuccess, hideToast } = useToast();

  // Set document title based on user data
  useDocumentTitle('Details');

  useEffect(() => {
    if (!id) {
      setIsInitializing(false);
      return;
    }
    
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      setIsInitializing(false);
      return;
    }

    // First check if user is already in store
    const existingUser = users.find(u => u.id === userId);
    
    if (existingUser) {
      setUser(existingUser);
      setIsInitializing(false);
    } else {
      // If we have loaded users but user not found, try individual fetch
      if (users.length > 0) {
        fetchUserById(userId).finally(() => setIsInitializing(false));
      } else {
        // If no users loaded yet, fetch all users first
        fetchUsers().then(() => {
          const foundUser = users.find(u => u.id === userId);
          if (foundUser) {
            setUser(foundUser);
          } else {
            // Only fetch individual user if not found in full list
            fetchUserById(userId);
          }
        }).finally(() => setIsInitializing(false));
      }
    }
  }, [id, users, fetchUserById, fetchUsers, setIsInitializing]);

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

  // Enhanced save handler with toast notification
  const handleSaveFieldWithToast = async (field: string, value: string | number): Promise<boolean> => {
    const success = await handleSaveField(field, value);
    if (success) {
      showSuccess(`${formatFieldName(field)} updated successfully`);
    }
    return success;
  };

  if (loading || isInitializing) {
    return (
      <div className="user-detail-page">
        <div className="user-detail-page__loading">
          <LoadingSpinner size="large" message="Loading user details..." />
        </div>
      </div>
    );
  }

  if (error || (!user && !isInitializing)) {
    return (
      <div className="user-detail-page">
        <div className="user-detail-page__error">
          <h1>User Not Found</h1>
          <p>{error || "The requested user could not be found"}</p>
        </div>
      </div>
    );
  }

  // At this point, user is guaranteed to be non-null
  if (!user) return null;

  return (
    <div className="user-detail-page">
      <div className="user-detail-page__content">
        <div className="user-detail-page__grid">
          {/* Personal Information */}
          <div className="user-detail-page__section user-detail-page__section--personal">
            <div className="user-detail-page__personal-container">
              <div className="user-detail-page__avatar-section">
                <img 
                  src={`https://api.dicebear.com/7.x/personas/svg?seed=${user.username}&backgroundColor=ffffff`}
                  alt={`${user.name} avatar`}
                  className="user-detail-page__avatar"
                />
                <div className="user-detail-page__username">
                  @{user.username}
                </div>
              </div>
              <div className="user-detail-page__fields">
                <EditableField
                  label="Full Name"
                  value={user.name}
                  field="name"
                  isEditing={editingField === 'name'}
                  onEdit={() => handleEditField('name')}
                  onSave={(value) => handleSaveFieldWithToast('name', value)}
                  onCancel={handleCancelEdit}
                />
                <EditableField
                  label="Email"
                  value={user.email}
                  field="email"
                  isEditing={editingField === 'email'}
                  onEdit={() => handleEditField('email')}
                  onSave={(value) => handleSaveFieldWithToast('email', value)}
                  onCancel={handleCancelEdit}
                />
                <EditableField
                  label="Phone"
                  value={user.phone}
                  field="phone"
                  isEditing={editingField === 'phone'}
                  onEdit={() => handleEditField('phone')}
                  onSave={(value) => handleSaveFieldWithToast('phone', value)}
                  onCancel={handleCancelEdit}
                />
                <EditableField
                  label="Website"
                  value={user.website}
                  field="website"
                  isEditing={editingField === 'website'}
                  onEdit={() => handleEditField('website')}
                  onSave={(value) => handleSaveFieldWithToast('website', value)}
                  onCancel={handleCancelEdit}
                />
              </div>
            </div>
          </div>
          
          <div className="user-detail-page__secondary-grid">
            {/* Address Information */}
            <div className="user-detail-page__section">
              <h3 className="user-detail-page__section-title">
                <Icon name="location" size={20} /> Address
              </h3>
              <div className="user-detail-page__fields">
                <EditableField
                  label="Street"
                  value={user.address.street}
                  field="address.street"
                  isEditing={editingField === 'address.street'}
                  onEdit={() => handleEditField('address.street')}
                  onSave={(value) => handleSaveFieldWithToast('address.street', value)}
                  onCancel={handleCancelEdit}
                />
                <EditableField
                  label="Suite"
                  value={user.address.suite}
                  field="address.suite"
                  isEditing={editingField === 'address.suite'}
                  onEdit={() => handleEditField('address.suite')}
                  onSave={(value) => handleSaveFieldWithToast('address.suite', value)}
                  onCancel={handleCancelEdit}
                />
                <EditableField
                  label="City"
                  value={user.address.city}
                  field="address.city"
                  isEditing={editingField === 'address.city'}
                  onEdit={() => handleEditField('address.city')}
                  onSave={(value) => handleSaveFieldWithToast('address.city', value)}
                  onCancel={handleCancelEdit}
                />
                <EditableField
                  label="Zip Code"
                  value={user.address.zipcode}
                  field="address.zipcode"
                  isEditing={editingField === 'address.zipcode'}
                  onEdit={() => handleEditField('address.zipcode')}
                  onSave={(value) => handleSaveFieldWithToast('address.zipcode', value)}
                  onCancel={handleCancelEdit}
                />
                <div className="user-detail-page__field">
                  <span className="user-detail-page__label">Location</span>
                  <div className="user-detail-page__value">
                    {hasValidCoordinates(user.address?.geo?.lat, user.address?.geo?.lng) ? (
                      <a 
                        href={`https://maps.google.com/?q=${user.address.geo.lat},${user.address.geo.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="user-detail-page__map-link"
                      >
                        <Icon name="map" size={16} /> View on Google Maps
                      </a>
                    ) : (
                      <span className="user-detail-page__no-location">
                        <Icon name="location" size={16} /> No location coordinates available
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="user-detail-page__section">
              <h3 className="user-detail-page__section-title">
                <Icon name="business" size={20} /> Company
              </h3>
              <div className="user-detail-page__fields">
                <EditableField
                  label="Company Name"
                  value={user.company.name}
                  field="company.name"
                  isEditing={editingField === 'company.name'}
                  onEdit={() => handleEditField('company.name')}
                  onSave={(value) => handleSaveFieldWithToast('company.name', value)}
                  onCancel={handleCancelEdit}
                />
                <EditableField
                  label="Catch Phrase"
                  value={user.company.catchPhrase}
                  field="company.catchPhrase"
                  isEditing={editingField === 'company.catchPhrase'}
                  onEdit={() => handleEditField('company.catchPhrase')}
                  onSave={(value) => handleSaveFieldWithToast('company.catchPhrase', value)}
                  onCancel={handleCancelEdit}
                />
                <EditableField
                  label="Business"
                  value={user.company.bs}
                  field="company.bs"
                  isEditing={editingField === 'company.bs'}
                  onEdit={() => handleEditField('company.bs')}
                  onSave={(value) => handleSaveFieldWithToast('company.bs', value)}
                  onCancel={handleCancelEdit}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
};

export default UserDetailPage;
