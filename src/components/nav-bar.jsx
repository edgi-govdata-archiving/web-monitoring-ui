import React from 'react';
import {Link, NavLink} from 'react-router-dom';

/**
 * @typedef {Object} NavBarProps
 * @property {Function} logOut Callback requesting the user be logged out
 * @property {Function} showLogin Callback requesting a login form to show
 * @property {string} title
 * @property {Object} user
 */

/**
 * The NavBar component renders an app title, user info, links, etc.
 * @param {NavBarProps} props
 */
export default ({children = null, title = 'EDGI Web Monitoring', user = null, showLogin, logOut }) => (
  <nav className="navbar navbar-inverse">
    <div className="container-fluid">
      <div className="navbar-header">
        <Link to="/" className="navbar-brand">{title}</Link>
      </div>
      <ul className="nav navbar-nav">
        <li><NavLink to="/pages" exact>All Pages</NavLink></li>
        <li>{renderUserInfo(user, showLogin, logOut)}</li>
      </ul>
    </div>
    {children}
  </nav>
);

function renderUserInfo (user, showLogin, logOut) {
  if (user) {
    return (
      <span className="auth-status">
        {user.email}
        {' '}
        <button className="btn btn-link" onClick={logOut}>(Log out)</button>
      </span>
    );
  }
  else {
    return <button className="auth-status btn btn-link" onClick={showLogin}>Log In</button>;
  }
}
