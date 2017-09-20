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
export default class NavBar extends React.Component {
  constructor (props) {
    super(props);

    this.renderUserInfo = this.renderUserInfo.bind(this);
  }
  render () {
    const {
      title = 'EDGI Web Monitoring',
      user = null,
      showLogin,
      logOut,
      setPageFilter,
      pageFilter
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
                {this.renderUserInfo(user, showLogin, logOut, setPageFilter, pageFilter)}
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }

  renderUserInfo (user, showLogin, logOut, setPageFilter, pageFilter) {
    const isAssignedPagesActive = match => match ? match.url === '/assignedPages' : pageFilter === 'assignedPages';
    const isPagesActive = match => match ? match.url === '/pages' : pageFilter === 'pages';
    const setAssignedPages = () => setPageFilter('assignedPages');
    const setPages = () => setPageFilter('pages');

    if (user) {
      return (
        <div>
          <NavLink
            to="/assignedPages"
            isActive={isAssignedPagesActive}
            onClick={setAssignedPages}
          >
            Assigned Pages
          </NavLink>
          <NavLink
            to="/pages"
            isActive={isPagesActive}
            onClick={setPages}
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
}



