import PropTypes from 'prop-types';
import React from 'react';
import AriaModal from 'react-aria-modal';
import {BrowserRouter as Router, Redirect, Route, Switch} from 'react-router-dom';
import bindComponent from '../scripts/bind-component';
import WebMonitoringApi from '../services/web-monitoring-api';
import WebMonitoringDb from '../services/web-monitoring-db';
import Loading from './loading';
import LoginForm from './login-form';
import NavBar from './nav-bar';
import PageDetails from './page-details';
import PageList from './page-list';

const configuration = window.webMonitoringConfig;

const api = new WebMonitoringDb({
  url: configuration.WEB_MONITORING_DB_URL
});

const localApi = new WebMonitoringApi(api);

/**
 * WebMonitoringUi represents the root container for the app. It also maintains
 * a top-level lsit of pages to share across the app. We do this here instead
 * of via caching in the web-monitoring-db API because we want any part of the
 * app that interates through pages to iterate through the same set of pages
 * with the same filters and conditions.
 *
 * @class WebMonitoringUi
 * @extends {React.Component}
 */
export default class WebMonitoringUi extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      assignedPages: null,
      pages: null,
      showLogin: false,
      user: null,
      isLoading: true,
      error: null,
      currentFilter: 'assignedPages',
    };
    this.showLogin = this.showLogin.bind(this);
    this.hideLogin = this.hideLogin.bind(this);
    this.afterLogin = this.afterLogin.bind(this);
    this.logOut = this.logOut.bind(this);
    this.loadPages = this.loadPages.bind(this);
    this.filterClickHandler = this.filterClickHandler.bind(this);
  }

  filterClickHandler (filter) {
    this.setState({currentFilter: filter});
  }

  showLogin () {
    this.setState({showLogin: true});
  }

  hideLogin () {
    this.setState({showLogin: false, user: api.userData, error: null});
  }

  afterLogin (user) {
    this.hideLogin();
    this.loadPages(false);
  }

  logOut () {
    api.logOut();
    this.setState({user: api.userData});
    this.loadPages(true);
  }

  loadPages (allPages) {
    api.isLoggedIn()
      .then(loggedIn => {
        if (!loggedIn) {
          return Promise.reject(new Error('You must be logged in to view pages'));
        }

        const query = {include_latest: true};
        if (allPages) {
          return api.getPages(query);
        }
        else {
          return localApi.getPagesForUser(api.userData.email, null, query)
        }
      })
      .then(pages => {
        this.setState({
          [allPages ? 'pages' : 'assignedPages']: pages,
          currentFilter: allPages ? 'pages' : 'assignedPages'
        });
      })
      .catch(error => {
        this.setState({error});
      });
  }

  loadUser () {
    api.isLoggedIn()
      .then(loggedIn => {
        this.setState({user: api.userData, isLoading: false, error: null});
      });
  }

  componentWillMount () {
    this.loadUser();
  }

  render () {
    if (this.state.isLoading) {
      return <Loading />
    }
    const {error, showLogin, user} = this.state;

    const withData = (ComponentType, pageType) => {
      return (routeProps) => {
        const pages = this.state[pageType];
        if (!pages) {
          this.loadPages(pageType === 'pages');
        }
        return <ComponentType {...routeProps} pages={pages} user={this.state.user} />;
      };
    };
    const modal = showLogin ? this.renderLoginDialog() : null;
    const main = (!user)
      ? (this.renderLoginDialog("You must be logged in to view pages"))
      : error
        ? (<h1>{error.message}</h1>)
        : (
          <div>
            <Route exact path="/" render={() => (
              this.state.user
                ? (<Redirect to="/assignedPages" />)
                : (<Redirect to="/pages" />)
            )}/>
            <Route path="/pages" render={withData(PageList, 'pages')} />
            <Route path="/assignedPages" render={withData(PageList, 'assignedPages')} />
            <Route path="/page/:pageId/:change?" render={withData(PageDetails, this.state.currentFilter)} />
          </div>
        );

    return (
      <div>
        <Router>
          <div id="application">
            <NavBar title="EDGI"
              user={this.state.user}
              showLogin={this.showLogin}
              logOut={this.logOut}
              onClick={this.filterClickHandler}
            />
            {main}
          </div>
        </Router>
        {modal}
      </div>
    );
  }

  renderLoginDialog (message) {
    return (
      <AriaModal
        titleText="Log In"
        onExit={this.hideLogin}
        applicationNode={document.getElementById('web-monitoring-ui-root')}
        dialogClass="dialog__body"
        underlayClass="dialog dialog__underlay"
        verticallyCenter={true}
      >
        <LoginForm message={message} cancelLogin={this.hideLogin} onLogin={this.afterLogin} />
      </AriaModal>
    );
  }

  getChildContext () {
    return {api, localApi, currentFilter: this.state.currentFilter};
  }
}

WebMonitoringUi.childContextTypes = {
  api: PropTypes.instanceOf(WebMonitoringDb),
  localApi: PropTypes.instanceOf(WebMonitoringApi),
  currentFilter: PropTypes.string
};
