import { Component, useEffect } from 'react';
import AriaModal from 'react-aria-modal';
import { BrowserRouter as Router, Navigate, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { ApiContext, WebMonitoringApi, WebMonitoringDb } from './api-context';
import EnvironmentBanner from './environment-banner/environment-banner';
import Loading from './loading';
import LoginForm from './login-form/login-form';
import NavBar from './nav-bar/nav-bar';
import PageDetails from './page-details/page-details';
import PageList from './page-list/page-list';
import VersionRedirect from './version-redirect';

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
 * @extends {Component}
 */
export default class WebMonitoringUi extends Component {
  constructor (props) {
    super(props);
    this.state = {
      isLoading: true,
      pages: null,
      query: null,
      showLogin: false,
      user: null
    };
    this.showLogin = this.showLogin.bind(this);
    this.hideLogin = this.hideLogin.bind(this);
    this.afterLogin = this.afterLogin.bind(this);
    this.logOut = this.logOut.bind(this);
    this.loadPages = this.loadPages.bind(this);
    this.search = this.search.bind(this);
  }

  showLogin () {
    this.setState({ showLogin: true });
  }

  hideLogin () {
    this.setState({ showLogin: false, user: api.userData });
  }

  afterLogin (user) {
    // Clear page lists (they could have held not-logged-in errors)
    this.setState({ pages: null });
    this.hideLogin();
    this.loadPages();
  }

  logOut () {
    api.logOut();
    this.setState({ user: api.userData });
    this.loadPages();
  }


  /**
   * Updates query state with url and optionally capture_time information if startDate and/or endDate is passed in.
   * Then calls loadPages.
   *
   * @param {Object} query
   */
  search ({ url, startDate, endDate }) {
    const formattedQuery = { url };

    if (startDate || endDate) {
      formattedQuery.capture_time = {
        startDate: startDate,
        endDate: endDate
      };
    }

    this.setState({ query: formattedQuery, pages: null });
  }

  /**
   * Load all pages.
   * @private
   *
   * Sends a request to fetch the first chunk of pages and sets the `pages` property of state.
   * These are passed as props to various child components.
   * If the user is not logged in, set the `pages` state property to the error instance instead.
   */
  loadPages () {
    api.isLoggedIn()
      .then(loggedIn => {
        if (!configuration.ALLOW_PUBLIC_VIEW && !loggedIn) {
          return Promise.reject(new Error('You must be logged in to view pages'));
        }

        const query = Object.assign({}, this.state.query);

        return api.getPages(query);
      })
      // Set state.pages = error; downstream code should check `pages` type.
      .catch(error => error)
      .then(pages => {
        this.setState({
          pages: pages || []
        });
      });
  }

  loadUser () {
    api.isLoggedIn()
      .then(loggedIn => {
        this.setState({ user: api.userData, isLoading: false });
      });
  }

  componentDidMount () {
    this.loadUser();
  }

  render () {
    if (this.state.isLoading) {
      return <Loading />;
    }

    // If logging in is required, don't bother rendering the requested route
    // and *only* show the login dialog.
    if (!configuration.ALLOW_PUBLIC_VIEW && !this.state.user) {
      return this.renderLoginDialog();
    }

    // TODO: this messy page list stuff should really be turned into a context
    //   for more understandable code.
    const withPages = (ComponentType) => {
      return ({ pages, ...props }) => {
        useEffect(() => {
          if (!pages) {
            this.loadPages();
          }
        });

        return <ComponentType
          pages={pages}
          {...props}
        />;
      };
    };
    // Dumb function wrapper since we have mostly class components and React
    // Router now pretty much requires hooks.
    const withUrlParams = (ComponentType) => {
      return (props) => {
        const urlParams = useParams();
        const navigate = useNavigate();
        return <ComponentType navigate={navigate} urlParams={urlParams} {...props} />;
      };
    };
    const PageListWithLoading = withUrlParams(withPages(PageList));
    const PageDetailsWithParams = withUrlParams(PageDetails);

    const modal = this.state.showLogin ? this.renderLoginDialog() : null;

    return (
      <ApiContext.Provider value={{ api, localApi }}>
        <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <div id="application">
            <NavBar
              title="EDGI"
              user={this.state.user}
              showLogin={this.showLogin}
              logOut={this.logOut}
            >
              <EnvironmentBanner apiUrl={api.url}/>
            </NavBar>

            <Routes>
              <Route
                path="/pages"
                element={
                  <PageListWithLoading
                    pages={this.state.pages}
                    user={this.state.user}
                    onSearch={this.search}
                  />
                }
              />
              <Route
                path="/page/:pageId/:change?"
                element={
                  <PageDetailsWithParams
                    user={this.state.user}
                    pages={this.state.pages}
                  />
                }
              />
              <Route path="/version/:versionId" element={<VersionRedirect />} />
              <Route path="/*?" element={<Navigate to="/pages" replace />} />
            </Routes>
            {modal}
          </div>
        </Router>
      </ApiContext.Provider>
    );
  }

  renderLoginDialog () {
    return (
      <AriaModal
        titleText="Log in"
        onExit={this.hideLogin}
        applicationNode={document.getElementById('web-monitoring-ui-root')}
        dialogClass="dialog__body"
        underlayClass="dialog dialog__underlay"
        verticallyCenter={true}
      >
        <LoginForm cancelLogin={this.hideLogin} onLogin={this.afterLogin} />
      </AriaModal>
    );
  }
}
