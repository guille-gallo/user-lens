import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { Header } from '../components/layout';
import { Button, LoadingSpinner } from '../components/ui';
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
    fetchUserById
  } = useUserStore();

  const [user, setUser] = useState<User | null>(null);

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
              <div className="user-detail-page__field">
                <span className="user-detail-page__label">Full Name</span>
                <span className="user-detail-page__value">{user.name}</span>
              </div>
              <div className="user-detail-page__field">
                <span className="user-detail-page__label">Username</span>
                <span className="user-detail-page__value">@{user.username}</span>
              </div>
              <div className="user-detail-page__field">
                <span className="user-detail-page__label">Email</span>
                <a 
                  href={`mailto:${user.email}`}
                  className="user-detail-page__value user-detail-page__link"
                >
                  {user.email}
                </a>
              </div>
              <div className="user-detail-page__field">
                <span className="user-detail-page__label">Phone</span>
                <a 
                  href={`tel:${user.phone}`}
                  className="user-detail-page__value user-detail-page__link"
                >
                  {user.phone}
                </a>
              </div>
              <div className="user-detail-page__field">
                <span className="user-detail-page__label">Website</span>
                <a 
                  href={`https://${user.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="user-detail-page__value user-detail-page__link"
                >
                  {user.website} ↗
                </a>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="user-detail-page__section">
            <h3 className="user-detail-page__section-title">
              📍 Address
            </h3>
            <div className="user-detail-page__fields">
              <div className="user-detail-page__field user-detail-page__field--full">
                <span className="user-detail-page__label">Street Address</span>
                <span className="user-detail-page__value">
                  {user.address.street} {user.address.suite}
                </span>
              </div>
              <div className="user-detail-page__field">
                <span className="user-detail-page__label">City</span>
                <span className="user-detail-page__value">{user.address.city}</span>
              </div>
              <div className="user-detail-page__field">
                <span className="user-detail-page__label">Zip Code</span>
                <span className="user-detail-page__value">{user.address.zipcode}</span>
              </div>
              <div className="user-detail-page__field">
                <span className="user-detail-page__label">Coordinates</span>
                <span className="user-detail-page__value">
                  {user.address.geo.lat}, {user.address.geo.lng}
                </span>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="user-detail-page__section">
            <h3 className="user-detail-page__section-title">
              🏢 Company
            </h3>
            <div className="user-detail-page__fields">
              <div className="user-detail-page__field user-detail-page__field--full">
                <span className="user-detail-page__label">Company Name</span>
                <span className="user-detail-page__value user-detail-page__value--highlight">
                  {user.company.name}
                </span>
              </div>
              <div className="user-detail-page__field user-detail-page__field--full">
                <span className="user-detail-page__label">Catch Phrase</span>
                <span className="user-detail-page__value user-detail-page__value--italic">
                  "{user.company.catchPhrase}"
                </span>
              </div>
              <div className="user-detail-page__field user-detail-page__field--full">
                <span className="user-detail-page__label">Business</span>
                <span className="user-detail-page__value">{user.company.bs}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
