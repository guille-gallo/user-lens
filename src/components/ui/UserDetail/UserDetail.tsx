import React from 'react';
import type { User } from '../../../services/userService';
import { Modal } from '../Modal';
import { Button } from '../Button/Button';
import './UserDetail.scss';

interface UserDetailProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  user: User | null;
}

/**
 * User Detail component for showcasing individual user information
 */
export const UserDetail: React.FC<UserDetailProps> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  user
}) => {
  if (!user) return null;

  const footer = (
    <>
      <Button
        variant="outline"
        onClick={onClose}
      >
        Close
      </Button>
      <div className="user-detail__footer-actions">
        {onEdit && (
          <Button
            variant="secondary"
            onClick={onEdit}
          >
            Edit User
          </Button>
        )}
        {onDelete && (
          <Button
            variant="outline"
            className="button--danger"
            onClick={onDelete}
          >
            Delete User
          </Button>
        )}
      </div>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`User Details - ${user.name}`}
      size="large"
      footer={footer}
      className="user-detail-modal"
    >
      <div className="user-detail">
        {/* Personal Information */}
        <div className="user-detail__section">
          <h3 className="user-detail__section-title">
            👤 Personal Information
          </h3>
          <div className="user-detail__grid">
            <div className="user-detail__field">
              <span className="user-detail__label">Full Name:</span>
              <span className="user-detail__value">{user.name}</span>
            </div>
            <div className="user-detail__field">
              <span className="user-detail__label">Username:</span>
              <span className="user-detail__value">@{user.username}</span>
            </div>
            <div className="user-detail__field">
              <span className="user-detail__label">Email:</span>
              <a 
                href={`mailto:${user.email}`} 
                className="user-detail__value user-detail__link"
              >
                {user.email}
              </a>
            </div>
            <div className="user-detail__field">
              <span className="user-detail__label">Phone:</span>
              <a 
                href={`tel:${user.phone}`} 
                className="user-detail__value user-detail__link"
              >
                {user.phone}
              </a>
            </div>
            <div className="user-detail__field">
              <span className="user-detail__label">Website:</span>
              <a 
                href={`https://${user.website}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="user-detail__value user-detail__link"
              >
                {user.website} ↗
              </a>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="user-detail__section">
          <h3 className="user-detail__section-title">
            📍 Address
          </h3>
          <div className="user-detail__grid">
            <div className="user-detail__field user-detail__field--full">
              <span className="user-detail__label">Street Address:</span>
              <span className="user-detail__value">
                {user.address.street} {user.address.suite}
              </span>
            </div>
            <div className="user-detail__field">
              <span className="user-detail__label">City:</span>
              <span className="user-detail__value">{user.address.city}</span>
            </div>
            <div className="user-detail__field">
              <span className="user-detail__label">Zip Code:</span>
              <span className="user-detail__value">{user.address.zipcode}</span>
            </div>
            <div className="user-detail__field">
              <span className="user-detail__label">Coordinates:</span>
              <span className="user-detail__value">
                {user.address.geo.lat}, {user.address.geo.lng}
              </span>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="user-detail__section">
          <h3 className="user-detail__section-title">
            🏢 Company
          </h3>
          <div className="user-detail__grid">
            <div className="user-detail__field user-detail__field--full">
              <span className="user-detail__label">Company Name:</span>
              <span className="user-detail__value user-detail__value--highlight">
                {user.company.name}
              </span>
            </div>
            <div className="user-detail__field user-detail__field--full">
              <span className="user-detail__label">Catch Phrase:</span>
              <span className="user-detail__value user-detail__value--italic">
                "{user.company.catchPhrase}"
              </span>
            </div>
            <div className="user-detail__field user-detail__field--full">
              <span className="user-detail__label">Business:</span>
              <span className="user-detail__value">{user.company.bs}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
