import {EventEmitter} from 'events';
import {NAVIGATION_CHANGE} from './EventTypes';

class NavigationService extends EventEmitter {

  constructor() {
    super();

    this.deferredTasks = [];

    // The only default is root, so it goes first no matter what
    this.definition = [
      { category: 'root', children: [] }
    ];

    this.on(
      NAVIGATION_CHANGE,
      this.processDeferred
    );
  }

  getDefinition() {
    return this.definition.slice(0);
  }

  processDeferred() {
    const tasks = this.deferredTasks.slice(0);
    this.deferredTasks = [];

    // If Task is unable to resolve at this point of time it will re-defer itself
    tasks.forEach(({method, args}) => {
      this[method].apply(this, args);
    });
  }

  defer(method, args) {
    this.deferredTasks.push({method, args});
  }

  registerCategory(category) {
    if (!this.definition.find((element) => element.category === category)) {
      this.definition.push({
        category,
        children: []
      });
    }

    this.emit(NAVIGATION_CHANGE);
  }

  registerPrimary(path, link, options = {}) {
    const {category = 'root'} = options;
    const categoryElement = this.definition
      .find((element) => element.category === category);

    if (!categoryElement) {
      return this.defer('registerPrimary', arguments);
    }

    const existingElement = categoryElement.children.find((element) => {
      return element.path === path;
    });

    if (existingElement) {
      return;
    }

    categoryElement.children.push({
      path,
      link,
      options,
      children: []
    });

    this.emit(NAVIGATION_CHANGE);
  }

  registerSecondary(parentPath, path, link, options = {}) {
    // flatten categories
    const primaryElements = this.definition.reduce((result, category) => {
      return result.concat(category.children);
    }, []);

    const parentElement = primaryElements
      .find((element) => element.path === parentPath);

    if (!parentElement) {
      return this.defer('registerSecondary', arguments);
    }

    const existingElement = parentElement.children.find((element) => {
      return element.path === path;
    });

    if (existingElement) {
      return;
    }

    parentElement.children.push({
      link,
      options,
      path: `${parentPath}/${path}`,
      children: []
    });

    this.emit(NAVIGATION_CHANGE);
  }
};

const service = new NavigationService();
export default service;
