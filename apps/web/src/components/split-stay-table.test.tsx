import { render, screen } from '@testing-library/react';
import { SplitStayTable } from './split-stay-table';

describe('SplitStayTable', () => {
  it('renders nothing without at least two stays', () => {
    const { container } = render(<SplitStayTable stays={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders stay segments', () => {
    render(
      <SplitStayTable
        stays={[
          {
            sequence: 0,
            startDate: '2026-08-14',
            endDate: '2026-08-16',
            roomId: 'room-1',
            roomRate: 1000,
            nights: 2,
            room: { id: 'room-1', number: '101' },
            roomType: { id: 'type-a', name: 'Deluxe' },
          },
          {
            sequence: 1,
            startDate: '2026-08-16',
            endDate: '2026-08-18',
            roomId: 'room-2',
            roomRate: 1500,
            nights: 2,
            room: { id: 'room-2', number: '201' },
            roomType: { id: 'type-b', name: 'Suite' },
          },
        ]}
      />,
    );

    expect(screen.getByText('Stay segments')).toBeInTheDocument();
    expect(screen.getByText(/101/)).toBeInTheDocument();
    expect(screen.getByText(/201/)).toBeInTheDocument();
  });
});
