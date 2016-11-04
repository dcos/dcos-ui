import {Route} from 'react-router';

const queue = new Map();

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
      throw new Error(`Please provide a component for the new page ${path}!`);
    }

    let page = queue.get(path);

    if (!page) {
      page = new PageEntry(path, component);
      queue.set(path, page);
    } else if (!page.hasComponent()) {
      page.setComponent(component);
    } else {
      throw new Error(`Page with the path ${path} is already registered!`);
    }

    return page;
  },

  findPage(path) {
    let page = queue.get(path);
    if (!page) {
      page = new PageEntry(path);
      queue.set(path, page);
    }

    return page;
  },

  render(routes) {
    const existingRoutes = new Map(routes.map((route) => [route.path, route]));

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

    return routes;
  }

};

export default RoutingService;
