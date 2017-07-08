import * as PropTypes from 'prop-types';
import * as React from 'react';
import {RouteComponentProps} from 'react-router-dom';
import WebMonitoringDb from '../services/web-monitoring-db';

export interface ILoginPanelProps {
    cancelLogin: () => void;
    onLogin: (user: any) => void;
}

export interface ILoginPanelState {
    email: string;
    password: string;
    error: any;
}

export default class LoginPannel extends React.Component<ILoginPanelProps, ILoginPanelState> {
    static contextTypes = {
        api: PropTypes.instanceOf(WebMonitoringDb)
    };

    context: {api: WebMonitoringDb};

    constructor (props: ILoginPanelProps) {
        super(props);
        this.state = {email: '', password: '', error: null};
        this.updateEmail = this.updateEmail.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
        this.logIn = this.logIn.bind(this);
        this.cancel = this.cancel.bind(this);
    }

    render () {
        return (
            <form className="login-panel" onSubmit={this.logIn}>
                <h1>Log In</h1>

                {this.renderError()}

                <label className="form-group">
                    <span className="info-text">E-mail Address:</span>
                    <input className="form-control" type="text" name="email" onChange={this.updateEmail} />
                </label>

                <label className="form-group">
                    <span className="info-text">Password:</span>
                    <input className="form-control" type="password" name="password" onChange={this.updatePassword} />
                </label>

                <div className="login-panel__footer">
                    <input className="login-panel__submit btn btn-primary" type="submit" value="Log In" />
                    {' '}
                    <button className="login-panel__cancel btn btn-default" onClick={this.cancel}>Cancel</button>
                </div>
            </form>
        );
    }

    renderError () {
        if (!this.state.error) {
            return;
        }

        return (
            <p className="alert alert-danger" role="alert">
                {this.state.error}
            </p>
        );
    }

    private updateEmail (event: React.FormEvent<HTMLInputElement>) {
        this.setState({email: event.currentTarget.value});
    }

    private updatePassword (event: React.FormEvent<HTMLInputElement>) {
        this.setState({password: event.currentTarget.value});
    }

    private logIn (event: React.FormEvent<HTMLFormElement>) {
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

    private cancel (event: React.MouseEvent<HTMLElement>) {
        event.preventDefault();
        this.props.cancelLogin();
    }
}
