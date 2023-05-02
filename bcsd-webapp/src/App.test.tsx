import React from 'react';
import { render, screen } from '@testing-library/react';

import App from './App';

test('renders Province of British Columbia - Staff Directory (BCSD) title', () => {
  render(<App />);
  const linkElement = screen.getByText('Province of British Columbia - Staff Directory (BCSD)');
  expect(linkElement).toBeInTheDocument();
});
