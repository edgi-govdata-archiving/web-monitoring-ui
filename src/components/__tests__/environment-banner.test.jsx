/* eslint-env jest */

import EnvironmentBanner from '../environment-banner/environment-banner';
import { render, screen } from '@testing-library/react';

describe('EnvironmentBanner', () => {
  it('renders nothing in the production environment', () => {
    const { container } = render(
      <EnvironmentBanner apiUrl="https://api.monitoring.envirodatagov.org" />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('displays the correct environment for staging', () => {
    render(
      <EnvironmentBanner apiUrl="https://api.monitoring-staging.envirodatagov.org" />
    );
    screen.getByText(/\bstaging\b/i);
  });
});
