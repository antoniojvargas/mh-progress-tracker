import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoginPage } from './login-page';
import { apiBaseUrl } from '../services/api-client';

describe('LoginPage', () => {
  it('links the Google sign-in button to the backend OAuth endpoint', () => {
    render(<LoginPage />);

    const link = screen.getByRole('link', { name: /Continuar con Google/ });
    expect(link).toHaveAttribute('href', `${apiBaseUrl}/api/auth/google`);
  });
});
