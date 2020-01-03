import React from 'react';
import {Link, NavLink} from 'react-router-dom';

import './nav-bar.css';

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
  <div styleName="container">
    <nav styleName="navbar">
      <Link to="/" styleName="brand">{title}</Link>
      <ul styleName="nav-list">
        <li>
          <NavLink to="/pages" activeStyleName="nav-link-active" styleName="nav-link" exact>
            All Pages
          </NavLink>
        </li>
        <li>{renderUserInfo(user, showLogin, logOut)}</li>
      </ul>
    </nav>
    {children}
  </div>
);

function renderUserInfo (user, showLogin, logOut) {
  if (user) {
    return (
      <span styleName="auth-status">
        {user.email}
        {' '}
        <button styleName="auth-btn" onClick={logOut}>(Log out)</button>
      </span>
    );
  }
  else {
    return <button className="auth-status auth-btn" onClick={showLogin}>Log In</button>;
  }
}
