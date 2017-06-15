import { EventEmitter } from "events";
import { NAVIGATION_CHANGE } from "./EventTypes";
import Config from "../../src/js/config/Config";

class NavigationService extends EventEmitter {
  constructor() {
    super();

    /**
     * @typedef NavigationService~Context
     */
    const privateContext = {
      instance: this,
      deferredTasks: [],
      definition: [
        // The only default is root, so it goes first no matter what
        { category: "root", children: [] }
      ],
      defer(method, args) {
        this.deferredTasks.push({ method, args });
      },
      processDeferred() {
        const tasks = this.deferredTasks.slice(0);
        this.deferredTasks = [];

        // If Task is unable to resolve at this point of time it will re-defer itself
        tasks.forEach(({ method, args }) => {
          method.apply(this.instance, args);
        });
      }
    };

    this.getDefinition = this.getDefinition.bind(privateContext);
    this.registerCategory = this.registerCategory.bind(privateContext);
    this.registerPrimary = this.registerPrimary.bind(privateContext);
    this.registerSecondary = this.registerSecondary.bind(privateContext);

    this.on(
      NAVIGATION_CHANGE,
      privateContext.processDeferred.bind(privateContext)
    );
  }

  /**
   * getDefinition - returns navigation definition
   *
   * @this {NavigationService~Context}
   * @return {Array} definition items
   */
  getDefinition() {
    return this.definition.slice(0);
  }

  /**
   * registerCategory - register a Sidebar category
   *
   * @this {NavigationService~Context}
   * @param  {String} category Category name
   */
  registerCategory(category) {
    if (!this.definition.find(element => element.category === category)) {
      this.definition.push({
        category,
        children: []
      });

      this.instance.emit(NAVIGATION_CHANGE);
    }
  }

  /**
   * registerPrimary - register a primary navigation element
   *
   * @this {NavigationService~Context}
   * @param  {String} path - an absolute path
   * @param  {String|React.Component} link - link label or a custom component
   * @param  {Object} options - additional data
   * @return {undefined}
   */
  registerPrimary(path, link, options = {}) {
    const { category = "root" } = options;
    const categoryElement = this.definition.find(
      element => element.category === category
    );

    if (!categoryElement) {
      return this.defer(this.instance.registerPrimary, arguments);
    }

    const existingElement = categoryElement.children.find(element => {
      return element.path === path;
    });

    if (existingElement) {
      if (Config.environment === "development") {
        console.warn(`Primary nav with the path ${path} already exists!`);
      }

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

  /**
   * registerSecondary - register a secondary navigation element
   *
   * @this {NavigationService~Context}
   * @param  {String} parentPath - an absolute path of a parent element
   * @param  {String} path - an absolute path of the secondary element
   * @param  {String|React.Component} link - a string label or a custom link component
   * @param  {Object} options - additional options
   * @return {undefined}
   */
  registerSecondary(parentPath, path, link, options = {}) {
    // flatten categories
    const primaryElements = this.definition.reduce((result, category) => {
      return result.concat(category.children);
    }, []);

    const parentElement = primaryElements.find(
      element => element.path === parentPath
    );

    if (!parentElement) {
      return this.defer(this.instance.registerSecondary, arguments);
    }

    const existingElement = parentElement.children.find(element => {
      return element.path === path;
    });

    if (existingElement) {
      if (Config.environment === "development") {
        console.warn(
          `
          Secondary nav with the path ${parentPath}/${path} already exists!
        `
        );
      }

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
}

module.exports = NavigationService;
