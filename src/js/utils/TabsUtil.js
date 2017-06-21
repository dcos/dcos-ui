import classNames from "classnames";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

const TabsUtil = {
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
  getTabs(tabs, currentTab, getElement) {
    const tabSet = Object.keys(tabs);

    return tabSet.map(function(tab, index) {
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
  },

  /**
   * Sorts tabs based on their priority
   * @param  {Object} tabs - tabs with a key for each tab to render
   * @return {Object}      tabs Object with sorted insertion order
   */
  sortTabs(tabs) {
    const comparator = (a, b) => b[1] - a[1];

    return Object.keys(tabs)
      .map(key => [key, tabs[key].priority || 0])
      .sort(comparator)
      .map(val => val[0])
      .reduce((acc, curr) => {
        acc[curr] = tabs[curr].content;

        return acc;
      }, {});
  }
};

module.exports = TabsUtil;
