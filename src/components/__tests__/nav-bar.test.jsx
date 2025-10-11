/* eslint-env jest */

import { render, screen, getByRole } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import NavBar from '../nav-bar/nav-bar';

test('navbar holds title and username', () => {
  render(
    <MemoryRouter>
      <NavBar title="ohhai" user={{ email: 'me' }} />
    </MemoryRouter>
  );

  screen.getByRole('link', { name: 'ohhai' });
  const userInfo = screen.getByText('me');
  getByRole(userInfo, 'button', { name: '(Log out)' });
});
