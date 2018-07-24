import classNames from "classnames";
import GeminiScrollbar from "react-gemini-scrollbar";
import { Link, routerShape } from "react-router";
import React from "react";
import PluginSDK from "PluginSDK";
import { navigation } from "foundation-ui";

import { keyCodes } from "../utils/KeyboardUtil";
import EventTypes from "../constants/EventTypes";
import MetadataStore from "../stores/MetadataStore";
import PrimarySidebarLink from "../components/PrimarySidebarLink";
import ScrollbarUtil from "../utils/ScrollbarUtil";
import SidebarActions from "../events/SidebarActions";
import SidebarHeader from "./SidebarHeader";
import { getCurrentViewport } from "../utils/ViewportUtil";
import * as viewport from "../constants/Viewports";

const {
  NavigationService,
  EventTypes: { NAVIGATION_CHANGE }
} = navigation;

const defaultMenuItems = [
  "/dashboard",
  "/services",
  "/jobs",
  "/catalog",
  "/nodes",
  "/networking",
  "/secrets",
  "/cluster",
  "/components",
  "/settings",
  "/organization"
];

const { Hooks } = PluginSDK;
const METHODS_TO_BIND = [
  "onNavigationChange",
  "onDCOSMetadataChange",
  "handleKeyPress",
  "handleSidebarTransitionEnd"
];

class Sidebar extends React.Component {
  constructor() {
    super();

    this.state = { expandedItems: [] };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    const pathnameSegments = this.props.location.pathname.split("/");

    // If the user loaded the UI from a route other than `/`, we want to display
    // it in its expanded state.
    if (pathnameSegments.length > 1) {
      this.setState({ expandedItems: [`/${pathnameSegments[1]}`] });
    }
  }

  componentDidMount() {
    NavigationService.on(NAVIGATION_CHANGE, this.onNavigationChange);

    MetadataStore.addChangeListener(
      EventTypes.DCOS_METADATA_CHANGE,
      this.onDCOSMetadataChange
    );

    if (this.sidebarWrapperRef) {
      this.sidebarWrapperRef.addEventListener(
        "transitionend",
        this.handleSidebarTransitionEnd
      );
    }

    global.addEventListener("keydown", this.handleKeyPress, true);
  }

  componentWillUnmount() {
    NavigationService.removeListener(
      NAVIGATION_CHANGE,
      this.onNavigationChange
    );

    MetadataStore.removeChangeListener(
      EventTypes.DCOS_METADATA_CHANGE,
      this.onDCOSMetadataChange
    );

    if (this.sidebarWrapperRef) {
      this.sidebarWrapperRef.removeEventListener(
        "transitionend",
        this.handleSidebarTransitionEnd
      );
    }

    global.removeEventListener("keydown", this.handleKeyPress, true);
  }

  onDCOSMetadataChange() {
    this.forceUpdate();
  }

  onNavigationChange() {
    this.forceUpdate();
  }

  handleKeyPress(event) {
    const nodeName = event.target.nodeName;

    if (
      event.keyCode === keyCodes.leftBracket &&
      !(nodeName === "INPUT" || nodeName === "TEXTAREA") &&
      !(event.ctrlKey || event.metaKey || event.shiftKey)
    ) {
      // #sidebarWidthChange is passed as a callback so that the sidebar
      // has had a chance to update before Gemini re-renders.
      this.toggleSidebarDocking();
    }
  }

  handleSubmenuItemClick() {
    if (getCurrentViewport() === viewport.MOBILE) {
      SidebarActions.close();
    }
  }

  handleClusterHeaderUpdate() {
    ScrollbarUtil.updateWithRef(this.geminiRef);
  }

  handlePrimarySidebarLinkClick(element, isChildActive) {
    const { expandedItems } = this.state;
    const { path } = element;
    const expandedItemIndex = expandedItems.indexOf(path);

    if (expandedItemIndex === -1) {
      expandedItems.push(path);
    } else if (!isChildActive) {
      expandedItems.splice(expandedItemIndex, 1);
    }

    this.setState({ expandedItems });
  }

  handleSidebarTransitionEnd(event) {
    // Some elements (graphs and Gemini) need to update when the main content
    // width changes, so we emit an event.
    if (event.target === this.sidebarWrapperRef) {
      SidebarActions.sidebarWidthChange();
    }
  }

