import * as PropTypes from 'prop-types';
import * as React from 'react';
import {RouteComponentProps} from 'react-router-dom';
import WebMonitoringDb from '../services/web-monitoring-db';

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
 * @extends {React.Component}
 */
export default class LoginPanel extends React.Component {
    constructor (props) {
        super(props);
        this.state = {email: '', password: '', error: null};
        this._updateEmail = this._updateEmail.bind(this);
        this._updatePassword = this._updatePassword.bind(this);
        this._logIn = this._logIn.bind(this);
        this._cancel = this._cancel.bind(this);
    }

    render () {
        return (
            <form className="login-form" onSubmit={this._logIn}>
                <h1>Log In</h1>

                {this._renderError()}

                <label className="form-group">
                    <span className="info-text">E-mail Address:</span>
                    <input className="form-control" type="text" name="email" onChange={this._updateEmail} />
                </label>

                <label className="form-group">
                    <span className="info-text">Password:</span>
                    <input className="form-control" type="password" name="password" onChange={this._updatePassword} />
                </label>

                <div className="login-form__footer">
                    <input className="login-form__submit btn btn-primary" type="submit" value="Log In" />
                    {' '}
                    <button className="login-form__cancel btn btn-default" onClick={this._cancel}>Cancel</button>
                </div>
            </form>
        );
    }

    _renderError () {
        if (!this.state.error) {
            return;
        }

        return (
            <p className="alert alert-danger" role="alert">
                {this.state.error}
            </p>
        );
    }

    _updateEmail (event) {
        this.setState({email: event.currentTarget.value});
    }

    _updatePassword (event) {
        this.setState({password: event.currentTarget.value});
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
                this.setState({error: error.message});
            });
    }

    _cancel (event) {
        event.preventDefault();
        this.props.cancelLogin();
    }
}

LoginPanel.contextTypes = {
    api: PropTypes.instanceOf(WebMonitoringDb)
};
