import classNames from 'classnames';
import {Link} from 'react-router';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import TabsUtil from '../utils/TabsUtil';

const TabsMixin = {
  /**
   * Returns a tab that has a callback when clicked.
   * @see #tabs_handleTabClick
   *
   * @param  {String} customClasses to be added to the Link item
   * @param  {String} tab key of tab to render
   * @return {Component} React component to render
   */
  tabs_getUnroutedItem(customClasses, tab) {
    let tabLabelClass = classNames(customClasses, {'tab-item-label': true});

    return (
      <span
        className={tabLabelClass}
        onClick={this.tabs_handleTabClick.bind(this, tab)}>
        {this.tabs_tabs[tab]}
      </span>
    );
  },

  /**
   * Will return an array of tabs to be rendered.
   * Will only have onClick handlers, as these tabs are not routable.
   *
   * @param  {String} customClasses to be added to the active component
   * @return {Array} of tabs to render
   */
  tabs_getUnroutedTabs(customClasses) {
    return TabsUtil.getTabs(
      this.tabs_tabs,
      this.state.currentTab,
      this.tabs_getUnroutedItem.bind(this, customClasses)
    );
  },

  /**
   * Returns a Link for a given tab. This tab is expected to be routable.
   *
   * @param  {String} customClasses to be added to the Link item
   * @param  {String} tab key of tab to render
   * @return {Component} React component to render
   */
  tabs_getRoutedItem(customClasses, tab) {
    let tabLabelClass = classNames(customClasses, {'tab-item-label': true});

    return (
      <Link
        to={tab}
        className={tabLabelClass}
        onClick={this.tabs_handleTabClick.bind(this, tab)}>
        {this.tabs_tabs[tab]}
      </Link>
    );
  },

  /**
   * Will return an array of routed tabs to be rendered.
   * Will have onClick handlers and active Link components with routes
   *
   * @param  {String} customClasses to be added to the active component
   * @return {Array} of tabs to render
   */
  tabs_getRoutedTabs(customClasses) {
    return TabsUtil.getTabs(
      this.tabs_tabs,
      this.state.currentTab,
      this.tabs_getRoutedItem.bind(this, customClasses)
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
