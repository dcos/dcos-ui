import {Route} from 'react-router';

const queue = new Map();

class Tab {
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

class Page {
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

  getTabs() {
    return this.tabs;
  }

  addTab(path, component) {
    const tab = new Tab(path, component);
    this.tabs.push(tab);
  }
}

const RoutingService = {
  registerPage(path, component) {
    if (!component) {
      throw new Error(`Please provide a component for the new page ${path}!`);
    }
    if (queue.has(path)) {
      throw new Error(`Page with the path ${path} is already registered in the queue!`);
    }

    const page = new Page(path, component);

    queue.set(path, page);

    return page;
  },

  findPage(path) {
    let page = queue.get(path);
    if (!page) {
      page = new Page(path);
      queue.set(path, page);
    }

    return page;
  },

  render(routes) {
    const existingRoutes = routes.reduce((acc, route) => {
      acc[route.path] = route;
      return acc;
    }, {});

    queue.forEach((page, path) => {
      const component = page.getComponent();
      const tabs = page.getTabs().map((tab) => {
        return {
          type: Route,
          path: tab.getPath(),
          component: tab.getComponent()
        };
      });

      if (component) {
        if (existingRoutes[path]) {
          throw new Error(`Attempt to override a page at ${path}!`);
        }

        const route = {
          path,
          component,
          type: Route,
          children: tabs
        };

        routes.push(route);
        existingRoutes[path] = route;
      } else if (!existingRoutes[path]) {
        throw new Error(`Attempt to add a Tab to a non-existing Page at ${path}!`);
      } else {
        existingRoutes[path]
          .children
          .concat(tabs);
      }
    });

    return routes;
  }

};

export default RoutingService;
