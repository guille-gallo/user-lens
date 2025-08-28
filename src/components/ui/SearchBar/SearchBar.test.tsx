import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('renders with placeholder text', () => {
    const mockOnChange = jest.fn();
    
    render(
      <SearchBar 
        value="" 
        onChange={mockOnChange} 
        placeholder="Search users..." 
      />
    );
    
    const input = screen.getByPlaceholderText('Search users...');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange when text is entered', () => {
    const mockOnChange = jest.fn();
    
    render(
      <SearchBar 
        value="" 
        onChange={mockOnChange} 
        placeholder="Search users..." 
      />
    );
    
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test search' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('test search');
  });

  it('shows clear button when value is present', () => {
    const mockOnChange = jest.fn();
    
    render(
      <SearchBar 
        value="test" 
        onChange={mockOnChange} 
        placeholder="Search users..." 
      />
    );
    
    const clearButton = screen.getByLabelText('Clear search');
    expect(clearButton).toBeInTheDocument();
  });

  it('clears input when clear button is clicked', () => {
    const mockOnChange = jest.fn();
    
    render(
      <SearchBar 
        value="test" 
        onChange={mockOnChange} 
        placeholder="Search users..." 
      />
    );
    
    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);
    
    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('has proper accessibility attributes', () => {
    const mockOnChange = jest.fn();
    
    render(
      <SearchBar 
        value="" 
        onChange={mockOnChange} 
        placeholder="Search users..." 
      />
    );
    
    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('aria-label', 'Search input');
  });
});
