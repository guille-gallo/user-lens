import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { Header } from '../components/layout/Header';
import { 
  SearchBar, 
  Button, 
  DataTable, 
  ConfirmDialog, 
  Toast, 
  UserForm 
} from '../components/ui';
import type { User } from '../services/userService';
import './UsersPage.scss';

/**
 * Users Page - Main page for user management
 */
export const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  
  const {
    users,
    loading,
    error,
    searchTerm,
    sortField,
    sortOrder,
    setSearchTerm,
    setSorting,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    getFilteredAndSortedUsers
  } = useUserStore();

  // State for modals
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // New states for CRUD operations
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Fetch users on component mount if not already loaded
  useEffect(() => {
    if (users.length === 0) {
      fetchUsers(); // Only fetch if no cached data
    }
  }, [fetchUsers, users.length]);

  // Get filtered and sorted users
  const displayUsers = getFilteredAndSortedUsers();

  const handleSort = (field: keyof User, order: 'asc' | 'desc') => {
    setSorting(field, order);
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteUser(userToDelete.id);
      setSuccessMessage(`${userToDelete.name} has been deleted successfully`);
      setShowSuccessToast(true);
      setUserToDelete(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
      // Error is already handled by the store with rollback
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (!isDeleting) {
      setUserToDelete(null);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowUserForm(true);
  };

  const handleView = (user: User) => {
    navigate(`/users/${user.id}`);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowUserForm(true);
  };

  // Handle form submission for both create and update
  const handleFormSubmit = async (userData: Omit<User, 'id'> | Partial<User>) => {
    setIsFormLoading(true);
    try {
      if (selectedUser) {
        // Update existing user
        await updateUser(selectedUser.id, userData as Partial<User>);
        setSuccessMessage(`${userData.name || selectedUser.name} has been updated successfully`);
      } else {
        // Create new user
        await createUser(userData as Omit<User, 'id'>);
        setSuccessMessage(`${userData.name} has been created successfully`);
      }
      setShowSuccessToast(true);
      setShowUserForm(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  return (
    <div className="users-page">
      <Header
        title="User Management"
        subtitle={`Managing ${users.length} users from JSONPlaceholder API`}
        actions={
          <div className="users-page__header-actions">
            <Button
              variant="outline"
              onClick={handleRefresh}
              loading={loading}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={handleAddUser}
            >
              Add User
            </Button>
          </div>
        }
      />

      <div className="users-page__content">
        {error && (
          <div className="users-page__error" role="alert">
            <strong>Error:</strong> {error}
            <Button
              variant="outline"
              size="small"
              onClick={handleRefresh}
              className="users-page__error-retry"
            >
              Retry
            </Button>
          </div>
        )}

        <div className="users-page__controls">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search users by name, email, company..."
            className="users-page__search"
          />
          
          <div className="users-page__stats">
            {searchTerm && (
              <span className="users-page__search-results">
                {displayUsers.length} of {users.length} users
              </span>
            )}
            {!searchTerm && users.length > 0 && (
              <span className="users-page__total-results">
                {users.length} users total
              </span>
            )}
          </div>
        </div>

        <DataTable
          users={displayUsers}
          loading={loading}
          onSort={handleSort}
          sortField={sortField as any}
          sortOrder={sortOrder}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          className="users-page__table"
        />
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={!!userToDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${userToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* User Form Modal */}
      <UserForm
        isOpen={showUserForm}
        onClose={() => {
          setShowUserForm(false);
          setSelectedUser(null);
        }}
        onSubmit={handleFormSubmit}
        user={selectedUser}
        loading={isFormLoading}
      />

      {/* Success toast notification */}
      <Toast
        message={successMessage}
        type="success"
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
    </div>
  );
};
