import {Route, Redirect} from 'react-router';
import {EventEmitter} from 'events';

import {ROUTING_CHANGE} from './EventTypes';

function throwError(error) {
  if (global.__DEV__) {
    throw error;
  }
}

class RoutingService extends EventEmitter {

  constructor() {
    super();

    this.definition = [];

    const context = {
      deferredTasks: [],
      instance: this
    };

    this.defer = this.defer.bind(context);
    this.processDeferred = this.processDeferred.bind(context);

    this.on(ROUTING_CHANGE, this.processDeferred);
  }

  processDeferred() {
    const tasks = this.deferredTasks.slice(0);
    this.deferredTasks = [];

    // If Task is unable to resolve at this point of time it will re-defer itself
    tasks.forEach((args) => {
      this.instance.registerTab.apply(this.instance, args);
    });
  }

  defer(args) {
    this.deferredTasks.push(args);
  }

  getDefinition() {
    return this.definition.slice(0);
  }

  /**
   * registerPage - adds a page route to the queue
   *
   * @param  {String} path a path to the page
   * @param  {React.Component} component a React.js component of the page
   * @return {undefined}
   */
  registerPage(path, component) {
    if (!path || !component) {
      return throwError(new Error('Please provide all required arguments'));
    }

    const existingPage = this.definition.find((route) => route.path === path);

    if (existingPage && existingPage.component === component) {
      return;
    } else if (existingPage) {
      return throwError(new Error(`Attempt to override a page at ${path}!`));
    }

    this.definition.push({
      component,
      path,
      type: Route
    });

    this.emit(ROUTING_CHANGE);
  }

  /**
   * registerTab - adds a tab route to the queue
   *
   * @param  {String} pagePath a path to a parent page
   * @param  {String} tabPath a path to the tab
   * @param  {React.Component} component a React.js component of the tab
   * @return {undefined}
   */
  registerTab(pagePath, tabPath, component) {
    if (!pagePath || !tabPath || !component) {
      return throwError(new Error('Please provide all required arguments'));
    }

    const page = this.definition.find((route) => route.path === pagePath);

    if (!page) {
      return this.defer(arguments);
    }

    if (!page.children) {
      page.children = [];
    }

    const existingTab = page.children.find((route) => route.path === tabPath);

    if (existingTab && existingTab.component === component) {
      return;
    } else if (existingTab) {
      return throwError(new Error(`Attempt to override a tab at ${pagePath}/${tabPath}!`));
    }

    page.children.push({
      component,
      path: tabPath,
      type: Route
    });

    this.emit(ROUTING_CHANGE);
  }

  /**
   * registerRedirect
   *
   * @param  {String} path a path to redirect from
   * @param  {String} to   a path to redirect to
   * @return {undefined}
   */
  registerRedirect(path, to) {
    const existingRedirect = this.definition.find((route) => {
      return route.type === Redirect && route.path === path;
    });

    if (existingRedirect && existingRedirect.to === to) {
      return;
    } else if (existingRedirect) {
      return throwError(new Error(`Attempt to override Redirect of ${path} from ${existingRedirect.to} to ${to}!`));
    }

    this.definition.push({
      path,
      to,
      type: Redirect
    });
    this.emit(ROUTING_CHANGE);
  }

}

module.exports = RoutingService;
