import * as React from 'react';

// TODO: once we have a proper user object, this should not be a string
export interface INavBarProps {
    title?: string;
    user?: string;
}

// TODO: this will get a lot more complex to be able to trigger navigation, etc.
export default ({title = 'EDGI Web Monitoring', user = ''}: INavBarProps) => (
    <nav className="navbar navbar-inverse">
        <div className="container-fluid">
            <div className="navbar-header">
                <a className="navbar-brand" href="#">{title}</a>
            </div>
            <div className="collapse navbar-collapse" id="navbar-collapse-1">
                <ul className="nav navbar-nav navbar-right">
                    <li>{user ? (<a id="auth-status">{user}</a>) : ''}</li>
                </ul>
            </div>
        </div>
    </nav>
);
