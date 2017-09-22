/* eslint-env jest */

import React from 'react';
import {shallow} from 'enzyme';
import NavBar from '../nav-bar';

test('navbar holds title and username', () => {
  const navbar = shallow(<NavBar title="ohhai" user={{email: 'me'}} />);
  expect(navbar.find('Link').node.props.children).toEqual('ohhai');
  expect(navbar.find('ul > li').last().text()).toEqual('me (Log out)');
});