  getNavigationSections() {
    const definition = NavigationService.getDefinition();

    return definition.map((group, index) => {
      let heading = null;
      const menuItems = this.getNavigationGroup(group);

      if (menuItems == null) {
        return null;
      }

      if (group.category !== "root") {
        heading = <h3 className="sidebar-section-header">{group.category}</h3>;
      }

      return (
        <div className="sidebar-section" key={index}>
          {heading}
          {menuItems}
        </div>
      );
    });
  }

  getNavigationGroup(group) {
    const menuItems = Hooks.applyFilter(
      "sidebarNavigation",
      defaultMenuItems
    ).reduce((routesMap, path) => routesMap.set(path, true), new Map());

    const filteredItems = group.children.filter(route =>
      menuItems.has(route.path)
    );

    const groupMenuItems = filteredItems.map((element, index) => {
      const { pathname } = this.props.location;

      const hasChildren = element.children && element.children.length !== 0;
      const isExpanded = this.state.expandedItems.includes(element.path);
      const isParentActive = pathname.startsWith(element.path);

      let submenu;
      let isChildActive = false;
      if (isExpanded && hasChildren) {
        [submenu, isChildActive] = this.getGroupSubmenu(
          element.path,
          element.children
        );
      }

      let linkElement = element.link;
      if (typeof linkElement === "string") {
        linkElement = (
          <PrimarySidebarLink
            hasChildren={hasChildren}
            isChildActive={isChildActive}
            isExpanded={isExpanded}
            to={element.path}
            icon={element.options.icon}
            onClick={this.handlePrimarySidebarLinkClick.bind(
              this,
              element,
              isChildActive
            )}
          >
            {linkElement}
          </PrimarySidebarLink>
        );
      }

      const itemClassSet = classNames("sidebar-menu-item", {
        selected: isParentActive && !isChildActive,
        open: isExpanded,
        expandable: hasChildren
      });

      return (
        <li className={itemClassSet} key={index}>
          {linkElement}
          {submenu}
        </li>
      );
    });

    if (groupMenuItems.length) {
      return <ul className="sidebar-menu">{groupMenuItems}</ul>;
    }

    return null;
  }

  getGroupSubmenu(path, children) {
    const { pathname } = this.props.location;
    let isChildActive = false;

    const childRoutesPaths = children.map(({ path }) => path);
    const filteredPaths = Hooks.applyFilter(
      "secondaryNavigation",
      childRoutesPaths,
      path
    );

    const filteredChildRoutes = Array.isArray(filteredPaths)
      ? children.filter(({ path }) => filteredPaths.includes(path))
      : children;

    const menuItems = filteredChildRoutes.reduce(
      (children, currentChild, index) => {
        const isActive =
          currentChild.options.isActiveRegex != null
            ? currentChild.options.isActiveRegex.test(pathname)
            : pathname.startsWith(currentChild.path);

        const menuItemClasses = classNames({ selected: isActive });

        // First matched active child wins,
        // ie in /path/child and /path/child-path without this conditional /path/child-path
        // will always overrule /path/child
        if (!isChildActive && isActive) {
          isChildActive = true;
        }

        let linkElement = currentChild.link;
        if (typeof linkElement === "string") {
          linkElement = <Link to={currentChild.path}>{linkElement}</Link>;
        }

        children.push(
          <li
            className={menuItemClasses}
            key={index}
            onClick={this.handleSubmenuItemClick}
          >
            {linkElement}
          </li>
        );

        return children;
      },
      []
    );

    return [<ul>{menuItems}</ul>, isChildActive];
  }

  getVersion() {
    const data = MetadataStore.get("dcosMetadata");
    if (data == null || data.version == null) {
      return null;
    }

    return <span className="version-number">v.{data.version}</span>;
  }

  toggleSidebarDocking() {
    global.requestAnimationFrame(() => {
      SidebarActions.toggle();
    });
  }

  render() {
    return (
      <div
        className="sidebar-wrapper"
        ref={ref => {
          this.sidebarWrapperRef = ref;
        }}
      >
        <div className="sidebar flex flex-direction-top-to-bottom">
          <SidebarHeader onUpdate={this.handleClusterHeaderUpdate} />
          <GeminiScrollbar
            autoshow={true}
            className="flex-item-grow-1 flex-item-shrink-1 gm-scrollbar-container-flex gm-scrollbar-container-flex-view inverse"
            ref={ref => (this.geminiRef = ref)}
          >
            <div className="sidebar-content-wrapper">
              <div className="sidebar-sections pod">
                {this.getNavigationSections()}
              </div>
            </div>
          </GeminiScrollbar>
        </div>
      </div>
    );
  }
}

Sidebar.contextTypes = {
  router: routerShape
};

module.exports = Sidebar;
