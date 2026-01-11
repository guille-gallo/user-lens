import React, { useEffect, useState, useDeferredValue, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore, useUserMetricsStore } from '../store';
import { useDocumentTitle } from '../hooks';
import { 
  SearchBar, 
  Button, 
  DataTable, 
  ConfirmDialog, 
  Toast, 
  UserForm,
  MetricsOverview,
  Pagination
} from '../components/ui';
import type { User } from '../types';
import './UsersPage.scss';

/**
 * Users Page - Main page for user management
 */

export const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Set document title for accessibility
  useDocumentTitle('Users');
  
  const {
    users,
    loading,
    error,
    searchTerm,
    sortField,
    sortOrder,
    currentPage,
    pageSize,
    totalUsers,
    totalPages,
    hasNextPage,
    hasPrevPage,
    setSearchTerm,
    setSorting,
    setPageSize,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    goToNextPage,
    goToPrevPage,
    goToPage
  } = useUserStore();

  // User metrics store
  const {
    summary: metricsSummary,
    loading: metricsLoading,
    error: metricsError,
    processUserMetrics
  } = useUserMetricsStore();

  // React 18 useDeferredValue for search performance
  // This defers the search term to avoid blocking the input field
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const isPending = searchTerm !== deferredSearchTerm;
  
  // Keep previous users to prevent content flashing during search
  const [staleUsers, setStaleUsers] = useState<User[]>([]);
  
  // Update stale users only when not pending (search is complete)
  useEffect(() => {
    if (!isPending) {
      setStaleUsers(users);
    }
  }, [users, isPending]);
  
  // Use stale data during pending state to prevent layout shift
  const displayUsers = isPending ? staleUsers : users;
  
  // AbortController ref for cancelling previous requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // State for modals
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // New states for CRUD operations
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Single effect to handle initial load and search changes
  useEffect(() => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    
    fetchUsers({ 
      page: 1, 
      limit: 15,
      searchTerm: deferredSearchTerm 
    }, true, abortControllerRef.current.signal); // Always force refresh for search changes
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [deferredSearchTerm, fetchUsers]); // Only depend on deferred search term

  // Fetch user metrics when users change
  useEffect(() => {
    if (users.length > 0) {
      processUserMetrics(users);
    }
  }, [users, processUserMetrics]);

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    setSorting(field, order);
    // Refetch with new sorting
    fetchUsers({ page: 1, sortField: field, sortOrder: order }, true);
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

  // Pagination handlers
  const handlePageChange = (page: number) => {
    goToPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    fetchUsers({ page: 1, limit: size }, true); // Reset to page 1 with new page size
  };

  const handleNextPage = () => {
    goToNextPage();
  };

  const handlePrevPage = () => {
    goToPrevPage();
  };

  return (
    <div className="users-page">
      <div className="users-page__content">
        {error && (
          <div className="users-page__error" role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Company Metrics Overview */}
        <MetricsOverview
          summary={metricsSummary}
          loading={metricsLoading}
          error={metricsError}
        />

                        <div className="users-page__controls">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search users by name, email, company..."
            className={`users-page__search ${isPending ? 'users-page__search--searching' : ''}`}
          />
          
          <div className="users-page__actions">
            <Button
              variant="primary"
              onClick={handleAddUser}
            >
              Add User
            </Button>
          </div>
        </div>

        <DataTable
          users={displayUsers}
          totalUsers={totalUsers}
          loading={loading}
          isSearchPending={isPending}
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          className="users-page__table"
          pageSize={pageSize}
        />

        {/* Pagination moved to table footer following UX best practices */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalUsers}
            pageSize={pageSize}
            hasNext={hasNextPage}
            hasPrev={hasPrevPage}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onNext={handleNextPage}
            onPrev={handlePrevPage}
            loading={loading}
            className="users-page__pagination"
          />
        )}
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
