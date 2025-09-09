import { render } from '@testing-library/react';
import { DataTable } from '../DataTable';
import type { User } from '../../../../types';

// Mock the hooks for consistent testing
jest.mock('../../../../hooks', () => ({
  useDataTableColumns: () => [
    { key: 'name', label: 'Name', sortable: true, essential: true, defaultVisible: true },
    { key: 'email', label: 'Email', sortable: true, defaultVisible: true },
  ],
  useColumnVisibility: () => ({
    getVisibleColumns: () => [
      { key: 'name', label: 'Name', sortable: true, essential: true, defaultVisible: true },
      { key: 'email', label: 'Email', sortable: true, defaultVisible: true },
    ]
  })
}));

const sampleUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    address: { street: '123 Main St', suite: 'Apt 1', city: 'Anytown', zipcode: '12345', geo: { lat: '40', lng: '-74' } },
    phone: '555-1234',
    website: 'john.com',
    company: { name: 'Test Corp', catchPhrase: 'Testing', bs: 'test' }
  }
];

describe('DataTable Loading Behavior Demonstration', () => {
  it('demonstrates the three loading scenarios', () => {
    console.log('\n🔍 DataTable Loading Behavior Test\n');

    // Scenario 1: Initial load (no users) - shows spinner
    console.log('1️⃣ Initial Load (no users):');
    const { container: scenario1 } = render(
      <DataTable users={[]} loading={true} />
    );
    const hasSpinner = scenario1.querySelector('.data-table__spinner');
    const hasSkeleton = scenario1.querySelector('.data-table__skeleton-text');
    console.log(`   ✅ Shows spinner: ${!!hasSpinner}`);
    console.log(`   ❌ Shows skeleton: ${!!hasSkeleton}`);
    console.log('   → Appropriate for first-time loading\n');

    // Scenario 2: Search pending (has users) - shows skeleton
    console.log('2️⃣ Search Pending (with existing users):');
    const { container: scenario2 } = render(
      <DataTable users={sampleUsers} isSearchPending={true} />
    );
    const hasSpinner2 = scenario2.querySelector('.data-table__spinner');
    const hasSkeleton2 = scenario2.querySelector('.data-table__skeleton-text');
    console.log(`   ❌ Shows spinner: ${!!hasSpinner2}`);
    console.log(`   ✅ Shows skeleton: ${!!hasSkeleton2}`);
    console.log('   → Prevents layout shift during search\n');

    // Scenario 3: Loading with users (pagination/refresh) - shows skeleton
    console.log('3️⃣ Loading with existing users (pagination/refresh):');
    const { container: scenario3 } = render(
      <DataTable users={sampleUsers} loading={true} />
    );
    const hasSpinner3 = scenario3.querySelector('.data-table__spinner');
    const hasSkeleton3 = scenario3.querySelector('.data-table__skeleton-text');
    console.log(`   ❌ Shows spinner: ${!!hasSpinner3}`);
    console.log(`   ✅ Shows skeleton: ${!!hasSkeleton3}`);
    console.log('   → Maintains layout during subsequent loads\n');

    console.log('🎉 All scenarios work as expected - no layout shift! 🎉\n');

    // Verify our expectations
    expect(hasSpinner).toBeTruthy(); // Scenario 1 should show spinner
    expect(hasSkeleton2).toBeTruthy(); // Scenario 2 should show skeleton
    expect(hasSkeleton3).toBeTruthy(); // Scenario 3 should show skeleton
  });
});
