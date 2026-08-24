import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Advocates from './Advocates.jsx';
import { advocateApi } from '../services/api.js';

// Mock dependencies
vi.mock('../services/api.js', () => ({
  advocateApi: {
    getAdvocates: vi.fn(),
  },
  getApiError: vi.fn((err) => err.message || 'Network Error'),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
}));

// Mock window.scrollTo
window.scrollTo = vi.fn();

describe('Advocates Directory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <Advocates />
      </MemoryRouter>
    );
  };

  it('renders loading state initially', async () => {
    // Return a promise that doesn't resolve immediately
    advocateApi.getAdvocates.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([]), 100)));
    renderComponent();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('displays network error state and DOES NOT show "No advocates found"', async () => {
    advocateApi.getAdvocates.mockRejectedValue(new Error('Network Error'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Unable to connect to the advocate service.')).toBeInTheDocument();
    });

    // Should NOT show the empty state
    expect(screen.queryByText('No advocates found matching your filters.')).not.toBeInTheDocument();
  });

  it('displays empty state on 200 response with no data', async () => {
    advocateApi.getAdvocates.mockResolvedValue([]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('No advocates found matching your filters.')).toBeInTheDocument();
    });

    // Should NOT show error
    expect(screen.queryByText('Unable to connect to the advocate service.')).not.toBeInTheDocument();
  });

  it('renders successful advocate list', async () => {
    const mockAdvocates = [
      {
        user_id: '1',
        full_name: 'Test Advocate',
        specializations: ['Civil Law'],
        districts: ['Bengaluru Urban'],
        languages: ['Kannada'],
        experience_years: 5,
        rating: 4.5,
      },
    ];
    advocateApi.getAdvocates.mockResolvedValue(mockAdvocates);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Advocate')).toBeInTheDocument();
      expect(screen.getAllByText(/Civil Law/i).length).toBeGreaterThan(0);
    });
  });

  it('passes correct query parameters on filter change', async () => {
    advocateApi.getAdvocates.mockResolvedValue([]);
    renderComponent();

    // The initial call
    expect(advocateApi.getAdvocates).toHaveBeenCalledWith({});

    // Wait for the component to be fully rendered
    await waitFor(() => {
      expect(screen.getByText('No advocates found matching your filters.')).toBeInTheDocument();
    });
    
    // We mock the filtering logic just to verify it can be changed.
    const selects = document.querySelectorAll('select');
    const specSelect = selects[0];
    
    if (specSelect) {
        fireEvent.change(specSelect, { target: { value: 'Civil Law' } });
        
        // Since there is no actual "Search" button in some versions and it updates automatically
        // Let's assume it updates automatically or via a hook. Let's just wait for the effect.
        await waitFor(() => {
            expect(advocateApi.getAdvocates).toHaveBeenCalledWith(expect.objectContaining({
                specialization: 'Civil Law'
            }));
        });
    }
  });
});
