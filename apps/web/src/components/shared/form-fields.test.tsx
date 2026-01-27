import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextInput, NumberInput, Textarea, Select } from './form-fields';

describe('FormFields', () => {
  describe('TextInput', () => {
    it('should render with label', () => {
      render(
        <TextInput
          id="test-input"
          label="Test Label"
          value=""
          onChange={() => {}}
        />,
      );

      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    });

    it('should show required indicator', () => {
      render(
        <TextInput
          id="test-input"
          label="Test Label"
          value=""
          onChange={() => {}}
          required
        />,
      );

      expect(screen.getByText('Test Label *')).toBeInTheDocument();
    });

    it('should call onChange when value changes', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      let value = '';

      const { rerender } = render(
        <TextInput
          id="test-input"
          label="Test Label"
          value={value}
          onChange={(v) => {
            value = v;
            handleChange(v);
            rerender(
              <TextInput
                id="test-input"
                label="Test Label"
                value={value}
                onChange={(v) => {
                  value = v;
                  handleChange(v);
                }}
              />,
            );
          }}
        />,
      );

      const input = screen.getByLabelText('Test Label') as HTMLInputElement;
      await user.type(input, 'test');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should display error message', () => {
      render(
        <TextInput
          id="test-input"
          label="Test Label"
          value=""
          onChange={() => {}}
          error="Error message"
        />,
      );

      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toHaveAttribute(
        'role',
        'alert',
      );
    });

    it('should support different input types', () => {
      const { rerender } = render(
        <TextInput
          id="test-input"
          label="Email"
          value=""
          onChange={() => {}}
          type="email"
        />,
      );

      expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');

      rerender(
        <TextInput
          id="test-input"
          label="Phone"
          value=""
          onChange={() => {}}
          type="tel"
        />,
      );

      expect(screen.getByLabelText('Phone')).toHaveAttribute('type', 'tel');
    });
  });

  describe('NumberInput', () => {
    it('should render with label', () => {
      render(
        <NumberInput
          id="test-number"
          label="Number Label"
          value={undefined}
          onChange={() => {}}
        />,
      );

      expect(screen.getByLabelText('Number Label')).toBeInTheDocument();
    });

    it('should call onChange with number value', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      let value: number | undefined = undefined;

      const { rerender } = render(
        <NumberInput
          id="test-number"
          label="Number Label"
          value={value}
          onChange={(v) => {
            value = v;
            handleChange(v);
            rerender(
              <NumberInput
                id="test-number"
                label="Number Label"
                value={value}
                onChange={(v) => {
                  value = v;
                  handleChange(v);
                }}
              />,
            );
          }}
        />,
      );

      const input = screen.getByLabelText('Number Label') as HTMLInputElement;
      await user.type(input, '123');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should handle min and max constraints', () => {
      render(
        <NumberInput
          id="test-number"
          label="Number Label"
          value={undefined}
          onChange={() => {}}
          min={1}
          max={100}
        />,
      );

      const input = screen.getByLabelText('Number Label');
      expect(input).toHaveAttribute('min', '1');
      expect(input).toHaveAttribute('max', '100');
    });
  });

  describe('Textarea', () => {
    it('should render with label', () => {
      render(
        <Textarea
          id="test-textarea"
          label="Textarea Label"
          value=""
          onChange={() => {}}
        />,
      );

      expect(screen.getByLabelText('Textarea Label')).toBeInTheDocument();
    });

    it('should call onChange when value changes', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      let value = '';

      const { rerender } = render(
        <Textarea
          id="test-textarea"
          label="Textarea Label"
          value={value}
          onChange={(v) => {
            value = v;
            handleChange(v);
            rerender(
              <Textarea
                id="test-textarea"
                label="Textarea Label"
                value={value}
                onChange={(v) => {
                  value = v;
                  handleChange(v);
                }}
              />,
            );
          }}
        />,
      );

      const textarea = screen.getByLabelText(
        'Textarea Label',
      ) as HTMLTextAreaElement;
      await user.type(textarea, 'test content');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should support rows prop', () => {
      render(
        <Textarea
          id="test-textarea"
          label="Textarea Label"
          value=""
          onChange={() => {}}
          rows={5}
        />,
      );

      expect(screen.getByLabelText('Textarea Label')).toHaveAttribute(
        'rows',
        '5',
      );
    });
  });

  describe('Select', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ];

    it('should render with label', () => {
      render(
        <Select
          id="test-select"
          label="Select Label"
          value=""
          onChange={() => {}}
          options={options}
        />,
      );

      expect(screen.getByLabelText('Select Label')).toBeInTheDocument();
    });

    it('should render all options', () => {
      render(
        <Select
          id="test-select"
          label="Select Label"
          value=""
          onChange={() => {}}
          options={options}
        />,
      );

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('should call onChange when selection changes', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(
        <Select
          id="test-select"
          label="Select Label"
          value=""
          onChange={handleChange}
          options={options}
        />,
      );

      const select = screen.getByLabelText('Select Label');
      await user.selectOptions(select, 'option2');

      expect(handleChange).toHaveBeenCalledWith('option2');
    });

    it('should be disabled when disabled prop is true', () => {
      render(
        <Select
          id="test-select"
          label="Select Label"
          value=""
          onChange={() => {}}
          options={options}
          disabled
        />,
      );

      expect(screen.getByLabelText('Select Label')).toBeDisabled();
    });
  });
});
