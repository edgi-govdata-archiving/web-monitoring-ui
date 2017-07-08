import * as React from 'react';
import {Link} from 'react-router-dom';

// TODO: once we have a proper user object, this should not be a string
export interface INavBarProps {
    logOut: () => void;
    showLogin: () => void;
    title?: string;
    user?: any;
}

// TODO: this will get a lot more complex to be able to trigger navigation, etc.
export default ({title = 'EDGI Web Monitoring', user = null, showLogin, logOut}: INavBarProps) => (
    <nav className="navbar navbar-inverse">
        <div className="container-fluid">
            <div className="navbar-header">
                <Link to="/" className="navbar-brand">{title}</Link>
            </div>
            <div className="collapse navbar-collapse" id="navbar-collapse-1">
                <ul className="nav navbar-nav navbar-right">
                    <li>{renderUserInfo(user, showLogin, logOut)}</li>
                </ul>
            </div>
        </div>
    </nav>
);

function renderUserInfo (user: any, showLogin: () => void, logOut: () => void) {
    if (user) {
        return (
            <span className="auth-status">
                {user.email}
                <button className="btn btn-link" onClick={logOut}>(Log out)</button>
            </span>
        );
    }
    else {
        return <button className="auth-status btn btn-link" onClick={showLogin}>Log In</button>;
    }
}
