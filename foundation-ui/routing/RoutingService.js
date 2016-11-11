import {Route, Redirect} from 'react-router';
import {EventEmitter} from 'events';

import EventTypes from './EventTypes';

class RoutingService extends EventEmitter {

  constructor() {
    super();

    this.deferredTasks = [];
    this.definition = [];

    this.on(EventTypes.ROUTING_CHANGE, this.processDeferred);
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

  /**
   * registerPage - adds a page route to the queue
   *
   * @param  {String} path a path to the page
   * @param  {React.Component} component a React.js component of the page
   * @return {undefined}
   */
  registerPage(path, component) {
    if (!path || !component) {
      throw new Error('Please provide all required arguments');
    }

    const existingRoute = this.definition.find((route) => route.path === path);

    if (existingRoute && existingRoute.component === component) {
      return;
    } else if (existingRoute) {
      throw new Error(`Attempt to override a page at ${path}!`);
    }

    this.definition.push({
      component,
      path,
      type: Route
    });

    this.emit(EventTypes.ROUTING_CHANGE);
  }

  /**
   * registerTab - adds a tab route to the queue
   *
   * @param  {String} path a path to a parent page
   * @param  {String} tabPath a path to the tab
   * @param  {React.Component} component a React.js component of the tab
   * @return {undefined}
   */
  registerTab(path, tabPath, component) {
    if (!path || !tabPath || !component) {
      throw new Error('Please provide all required arguments');
    }

    const parent = this.definition.find((route) => route.path === path);

    if (!parent) {
      return this.defer('registerTab', arguments);
    }

    if (!parent.children) {
      parent.children = [];
    }

    const existingTab = parent.children.find((route) => route.path === tabPath);

    if (existingTab && existingTab.component === component) {
      return;
    } else if (existingTab) {
      throw new Error(`Attempt to override a tab at ${path}/${tabPath}!`);
    }

    parent.children.push({
      component,
      path: tabPath,
      type: Route
    });

    this.emit(EventTypes.ROUTING_CHANGE);
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
      throw new Error(`Attempt to override Redirect of ${path} from ${existingRedirect.to} to ${to}!`);
    }

    this.definition.push({
      path,
      to,
      type: Redirect
    });
    this.emit(EventTypes.ROUTING_CHANGE);
  }

}

module.exports = RoutingService;
