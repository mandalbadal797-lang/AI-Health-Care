import { render, screen } from '@testing-library/react';
import { Button } from './Button';
import { describe, it, expect } from 'vitest';

describe('Button Component', () => {
  it('renders button text correctly', () => {
    render(<Button variant="primary">Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeTruthy();
  });

  it('applies variant and size classes correctly', () => {
    const { container } = render(<Button variant="destructive" size="lg">Delete</Button>);
    const button = container.querySelector('button');
    expect(button?.classList.contains('btn-destructive')).toBe(true);
    expect(button?.classList.contains('btn-lg')).toBe(true);
  });
});
