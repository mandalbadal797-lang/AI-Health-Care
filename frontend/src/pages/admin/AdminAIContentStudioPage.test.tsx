import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AdminAIContentStudioPage } from './AdminAIContentStudioPage';
import { describe, it, expect } from 'vitest';

describe('AdminAIContentStudioPage Component', () => {
  it('renders AI studio title and mandatory human review policy warning without throwing', () => {
    render(
      <BrowserRouter>
        <AdminAIContentStudioPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/AI Content Creation & Intelligence Studio/i)).toBeTruthy();
    expect(screen.getByText(/Mandatory Human Review Policy/i)).toBeTruthy();
  });
});
