/* eslint-env jest */

import React from 'react';
import {shallow} from 'enzyme';
import LoginPanel from '../logIn-form/logIn-form';
import WebMonitoringDb from '../../services/web-monitoring-db';

describe('login-form', () => {
  const waitForNextTurn = () => new Promise(resolve => setTimeout(resolve, 0));

  const getMockedApi = (overrides={}) => Object.assign(
    Object.create(WebMonitoringDb.prototype),
    overrides
  );

  it('Renders a form', () => {
    const panel = shallow(<LoginPanel />);
    expect(panel.find('form').length).toBe(1);
  });

  it('Renders a header', () => {
    const panel = shallow(<LoginPanel />);
    expect(panel.find('h1').text()).toBe('Log In');
  });

  it('Renders an info message', () => {
    const panel = shallow(<LoginPanel />);
    expect(panel.find('p.alert.alert-info').text())
      .toBe('You must be logged in to view pages');
  });

  it('Renders a label and input for email', () => {
    const panel = shallow(<LoginPanel />);
    const label = panel.find('label').at(0);

    expect(label.text()).toBe('E-mail Address:');
    expect(label.find('input').props()).toMatchObject({type: 'text', name: 'email'});
  });

  it('Renders a label and input for password', () => {
    const panel = shallow(<LoginPanel />);
    const label = panel.find('label').at(1);

    expect(label.text()).toBe('Password:');
    expect(label.find('input').props()).toMatchObject({type: 'password', name: 'password'});
  });

  it('Renders a submit button for the form', () => {
    const panel = shallow(<LoginPanel />);
    expect(panel.find('form input[type="submit"]').length).toBe(1);
  });

  it('Renders a cancel button', () => {
    const panel = shallow(<LoginPanel />);
    expect(panel.findWhere(el => el.type() === 'button' && el.text() === 'Cancel').length).toBe(1);
  });

  it('Calls props.cancelLogin when the cancel button is clicked', () => {
    const cancelLogin = jest.fn();
    const panel = shallow(<LoginPanel cancelLogin={cancelLogin} />);
    const cancelButton = panel.findWhere(el => el.type() === 'button' && el.text() === 'Cancel');

    cancelButton.simulate('click', {preventDefault: () => {}});
    expect(cancelLogin).toHaveBeenCalled();
  });

  describe('when the form is submitted', () => {
    it('Calls "logIn" on the api service if email and password are present', () => {
      const api = getMockedApi({logIn: jest.fn(() => Promise.resolve({}))});
      const panel = shallow(<LoginPanel />, {context: {api}});

      panel.find('input[name="email"]')
        .simulate('change', {currentTarget: {value: 'aaa@aaa.aaa'}});
      panel.find('input[name="password"]')
        .simulate('change', {currentTarget: {value: 'password'}});

      panel.find('form').simulate('submit', {preventDefault: () => {}});

      expect(api.logIn).toHaveBeenCalledWith('aaa@aaa.aaa', 'password');
    });

    it('Calls props.onLogin if the api call is successful', () => {
      const onLogin = jest.fn();
      const panel = shallow(
        <LoginPanel onLogin={onLogin} />,
        {context: {api: getMockedApi({logIn: () => Promise.resolve({id: 5})})}}
      );

      panel.find('input[name="email"]')
        .simulate('change', {currentTarget: {value: 'aaa@aaa.aaa'}});
      panel.find('input[name="password"]')
        .simulate('change', {currentTarget: {value: 'password'}});

      panel.find('form').simulate('submit', {preventDefault: () => {}});

      waitForNextTurn().then(() => {
        expect(onLogin).toHaveBeenCalledWith({id: 5});
      });
    });

    it('Displays an error if the api call is unsuccessful', () => {
      const onLogin = jest.fn();
      const api = getMockedApi({logIn: () => Promise.reject(new Error('Login unsuccessful'))});
      const panel = shallow(<LoginPanel onLogin={onLogin} />, {context: {api}});

      panel.find('input[name="email"]')
        .simulate('change', {currentTarget: {value: 'aaa@aaa.aaa'}});
      panel.find('input[name="password"]')
        .simulate('change', {currentTarget: {value: 'password'}});

      panel.find('form').simulate('submit', {preventDefault: () => {}});

      waitForNextTurn().then(() => {
        expect(panel.find('.alert.alert-danger').text()).toBe('Login unsuccessful');
      });
    });

    it('Does not call "logIn" if email and password are not both present', () => {
      const api = getMockedApi({logIn: jest.fn(() => Promise.resolve({}))});
      const panel = shallow(<LoginPanel />, {context: {api}});

      panel.find('input[name="email"]')
        .simulate('change', {currentTarget: {value: 'aaa@aaa.aaa'}});

      panel.find('form').simulate('submit', {preventDefault: () => {}});

      expect(api.logIn).not.toHaveBeenCalled();
      expect(panel.find('.alert.alert-danger').text())
        .toBe('Please enter an e-mail and password.');
    });
  });
});
