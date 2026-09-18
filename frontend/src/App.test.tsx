import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '@/App';

describe('App', () => {
  it('renderiza a página inicial com o CTA principal', () => {
    render(<App />);
    expect(screen.getAllByText(/começar a gravar/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/grave sua tela/i);
  });
});
