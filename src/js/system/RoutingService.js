import {Route, Redirect} from 'react-router';

let pendingRoutes = [];

class PendingRoute {
  constructor(path, component) {
    this.path = path;
    this.component = component;
  }

  getFullPath() {
    return this.path;
  }
}

class PendingPageRoute extends PendingRoute {

  /**
   * resolve - adds page route to routes if it's not there
   *
   * @throws an Error if the route is already registered with a different component
   * @param  {Array} routes DCOS routes definition array
   * @return {Object} route definition
   */
  resolve(routes) {
    const existingRoute = routes.includes(this.path);

    if (existingRoute && existingRoute.component === this.component) {
      return existingRoute;
    } else if (existingRoute) {
      throw new Error(`Attempt to override a page at ${this.path}!`);
    }

    const newRoute = {
      type: Route,
      path: this.path,
      component: this.component
    };

    routes.push(newRoute);

    return newRoute;
  }
}

class PendingTabRoute extends PendingRoute {
  constructor(path, tabPath, component) {
    super(path, component);
    this.tabPath = tabPath;
  }

  getFullPath() {
    return `${this.path}/${this.tabPath}`;
  }

  /**
   * resolve - adds page route to routes if it's not there
   *
   * @throws an Error if tab is already registered with a different component
   * @param  {Array} routes DCOS routes definition array
   * @return {Null|Object} null if parent doesn't exists yet or a route definition
   */
  resolve(routes) {
    const parent = routes.find(({path}) => path === this.path);

    if (!parent) {
      return null;
    }

    if (!parent.children) {
      parent.children = [];
    }

    const existingTab = parent.children.find(({path}) => path === this.tabPath);

    if (existingTab && existingTab.component === this.component) {
      return existingTab;
    } else if (existingTab) {
      throw new Error(`Attempt to override a tab at ${this.path}/${this.tabPath}!`);
    }

    const newTab = {
      type: Route,
      path: this.tabPath,
      component: this.component
    };

    parent.children.push(newTab);

    return newTab;
  }
}

class PendingRedirect extends PendingRoute {
  constructor(path, to) {
    super(path);
    this.to = to;
  }

  /**
   * resolve - adds redirect route to routes if it's not there
   *
   * @throws an Error if a redirect is already registered with a different destination
   * @param  {Array} routes DCOS routes definition array
   * @return {Object} a route definition
   */
  resolve(routes) {
    const existingRedirect = routes.find(({type, path}) => {
      return type === Redirect && path === this.path;
    });

    if (existingRedirect && existingRedirect.to === this.to) {
      return existingRedirect;
    } else if (existingRedirect) {
      throw new Error(`Attempt to override Redirect of ${this.path} from ${existingRedirect.to} to ${this.to}`);
    }

    routes.push({
      type: Redirect,
      path: this.path,
      to: this.to
    });
  }
}

const RoutingService = {

  /**
   * registerPage - adds a page route to the queue
   *
   * @param  {String} path a path to the page
   * @param  {React.Component} component a React.js component of the page
   */
  registerPage(path, component) {
    if (!path || !component) {
      throw new Error('Please provide all required arguments');
    }

    pendingRoutes.push(new PendingPageRoute(path, component));
  },

  /**
   * registerTab - adds a tab route to the queue
   *
   * @param  {String} path a path to a parent page
   * @param  {String} tabPath a path to the tab
   * @param  {React.Component} component a React.js component of the tab
   */
  registerTab(path, tabPath, component) {
    if (!path || !tabPath || !component) {
      throw new Error('Please provide all required arguments');
    }

    pendingRoutes.push(new PendingTabRoute(path, tabPath, component));
  },

  /**
   * registerRedirect - adds a redirect definition to the queue
   *
   * @param  {String} path a path to redirect from
   * @param  {String} to   a path to redirect to
   */
  registerRedirect(path, to) {
    pendingRoutes.push(new PendingRedirect(path, to));
  },

  /**
   * resolveWith - resolves pending routes with existing DCOS routes definitions
   *
   * @param  {Array} routes DCOS routes definitions
   */
  resolveWith(routes = []) {
    pendingRoutes.sort((routeA, routeB) => {
      const pathA = routeA.getFullPath();
      const pathB = routeB.getFullPath();

      if (pathA < pathB) {
        return -1;
      }
      if (pathA > pathB) {
        return 1;
      }
      return 0;
    });

    pendingRoutes = pendingRoutes.reduce((acc, route) => {
      if (!route.resolve(routes)) {
        acc.push(route);
      }

      return acc;
    }, []);
  }

};

export default RoutingService;
