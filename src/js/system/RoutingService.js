import {Route} from 'react-router';

const queue = {};

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
    if (queue[path]) {
      throw new Error(`Page with the path ${path} is already registered in the queue!`);
    }

    queue[path] = new Page(path, component);

    return queue[path];
  },

  findPage(path) {
    let page = queue[path];
    if (!page) {
      queue[path] = new Page(path);
    }

    return page;
  },

  render(routes) {
    const existingRoutes = routes.reduce((acc, route) => {
      acc[route.path] = route;
      return acc;
    }, {});

    Object.values(queue).forEach((page) => {
      const path = page.getPath();
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
