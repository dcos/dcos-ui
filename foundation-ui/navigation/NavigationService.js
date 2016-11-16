import {EventEmitter} from 'events';
import {NAVIGATION_CHANGE} from './EventTypes';

function buildPrivateContext(instance) {
  const context = {
    instance,
    deferredTasks: [],
    definition: [
       // The only default is root, so it goes first no matter what
       { category: 'root', children: [] }
    ],
    processDeferred() {
      const tasks = this.deferredTasks.slice(0);
      this.deferredTasks = [];

      // If Task is unable to resolve at this point of time it will re-defer itself
      tasks.forEach(({method, args}) => {
        method.apply(this.instance, args);
      });
    },
    defer(method, args) {
      this.deferredTasks.push({method, args});
    }
  };

  instance.getDefinition = instance.getDefinition.bind(context);
  instance.registerCategory = instance.registerCategory.bind(context);
  instance.registerPrimary = instance.registerPrimary.bind(context);
  instance.registerSecondary = instance.registerSecondary.bind(context);

  return context;
}

class NavigationService extends EventEmitter {

  constructor() {
    super();

    const privateContext = buildPrivateContext(this);

    this.on(
      NAVIGATION_CHANGE,
      privateContext.processDeferred.bind(privateContext)
    );
  }

  getDefinition() {
    return this.definition.slice(0);
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
      return this.defer(this.instance.registerPrimary, arguments);
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
      return this.defer(this.instance.registerSecondary, arguments);
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
