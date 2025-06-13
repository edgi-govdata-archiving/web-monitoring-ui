import { Component } from 'react';
import { ApiContext } from '../api-context';

import baseStyles from '../../css/base.css'; // eslint-disable-line
import formStyles from './login-form.css'; // eslint-disable-line

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
      <form styleName="formStyles.form" onSubmit={this._logIn}>
        <h1 styleName="formStyles.title">Log In</h1>
        <p styleName="baseStyles.alert baseStyles.alert-info" role="alert">
          You must be logged in to view pages
        </p>
        {this._renderError()}

        <label styleName="formStyles.group">
          E-mail Address:
          <input styleName="formStyles.input" type="text" name="email" onChange={this._updateEmail} />
        </label>

        <label styleName="formStyles.group">
          Password:
          <input styleName="formStyles.input" type="password" name="password" onChange={this._updatePassword} />
        </label>

        <div styleName="formStyles.footer">
          <input styleName="baseStyles.btn baseStyles.btn-primary" type="submit" value="Log In" />
          {' '}
          <button styleName="baseStyles.btn baseStyles.btn-default" onClick={this._cancel}>
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
      <p styleName="baseStyles.alert baseStyles.alert-danger" role="alert">
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
