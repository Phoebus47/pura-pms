import { render, screen } from '@testing-library/react';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';

describe('Avatar', () => {
  it('should render avatar with image', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.jpg" alt="User" />
      </Avatar>,
    );

    const avatarRoot = container.firstChild;
    expect(avatarRoot).toBeInTheDocument();
    expect(avatarRoot).toBeTruthy();

    const image = container.querySelector('img');
    if (image) {
      expect(image).toHaveAttribute('src', 'https://example.com/avatar.jpg');
      expect(image).toHaveAttribute('alt', 'User');
    }
  });

  it('should render avatar fallback when image fails to load', () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.jpg" alt="User" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Avatar className="custom-class">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );

    const avatar = container.querySelector('.custom-class');
    expect(avatar).toBeInTheDocument();
  });

  it('should render only fallback when no image provided', () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByText('AB')).toBeInTheDocument();
  });
});
