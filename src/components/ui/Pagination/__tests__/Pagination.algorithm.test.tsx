import { render, screen } from '@testing-library/react';
import { Pagination } from '../Pagination';

// Mock the Button and Icon components
jest.mock('../../Button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>
}));

jest.mock('../../Icon', () => ({
  Icon: ({ name }: any) => <span data-testid={`icon-${name}`} />
}));

describe('Pagination Algorithm', () => {
  const defaultProps = {
    pageSize: 15,
    hasNext: true,
    hasPrev: false,
    onPageChange: jest.fn(),
    onPageSizeChange: jest.fn(),
    onNext: jest.fn(),
    onPrev: jest.fn(),
    totalItems: 100,
  };

  it('shows all pages when total pages <= 7', () => {
    render(
      <Pagination
        {...defaultProps}
        currentPage={3}
        totalPages={5}
      />
    );

    // Should show pages 1, 2, 3, 4, 5
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('shows correct pattern when current page is near beginning', () => {
    render(
      <Pagination
        {...defaultProps}
        currentPage={2}
        totalPages={10}
      />
    );

    // Should show: 1, 2, 3, 4, 5, ..., 10
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('shows correct pattern when current page is in middle', () => {
    render(
      <Pagination
        {...defaultProps}
        currentPage={6}
        totalPages={10}
      />
    );

    // Should show: 1, ..., 5, 6, 7, ..., 10
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getAllByText('...').length).toBe(2);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('shows correct pattern when current page is near end', () => {
    render(
      <Pagination
        {...defaultProps}
        currentPage={9}
        totalPages={10}
      />
    );

    // Should show: 1, ..., 6, 7, 8, 9, 10
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('highlights current page correctly', () => {
    render(
      <Pagination
        {...defaultProps}
        currentPage={5}
        totalPages={10}
      />
    );

    const currentPageButton = screen.getByRole('button', { name: /go to page 5/i });
    expect(currentPageButton).toHaveAttribute('aria-current', 'page');
  });
});
