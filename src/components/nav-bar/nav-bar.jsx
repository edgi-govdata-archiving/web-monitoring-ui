import React from 'react';
import { Link, NavLink } from 'react-router-dom';

import baseStyles from '../../css/base.css'; // eslint-disable-line
import navStyles from './nav-bar.css'; // eslint-disable-line
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
export default ({ children = null, title = 'EDGI Web Monitoring', user = null, showLogin, logOut }) => (
  <div styleName="navStyles.container">
    <nav styleName="navStyles.navbar">
      <Link to="/" styleName="navStyles.brand">{title}</Link>
      <ul styleName="navStyles.nav-list">
        <li>
          <NavLink to="/pages" activeStyleName="navStyles.nav-link-active" styleName="navStyles.nav-link" exact>
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
      <span styleName="navStyles.auth-status">
        {user.email}
        {' '}
        <button styleName="baseStyles.btn baseStyles.btn-link navStyles.auth-btn" onClick={logOut}>
          (Log out)
        </button>
      </span>
    );
  }
  else {
    return (
      <button styleName="baseStyles.btn baseStyles.btn-link navStyles.auth-btn navStyles.auth-status" onClick={showLogin}>
        Log In
      </button>
    );
  }
}
