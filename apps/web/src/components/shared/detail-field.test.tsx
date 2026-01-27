import { render, screen } from '@testing-library/react';
import { DetailField } from './detail-field';

describe('DetailField', () => {
  it('should render label and value', () => {
    render(<DetailField label="Test Label" value={<span>Test Value</span>} />);

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <DetailField
        label="Test Label"
        value="Test Value"
        className="custom-class"
      />,
    );

    const fieldElement = container.firstChild;
    expect(fieldElement).toHaveClass('custom-class');
  });

  it('should render string value', () => {
    render(<DetailField label="Test Label" value="String Value" />);

    expect(screen.getByText('String Value')).toBeInTheDocument();
  });

  it('should render ReactNode value', () => {
    render(
      <DetailField
        label="Test Label"
        value={
          <div>
            <span>Complex</span> <span>Value</span>
          </div>
        }
      />,
    );

    expect(screen.getByText('Complex')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });
});
