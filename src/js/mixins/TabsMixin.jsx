import { Trans } from "@lingui/macro";
import classNames from "classnames/dedupe";
import { Link, formatPattern } from "react-router";

import React from "react";

import { Badge } from "@dcos/ui-kit";
import Util from "../utils/Util";
import NotificationStore from "../stores/NotificationStore";

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
 *   UNSAFE_componentWillMount() {
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
 *         {this.props.children}
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
    const attributes = Util.omit(props, ["classNames"]);
    const tabLabelClass = classNames(
      "menu-tabbed-item-label",
      props.classNames
    );

    return (
      <span
        className={tabLabelClass}
        onClick={this.tabs_handleTabClick.bind(this, tab)}
        {...attributes}
      >
        <Trans
          render="span"
          className="menu-tabbed-item-label-text"
          id={this.tabs_tabs[tab]}
        />
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
    return getTabs(
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
    const attributes = Util.omit(props, ["classNames"]);
    let badge = null;
    const notificationCount = NotificationStore.getNotificationCount(tab);
    const hasNotification = notificationCount > 0;
    const tabLabelClasses = classNames(
      "menu-tabbed-item-label",
      { "badge-container": hasNotification },
      props.classNames
    );
    const textClasses = classNames("menu-tabbed-item-label-text", {
      "badge-container-text": hasNotification
    });

    if (hasNotification) {
      badge = <Badge>{notificationCount}</Badge>;
    }

    return (
      <Link
        to={formatPattern(tab, attributes.params)}
        className={tabLabelClasses}
        onClick={this.tabs_handleTabClick.bind(this, tab)}
        {...attributes}
      >
        <span className={textClasses}>{this.tabs_tabs[tab]}</span>
        {badge}
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
    return getTabs(
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
  tabs_getTabView(...args) {
    // Replace spaces in the currentTab string because we are calling the string
    // as a function on the component, and functions cannot have spaces.
    const currentTab = this.tabs_tabs[this.state.currentTab].replace(" ", "");
    const renderFunction = this[`render${currentTab}TabView`];

    if (renderFunction == null) {
      return null;
    }

    return renderFunction.apply(this, args);
  },

  tabs_handleTabClick(nextTab) {
    this.setState({ currentTab: nextTab });
  }
};

/**
 * Renders tabs for a given array
 * This needs to be in a util because we can
 * have tabs inside of tabs for a component
 *
 * @param  {Object} tabs with a key for each tab to render
 * @param  {String} currentTab currently active tab
 * @param  {Function} getElement render function to render each element
 * @return {Array} of tabs to render
 */
const getTabs = (tabs, currentTab, getElement) => {
  const tabSet = Object.keys(tabs);

  return tabSet.map((tab, index) => {
    const tabClass = classNames({
      "menu-tabbed-item": true,
      active: !!currentTab && currentTab.startsWith(tab)
    });

    return (
      <li className={tabClass} key={tab}>
        {getElement(tab, index)}
      </li>
    );
  });
};

export default TabsMixin;