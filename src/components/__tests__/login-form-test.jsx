/* eslint-env jest */

import React from 'react';
import {shallow} from 'enzyme';
import LoginPanel from '../login-form/login-form';
import WebMonitoringDb from '../../services/web-monitoring-db';

describe('login-form', () => {
  const getMockedApi = (overrides={}) => Object.assign(
    Object.create(WebMonitoringDb.prototype),
    overrides
  );

  it('Renders a label and input for email', () => {
    const panel = shallow(<LoginPanel />);
    const label = panel.find('label').at(0);

    expect(label.text()).toMatch(/e-?mail/i);
    expect(label.find('input').props().type).toBe('text');
  });

  it('Renders a label and input for password', () => {
    const panel = shallow(<LoginPanel />);
    const label = panel.find('label').at(1);

    expect(label.text()).toMatch(/password/i);
    expect(label.find('input').props().type).toBe('password');
  });

  it('Renders a submit button for the form', () => {
    const panel = shallow(<LoginPanel />);
    expect(panel.find('form input[type="submit"]').length).toBe(1);
  });

  it('Renders a cancel button', () => {
    const panel = shallow(<LoginPanel />);
    expect(panel.findWhere(el => el.type() === 'button' && (/cancel/i).test(el.text())).length).toBe(1);
  });

  it('Calls props.cancelLogin when the cancel button is clicked', () => {
    const cancelLogin = jest.fn();
    const panel = shallow(<LoginPanel cancelLogin={cancelLogin} />);
    const cancelButton = panel.findWhere(el => el.type() === 'button' && (/cancel/i).test(el.text()));

    cancelButton.simulate('click', document.createEvent('UIEvents'));
    expect(cancelLogin).toHaveBeenCalled();
  });

  describe('when the form is submitted', () => {
    it('Calls "logIn" on the api service if email and password are present', () => {
      const api = getMockedApi({logIn: jest.fn().mockResolvedValue({})});
      const panel = shallow(<LoginPanel />, {context: {api}});

      panel.find('input[name="email"]')
        .simulate('change', {currentTarget: {value: 'aaa@aaa.aaa'}});
      panel.find('input[name="password"]')
        .simulate('change', {currentTarget: {value: 'password'}});

      panel.find('form').simulate('submit', document.createEvent('UIEvents'));

      expect(api.logIn).toHaveBeenCalledWith('aaa@aaa.aaa', 'password');
    });

    it('Calls props.onLogin if the api call is successful', async () => {
      const onLogin = jest.fn();
      const api = getMockedApi({logIn: jest.fn().mockResolvedValue({id: 5})});

      const panel = shallow(<LoginPanel onLogin={onLogin} />, {context: {api}});

      panel.find('input[name="email"]')
        .simulate('change', {currentTarget: {value: 'aaa@aaa.aaa'}});
      panel.find('input[name="password"]')
        .simulate('change', {currentTarget: {value: 'password'}});

      panel.find('form').simulate('submit', document.createEvent('UIEvents'));

      // we have asserted that api.logIn gets called in the previous test.
      // this waits for it to resolve before testing that onLogin gets called
      await api.logIn.mock.results[0].value;
      expect(onLogin).toHaveBeenCalledWith({id: 5});
    });

    it('Displays an error if the api call is unsuccessful', async () => {
      const onLogin = jest.fn();
      const api = getMockedApi({logIn: jest.fn().mockRejectedValue(new Error('Login unsuccessful'))});
      const panel = shallow(<LoginPanel onLogin={onLogin} />, {context: {api}});

      panel.find('input[name="email"]')
        .simulate('change', {currentTarget: {value: 'aaa@aaa.aaa'}});
      panel.find('input[name="password"]')
        .simulate('change', {currentTarget: {value: 'password'}});

      panel.find('form').simulate('submit', document.createEvent('UIEvents'));

      try {
        await api.logIn.mock.results[0].value;
        throw new Error('api.logIn should have rejected'); // failsafe to make sure the assertion runs
      } catch (err) {
        expect(panel.find('.alert.alert-danger').text()).toBe(err.message);
      }
    });

    it('Does not call "logIn" if email and password are not both present', () => {
      const api = getMockedApi({logIn: jest.fn().mockResolvedValue({})});
      const panel = shallow(<LoginPanel />, {context: {api}});

      panel.find('input[name="email"]')
        .simulate('change', {currentTarget: {value: 'aaa@aaa.aaa'}});

      panel.find('form').simulate('submit', document.createEvent('UIEvents'));

      expect(api.logIn).not.toHaveBeenCalled();
      expect(panel.find('.alert.alert-danger').text()).toBeTruthy();
    });
  });
});
