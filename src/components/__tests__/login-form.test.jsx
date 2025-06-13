/* eslint-env jest */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPanel from '../login-form/login-form';
import WebMonitoringDb from '../../services/web-monitoring-db';
import { ApiContext } from '../api-context';

describe('login-form', () => {
  const getMockedApi = (overrides = {}) => Object.assign(
    Object.create(WebMonitoringDb.prototype),
    overrides
  );

  it('Renders a label and input for email', () => {
    render(<LoginPanel />);
    const emailInput = screen.getByLabelText(/e-?mail/i);
    expect(emailInput).toHaveAttribute('name', 'email');
    expect(emailInput).toHaveAttribute('type', 'text');
  });

  it('Renders a label and input for password', () => {
    render(<LoginPanel />);
    const passwordLabel = screen.getByLabelText(/password/i);
    expect(passwordLabel).toHaveAttribute('name', 'password');
    expect(passwordLabel).toHaveAttribute('type', 'password');
  });

  it('Renders a submit button for the form', () => {
    render(<LoginPanel />);
    screen.getByRole('button', { name: 'Log In' });
  });

  it('Renders a cancel button', () => {
    render(<LoginPanel />);
    screen.getByRole('button', { name: 'Cancel' });
  });

  it('Calls props.cancelLogin when the cancel button is clicked', () => {
    const cancelLogin = jest.fn();
    render(<LoginPanel cancelLogin={cancelLogin} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(cancelLogin).toHaveBeenCalled();
  });

  describe('when the form is submitted', () => {
    it('Calls "logIn" on the api service if email and password are present', async () => {
      const api = getMockedApi({ logIn: jest.fn().mockResolvedValue({}) });
      render(
        <ApiContext.Provider value={{ api }}>
          <LoginPanel />
        </ApiContext.Provider>
      );

      fireEvent.change(screen.getByLabelText(/e-?mail/i), { target: { value: 'aaa@aaa.aaa' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
      fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

      expect(api.logIn).toHaveBeenCalledWith('aaa@aaa.aaa', 'password');
    });

    it('Calls props.onLogin if the api call is successful', async () => {
      const onLogin = jest.fn();
      const api = getMockedApi({ logIn: jest.fn().mockResolvedValue({ id: 5 }) });
      render(
        <ApiContext.Provider value={{ api }}>
          <LoginPanel onLogin={onLogin} />
        </ApiContext.Provider>
      );

      fireEvent.change(screen.getByLabelText(/e-?mail/i), { target: { value: 'aaa@aaa.aaa' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
      fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

      await waitFor(() => expect(onLogin).toHaveBeenCalledWith({ id: 5 }));
    });

    it('Displays an error if the api call is unsuccessful', async () => {
      const onLogin = jest.fn();
      const api = getMockedApi({ logIn: jest.fn().mockRejectedValue(new Error('Login unsuccessful')) });
      render(
        <ApiContext.Provider value={{ api }}>
          <LoginPanel onLogin={onLogin} />
        </ApiContext.Provider>
      );

      fireEvent.change(screen.getByLabelText(/e-?mail/i), { target: { value: 'aaa@aaa.aaa' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
      fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

      await screen.findByText('Login unsuccessful');
    });

    it('Does not call "logIn" if email and password are not both present', async () => {
      const api = getMockedApi({ logIn: jest.fn().mockResolvedValue({}) });
      render(
        <ApiContext.Provider value={{ api }}>
          <LoginPanel />
        </ApiContext.Provider>
      );

      fireEvent.change(screen.getByLabelText(/e-?mail/i), { target: { value: 'aaa@aaa.aaa' } });
      fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

      expect(api.logIn).not.toHaveBeenCalled();
      await screen.findByText('Please enter an e-mail and password.');
    });
  });
});
