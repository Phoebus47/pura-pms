/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropertySelector } from './property-selector';
import { propertiesAPI } from '@/lib/api';
import { toast } from '@/lib/toast';

vi.mock('@/lib/api', () => ({
  propertiesAPI: {
    getAll: vi.fn(),
  },
}));

vi.mock('@/lib/toast', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('PropertySelector', () => {
  const mockProperties = [
    { id: '1', name: 'Property 1', address: '', phone: '', email: '' },
    { id: '2', name: 'Property 2', address: '', phone: '', email: '' },
  ];

  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', () => {
    (propertiesAPI.getAll as any).mockImplementation(
      () => new Promise(() => {}),
    );

    render(<PropertySelector value="" onChange={mockOnChange} />);

    expect(screen.getByText('Loading properties...')).toBeInTheDocument();
  });

  it('should load and display properties', async () => {
    (propertiesAPI.getAll as any).mockResolvedValue(mockProperties);

    render(<PropertySelector value="" onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText('Property 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Property 2')).toBeInTheDocument();
  });

  it('should call onChange when property is selected', async () => {
    (propertiesAPI.getAll as any).mockResolvedValue(mockProperties);

    const user = userEvent.setup();

    render(<PropertySelector value="" onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText('Property 1')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, '1');

    expect(mockOnChange).toHaveBeenCalledWith('1');
  });

  it('should display selected property value', async () => {
    (propertiesAPI.getAll as any).mockResolvedValue(mockProperties);

    render(<PropertySelector value="1" onChange={mockOnChange} />);

    await waitFor(() => {
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('1');
    });
  });

  it('should handle required prop', async () => {
    (propertiesAPI.getAll as any).mockResolvedValue(mockProperties);

    render(<PropertySelector value="" onChange={mockOnChange} required />);

    await waitFor(() => {
      const select = screen.getByRole('combobox');
      expect(select).toBeRequired();
    });
  });

  it('should handle id prop', async () => {
    (propertiesAPI.getAll as any).mockResolvedValue(mockProperties);

    render(
      <PropertySelector
        id="property-select"
        value=""
        onChange={mockOnChange}
      />,
    );

    await waitFor(() => {
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('id', 'property-select');
    });
  });

  it('should handle API error', async () => {
    (propertiesAPI.getAll as any).mockRejectedValue(new Error('API Error'));

    render(<PropertySelector value="" onChange={mockOnChange} />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load properties');
    });
  });
});
