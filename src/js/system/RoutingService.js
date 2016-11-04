import {Route} from 'react-router';

const pendingRoutes = new Map();
const resolvedRoutes = new Map();

class TabEntry {
  constructor(path, component) {
    this.path = path;
    this.component = component;
  }

  getPath() {
    return this.path;
  }

  getComponent() {
    return this.component;
  }
}

class PageEntry {
  constructor(path, component) {
    this.path = path;
    this.component = component;
    this.tabs = [];
  }

  getPath() {
    return this.path;
  }

  getComponent() {
    return this.component;
  }

  hasComponent() {
    return !!this.component;
  }

  setComponent(component) {
    this.component = component;
  }

  getTabs() {
    return this.tabs;
  }

  addTab(path, component) {
    const tab = new TabEntry(path, component);
    this.tabs.push(tab);
  }
}

const RoutingService = {
  registerPage(path, component) {
    if (!component) {
      return Promise.reject(`Please provide a component for the new page ${path}!`);
    }
    if (resolvedRoutes.has(path)) {
      return Promise.reject(`Page with the path ${path} is already registered!`);
    }

    const page = new PageEntry(path, component);
    resolvedRoutes.set(path, page);

    // Check if there's pending findPage requests
    if (pendingRoutes.has(path)) {
      pendingRoutes.get(path).forEach((resolve) => resolve(page));
      pendingRoutes.delete(path);
    }

    return Promise.resolve(page);
  },

  findPage(path) {
    if (resolvedRoutes.has(path)) {
      return Promise.resolve(resolvedRoutes.get(path));
    } else {
      return new Promise((resolve) => {
        if (pendingRoutes.has(path)) {
          const pending = pendingRoutes.get(path);
          pendingRoutes.set(path, pending.concat(resolve));
        } else {
          pendingRoutes.set(path, [resolve]);
        }
      });
    }
  },

  resolve(routes) {
    const existingRoutes = new Map(routes.map((route) => [route.path, route]));

    resolvedRoutes.forEach((page, path) => {
      const component = page.getComponent();
      const tabs = page.getTabs().map((tab) => {
        return {
          type: Route,
          path: tab.getPath(),
          component: tab.getComponent()
        };
      });

      if (component) {
        if (existingRoutes.has(path)) {
          throw new Error(`Attempt to override a page at ${path}!`);
        }

        const route = {
          path,
          component,
          type: Route,
          children: tabs
        };

        routes.push(route);
        existingRoutes.set(path, route);
      } else if (!existingRoutes.has(path)) {
        throw new Error(`Attempt to add a Tab to a non-existing Page at ${path}!`);
      } else {
        existingRoutes.get(path)
          .children
          .concat(tabs);
      }
    });

    resolvedRoutes.clear();

    return routes;
  }

};

export default RoutingService;
