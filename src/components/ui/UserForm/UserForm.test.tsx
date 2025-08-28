import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserForm } from './UserForm';

// Mock the child components
jest.mock('../Modal', () => ({
  Modal: ({ children, title, isOpen }: any) => 
    isOpen ? <div data-testid="modal"><h1>{title}</h1>{children}</div> : null
}));

jest.mock('../FormField', () => ({
  FormField: ({ children, label }: any) => 
    <div><label>{label}</label>{children}</div>
}));

jest.mock('../Button/Button', () => ({
  Button: ({ children, onClick, type }: any) => 
    <button onClick={onClick} type={type}>{children}</button>
}));

const mockUser = {
  id: 1,
  name: 'John Doe',
  username: 'johndoe',
  email: 'john@example.com',
  phone: '123-456-7890',
  website: 'johndoe.com',
  address: {
    street: '123 Main St',
    suite: 'Apt 1',
    city: 'Anytown',
    zipcode: '12345',
    geo: { lat: '0', lng: '0' }
  },
  company: {
    name: 'Test Corp',
    catchPhrase: 'Test phrase',
    bs: 'Test business'
  }
};

describe('UserForm', () => {
  it('renders in create mode when no user provided', () => {
    const mockOnSubmit = jest.fn();
    const mockOnClose = jest.fn();
    
    render(
      <UserForm 
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );
    
    expect(screen.getByText('Add New User')).toBeInTheDocument();
  });

  it('renders in edit mode when user provided', () => {
    const mockOnSubmit = jest.fn();
    const mockOnClose = jest.fn();
    
    render(
      <UserForm 
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        user={mockUser}
      />
    );
    
    expect(screen.getByText('Edit User')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const mockOnSubmit = jest.fn();
    const mockOnClose = jest.fn();
    
    render(
      <UserForm 
        isOpen={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );
    
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });
});
