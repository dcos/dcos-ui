import classNames from 'classnames/dedupe';
import {Link} from 'react-router';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import TabsUtil from '../utils/TabsUtil';
import Util from '../utils/Util';
import NotificationStore from '../stores/NotificationStore';

/**
 * Adds tabs-specific methods onto a class.
 *
 * Note that routes may be cascaded where multiple tab hierarchies are in place
 * by prefixing one route with another, eg the route 'universe-packages-detail'
 * will result in the tab 'universe-packages' being highlighted as active.
 *
 * @mixin
 * @see {@link TabsUtil}
 * @example
 * class PageWithRoutableTabs extends mixin(TabsMixin) {
 *   constructor() {
 *     super(...args);
 *     // The default selected tab may be defined so:
 *     this.state = {
 *       currentTab: 'defined-route-1'
 *     }
 *   }
 *   componentWillMount() {
 *     // The keys to this object must be defined routes
 *     this.tabs_tabs = {
 *      'defined-route-1': 'Tab Title 1',
 *      'defined-route-2': 'Tab Title 2'
 *     }
 *     this.updateCurrentTab();
 *   }
 *   getNavigation() {
 *     return (
 *       <ul>
 *         {this.tabs_getRoutedTabs()}
 *       </ul>
 *     );
 *   }
 *   render() {
 *     return (
 *       <Page
 *         navigation={this.getNavigation()}>
 *         <RouteHandler />
 *       </Page>
 *     );
 *   }
 * }
 */
const TabsMixin = {
  /**
   * Returns a tab that has a callback when clicked.
   * @see #tabs_handleTabClick
   *
   * @param  {Object} props to be added to the Link item
   * @param  {String} tab key of tab to render
   * @return {Component} React component to render
   */
  tabs_getUnroutedItem(props = {}, tab) {
    let attributes = Util.omit(props, ['classNames']);
    let tabLabelClass = classNames({'tab-item-label': true}, props.classNames);

    return (
      <span
        className={tabLabelClass}
        onClick={this.tabs_handleTabClick.bind(this, tab)}
        {...attributes}>
        <span className="tab-item-label-text">
          {this.tabs_tabs[tab]}
        </span>
      </span>
    );
  },

  /**
   * Will return an array of tabs to be rendered.
   * Will only have onClick handlers, as these tabs are not routable.
   *
   * @param  {Object} props to be added to the active component
   * @return {Array} of tabs to render
   */
  tabs_getUnroutedTabs(props) {
    return TabsUtil.getTabs(
      this.tabs_tabs,
      this.state.currentTab,
      this.tabs_getUnroutedItem.bind(this, props)
    );
  },

  /**
   * Returns a Link for a given tab. This tab is expected to be routable.
   *
   * @param  {Object} props to be added to the Link item
   * @param  {String} tab key of tab to render
   * @return {Component} React component to render
   */
  tabs_getRoutedItem(props = {}, tab) {
    let attributes = Util.omit(props, ['classNames']);
    let notificationCount = NotificationStore.getNotificationCount(tab);
    let tabLabelClass = classNames({'tab-item-label': true}, props.classNames);

    if (notificationCount > 0) {
      return (
        <Link
          to={tab}
          className={tabLabelClass}
          onClick={this.tabs_handleTabClick.bind(this, tab)}
          {...attributes}>
          <span className="tab-item-label-text">
            {this.tabs_tabs[tab]}
          </span>
          <span className="badge-container badge-primary">
            <span className="badge text-align-center">{notificationCount}</span>
          </span>
        </Link>
      );
    }

    return (
      <Link
        to={tab}
        className={tabLabelClass}
        onClick={this.tabs_handleTabClick.bind(this, tab)}
        {...attributes}>
        <span className="tab-item-label-text">
          {this.tabs_tabs[tab]}
        </span>
      </Link>
    );
  },

  /**
   * Will return an array of routed tabs to be rendered.
   * Will have onClick handlers and active Link components with routes
   *
   * @param  {Object} props to be added to the active component
   * @return {Array} of tabs to render
   */
  tabs_getRoutedTabs(props) {
    return TabsUtil.getTabs(
      this.tabs_tabs,
      this.state.currentTab,
      this.tabs_getRoutedItem.bind(this, props)
    );
  },

  /**
   * Calls the function to render the active tab
   *
   * @return {Component} the result of the appropriate render function
   */
  tabs_getTabView() {
    // Replace spaces in the currentTab string because we are calling the string
    // as a function on the component, and functions cannot have spaces.
    let currentTab = this.tabs_tabs[this.state.currentTab].replace(' ', '');
    let renderFunction = this[`render${currentTab}TabView`];

    if (renderFunction == null) {
      return null;
    }

    return renderFunction.apply(this, arguments);
  },

  tabs_handleTabClick(nextTab) {
    this.setState({currentTab: nextTab});
  }
};

module.exports = TabsMixin;
