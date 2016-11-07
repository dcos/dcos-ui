import {Route} from 'react-router';

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
  resolve(routes) {
    if (routes.includes(this.path)) {
      throw new Error(`Attempt to override a page at ${this.path}!`);
    }

    return routes.push({
      type: Route,
      path: this.path,
      component: this.component
    });
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
  resolve(routes) {
    const parent = routes.find(({path}) => path === this.path);

    if (!parent) {
      return;
    }

    if (!parent.children) {
      parent.children = [];
    }

    if (parent.children.find(({path}) => path === this.tabPath)) {
      throw new Error(`Attempt to override a tab at ${this.path}/${this.tabPath}!`);
    }

    return parent.children.push({
      type: Route,
      path: this.tabPath,
      component: this.component
    });
  }
}

const RoutingService = {
  registerPage(path, component, cb) {
    if (!component) {
      return cb(`Please provide a component for the new page ${path}!`);
    }

    pendingRoutes.push(new PendingPageRoute(path, component));
  },

  registerTab(path, tabPath, component, cb) {
    if (!component) {
      return cb(`Please provide a component for the new tab at ${pagePath}/${path}!`);
    }

    pendingRoutes.push(new PendingTabRoute(path, tabPath, component));
  },

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
