import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './card';

describe('Card Components', () => {
  it('renders Card with custom className', () => {
    render(<Card className="custom-card">Card Content</Card>);
    const el = screen.getByText('Card Content');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('custom-card');
    expect(el).toHaveClass('rounded-xl');
  });

  it('renders CardHeader with custom className', () => {
    render(<CardHeader className="custom-header">Header</CardHeader>);
    const el = screen.getByText('Header');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('custom-header');
    expect(el).toHaveClass('p-6');
  });

  it('renders CardTitle with custom className', () => {
    render(<CardTitle className="custom-title">Title</CardTitle>);
    const el = screen.getByRole('heading', { name: 'Title' });
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('custom-title');
    expect(el.tagName).toBe('H3');
  });

  it('renders CardDescription with custom className', () => {
    render(
      <CardDescription className="custom-desc">Description</CardDescription>,
    );
    const el = screen.getByText('Description');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('custom-desc');
    expect(el).toHaveClass('text-muted-foreground');
  });

  it('renders CardContent with custom className', () => {
    render(<CardContent className="custom-content">Content</CardContent>);
    const el = screen.getByText('Content');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('custom-content');
    expect(el).toHaveClass('p-6');
  });

  it('renders CardFooter with custom className', () => {
    render(<CardFooter className="custom-footer">Footer</CardFooter>);
    const el = screen.getByText('Footer');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('custom-footer');
    expect(el).toHaveClass('p-6');
  });
});
