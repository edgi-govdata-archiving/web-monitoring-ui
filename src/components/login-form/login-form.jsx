import { Component } from 'react';
import { ApiContext } from '../api-context';

import baseStyles from '../../css/base.css';
import formStyles from './login-form.css';

/**
 * @typedef {Object} LoginFormProps
 * @property {Function} cancelLogin Should match `() => void`
 * @property {Function} onLogin Callback when a user has logged in successfully.
 *   Its signature should match `user => void`
 */

/**
 * @typedef LoginFormState
 * @property {string} email
 * @property {string} password
 * @property {Object} [error]
 */

/**
 * Displays a login form and communicates with the API to obtain and save
 * session tokens for the user when they log in.
 *
 * @class LoginPannel
 * @extends {Component}
 */
export default class LoginPanel extends Component {
  static contextType = ApiContext;

  constructor (props) {
    super(props);
    this.state = { email: '', password: '', error: null };
    this._updateEmail = this._updateEmail.bind(this);
    this._updatePassword = this._updatePassword.bind(this);
    this._logIn = this._logIn.bind(this);
    this._cancel = this._cancel.bind(this);
  }

  render () {
    return (
      <form className={formStyles.form} onSubmit={this._logIn}>
        <h1 className={formStyles.title}>Log In</h1>
        <p className={[baseStyles.alert, baseStyles.alertInfo].join(' ')} role="alert">
          You must be logged in to view pages
        </p>
        {this._renderError()}

        <label className={formStyles.group}>
          E-mail Address:
          <input className={formStyles.input} type="text" name="email" onChange={this._updateEmail} />
        </label>

        <label className={formStyles.group}>
          Password:
          <input className={formStyles.input} type="password" name="password" onChange={this._updatePassword} />
        </label>

        <div className={formStyles.footer}>
          <input className={[baseStyles.btn, baseStyles.btnPrimary].join(' ')} type="submit" value="Log In" />
          {' '}
          <button className={[baseStyles.btn, baseStyles.btnDefault].join(' ')} onClick={this._cancel}>
            Cancel
          </button>
        </div>
      </form>
    );
  }

  _renderError () {
    if (!this.state.error) {
      return;
    }

    return (
      <p className={[baseStyles.alert, baseStyles.alertDanger].join(' ')} role="alert">
        {this.state.error}
      </p>
    );
  }

  _updateEmail (event) {
    this.setState({ email: event.currentTarget.value });
  }

  _updatePassword (event) {
    this.setState({ password: event.currentTarget.value });
  }

  _logIn (event) {
    event.preventDefault();

    if (!this.state.email || !this.state.password) {
      return this.setState({
        error: 'Please enter an e-mail and password.'
      });
    }

    this.context.api.logIn(this.state.email, this.state.password)
      .then(userData => {
        this.props.onLogin(userData);
      })
      .catch(error => {
        this.setState({ error: error.message });
      });
  }

  _cancel (event) {
    event.preventDefault();
    this.props.cancelLogin();
  }
}
