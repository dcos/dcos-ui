import {EventEmitter} from 'events';
import {NAVIGATION_CHANGE} from './EventTypes';

class NavigationService extends EventEmitter {

  constructor() {
    super();

    const privateContext = {
      deferredTasks: [],
      definition: [
        // The only default is root, so it goes first no matter what
        { category: 'root', children: [] }
      ],
      instance: this
    };

    this.getDefinition = this.getDefinition.bind(privateContext);
    this.processDeferred = this.processDeferred.bind(privateContext);
    this.defer = this.defer.bind(privateContext);
    this.registerCategory = this.registerCategory.bind(privateContext);
    this.registerPrimary = this.registerPrimary.bind(privateContext);
    this.registerSecondary = this.registerSecondary.bind(privateContext);

    this.on(NAVIGATION_CHANGE, this.processDeferred);
  }

  getDefinition() {
    return this.definition.slice(0);
  }

  processDeferred() {
    const tasks = this.deferredTasks.slice(0);
    this.deferredTasks = [];

    // If Task is unable to resolve at this point of time it will re-defer itself
    tasks.forEach(({method, args}) => {
      method.apply(this.instance, args);
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

    this.instance.emit(NAVIGATION_CHANGE);
  }

  registerPrimary(path, link, options = {}) {
    const {category = 'root'} = options;
    const categoryElement = this.definition
      .find((element) => element.category === category);

    if (!categoryElement) {
      return this.instance.defer(this.instance.registerPrimary, arguments);
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

    this.instance.emit(NAVIGATION_CHANGE);
  }

  registerSecondary(parentPath, path, link, options = {}) {
    // flatten categories
    const primaryElements = this.definition.reduce((result, category) => {
      return result.concat(category.children);
    }, []);

    const parentElement = primaryElements
      .find((element) => element.path === parentPath);

    if (!parentElement) {
      return this.instance.defer(this.instance.registerSecondary, arguments);
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

    this.instance.emit(NAVIGATION_CHANGE);
  }
};

module.exports = NavigationService;
