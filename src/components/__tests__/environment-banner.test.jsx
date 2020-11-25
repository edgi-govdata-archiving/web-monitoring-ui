/* eslint-env jest */

import EnvironmentBanner from '../environment-banner/environment-banner';
import React from 'react';
import { mount } from 'enzyme';

describe('EnvironmentBanner', () => {
  it('renders nothing in the production environment', () => {
    const banner = mount(<EnvironmentBanner
      apiUrl="https://api.monitoring.envirodatagov.org"
    />);

    expect(banner.children().exists()).toBe(false);
  });

  it('displays the correct environment for staging', () => {
    const banner = mount(<EnvironmentBanner
      apiUrl="https://api.monitoring-staging.envirodatagov.org"
    />);

    expect(banner.children().exists()).toBe(true);
    expect(banner.text()).toMatch(/\bstaging\b/);
  });

  it('displays the correct environment for the deprecated staging URL', () => {
    const banner = mount(<EnvironmentBanner
      apiUrl="https://api-staging.monitoring.envirodatagov.org"
    />);

    expect(banner.children().exists()).toBe(true);
    expect(banner.text()).toMatch(/\bstaging\b/);
  });
});
