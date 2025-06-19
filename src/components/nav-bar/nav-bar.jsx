import { Link, NavLink } from 'react-router-dom';

import baseStyles from '../../css/base.css';
import navStyles from './nav-bar.css';
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
  <div className={navStyles.container}>
    <nav className={navStyles.navbar}>
      <Link to="/" className={navStyles.brand}>{title}</Link>
      <ul className={navStyles.navList}>
        <li>
          <NavLink to="/pages" activeClassName={navStyles.navLinkActive} className={navStyles.navLink} exact>
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
      <span className={navStyles.authStatus}>
        {user.email}
        {' '}
        <button className={[baseStyles.btn, baseStyles.btnLink, navStyles.authBtn].join(' ')} onClick={logOut}>
          (Log out)
        </button>
      </span>
    );
  }
  else {
    return (
      <button className={[baseStyles.btn, baseStyles.btnLink, navStyles.authBtn, navStyles.authStatus].join(' ')} onClick={showLogin}>
        Log In
      </button>
    );
  }
}
