import React from 'react';
import PropTypes from 'prop-types';
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
export default class NavBar extends React.Component {
  constructor (props) {
    super(props);
    this._isActive = this._isActive.bind(this);
  }
  render () {
    const {
      title = 'EDGI Web Monitoring',
      user = null,
      showLogin,
      logOut,
      onClick
    } = this.props;

    return (
      <nav className="navbar navbar-inverse">
        <div className="container-fluid">
          <div className="navbar-header">
            <Link to="/" className="navbar-brand">{title}</Link>
          </div>
          <div>
            <ul className="nav navbar-nav navbar-right">
              <li>
                {renderUserInfo(user, showLogin, logOut, onClick, this._isActive)}
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }

  _isActive (currentFilter) {
    return this.context.currentFilter === currentFilter;
  }
}

function renderUserInfo (user, showLogin, logOut, onClick, isActive) {
  if (user) {
    return (
      <div>
        <NavLink
          to="/assignedPages"
          isActive={() => isActive('assignedPages')}
          onClick={() => onClick('assignedPages')}
        >
          Assigned Pages
        </NavLink>
        <NavLink
          to="/pages"
          isActive={() => isActive('pages')}
          onClick={() => onClick('pages')}
        >
          All Pages
        </NavLink>
        <span className="auth-status">
          {user.email}
          {' '}
          <button className="btn btn-link" onClick={logOut}>(Log out)</button>
        </span>
      </div>
    );
  }
  else {
    return <button className="auth-status btn btn-link" onClick={showLogin}>Log In</button>;
  }
}

NavBar.contextTypes = {
  currentFilter: PropTypes.string
};

