import classNames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import GeminiScrollbar from 'react-gemini-scrollbar';
import {Link, routerShape} from 'react-router';
import React from 'react';
import PluginSDK from 'PluginSDK';

import {keyCodes} from '../utils/KeyboardUtil';
import ClusterHeader from './ClusterHeader';
import EventTypes from '../constants/EventTypes';
import Icon from '../components/Icon';
import InternalStorageMixin from '../mixins/InternalStorageMixin';
import MesosSummaryStore from '../stores/MesosSummaryStore';
import MetadataStore from '../stores/MetadataStore';
import PrimarySidebarLink from '../components/PrimarySidebarLink';
import SaveStateMixin from '../mixins/SaveStateMixin';
import SidebarActions from '../events/SidebarActions';
import SidebarStore from '../stores/SidebarStore';
import UserAccountDropdown from './UserAccountDropdown';

const {
  NavigationService,
  EventTypes: {NAVIGATION_CHANGE}} = PluginSDK.get('navigation');

let defaultMenuItems = [
  '/dashboard',
  '/services',
  '/jobs',
  '/universe',
  '/nodes',
  '/networking',
  '/security',
  '/cluster',
  '/components',
  '/settings',
  '/organization'
];

let {Hooks} = PluginSDK;

var Sidebar = React.createClass({

  displayName: 'Sidebar',

  saveState_key: 'sidebar',

  saveState_properties: ['isDocked'],

  mixins: [SaveStateMixin, InternalStorageMixin],

  contextTypes: {
    router: routerShape
  },

  componentDidMount() {
    NavigationService.on(NAVIGATION_CHANGE, this.onNavigationChange);

    this.internalStorage_update({
      mesosInfo: MesosSummaryStore.get('states').lastSuccessful()
    });

    MetadataStore.addChangeListener(
      EventTypes.DCOS_METADATA_CHANGE,
      this.onDCOSMetadataChange
    );

    if (this.sidebarRef) {
      this.sidebarRef.addEventListener(
        'transitionend',
        this.handleSidebarTransitionEnd
      );
    }

    if (this.state.isDocked !== SidebarStore.get('isDocked')) {
      if (this.state.isDocked) {
        SidebarActions.undock();
      } else {
        SidebarActions.dock();
      }
    }

    global.window.addEventListener('keydown', this.handleKeyPress, true);
  },

  componentWillUnmount() {
    NavigationService.removeListener(
      NAVIGATION_CHANGE,
      this.onNavigationChange
    );

    MetadataStore.removeChangeListener(
      EventTypes.DCOS_METADATA_CHANGE,
      this.onDCOSMetadataChange
    );

    global.window.removeEventListener('keydown', this.handleKeyPress, true);
  },

  onDCOSMetadataChange() {
    this.forceUpdate();
  },

  onNavigationChange() {
    this.forceUpdate();
  },

  handleInstallCLI() {
    SidebarActions.close();
    SidebarActions.openCliInstructions();
  },

  handleKeyPress(event) {
    let nodeName = event.target.nodeName;

    if (event.keyCode === keyCodes.leftBracket
      && !(nodeName === 'INPUT' || nodeName === 'TEXTAREA')
      && !(event.ctrlKey || event.metaKey || event.shiftKey)) {
      // #sidebarWidthChange is passed as a callback so that the sidebar
      // has had a chance to update before Gemini re-renders.
      this.toggleSidebarDocking();
    }
  },

  handleVersionClick() {
    SidebarActions.close();
    SidebarActions.showVersions();
  },

  getNavigationSections() {
    const definition = NavigationService.getDefinition();

    return definition.map((group, index) => {
      let heading = null;

      if (group.category !== 'root') {
        heading = (
          <h6 className="sidebar-section-header">
            {group.category}
          </h6>
        );
      }

      return (
        <div className="sidebar-section pod pod-shorter flush-top flush-left flush-right"
          key={index}>
          {heading}
          {this.getNavigationGroup(group)}
        </div>
      );
    });
  },

  getNavigationGroup(group) {
    const menuItems = Hooks
      .applyFilter('sidebarNavigation', defaultMenuItems)
      .reduce((routesMap, path) => routesMap.set(path, true), new Map());

    const filteredItems = group.children
     .filter((route) => menuItems.has(route.path));

    let groupMenuItems = filteredItems.map((element, index) => {
      let {pathname} = this.props.location;

      let hasChildren = element.children && element.children.length !== 0;
      let isParentActive = pathname.startsWith(element.path);

      let submenu;
      let isChildActive = false;
      if (isParentActive && hasChildren) {
        [submenu, isChildActive] = this.getGroupSubmenu(
          group.path, element.children);
      }

      let linkElement = element.link;
      if (typeof linkElement === 'string') {
        linkElement = (
          <PrimarySidebarLink
            to={element.path}
            icon={element.options.icon}>
            {linkElement}
          </PrimarySidebarLink>
        );
      }

      let itemClassSet = classNames({
        'sidebar-menu-item': true,
        selected: isParentActive && !isChildActive,
        open: isParentActive && hasChildren
      });

      return (
        <li className={itemClassSet} key={index}>
          {linkElement}
          {submenu}
        </li>
      );
    });

    return <ul className="sidebar-menu">{groupMenuItems}</ul>;
  },

  getGroupSubmenu(path, children) {
    const {pathname} = this.props.location;
    let isChildActive = false;

    const childRoutesPaths = children.map(({path}) => path);
    const filteredPaths = Hooks
        .applyFilter('secondaryNavigation', path, childRoutesPaths);

    // Defaulting to unfiltered set of paths
    const childRoutesMap = (filteredPaths || childRoutesPaths)
        .reduce((routesMap, path) => routesMap.set(path, true), new Map());

    const filteredChildRoutes =
        children.filter(({path}) => childRoutesMap.has(path));

    let menuItems = filteredChildRoutes.reduce(function (children, currentChild, index) {
      let isActive = pathname.startsWith(currentChild.path);

      let menuItemClasses = classNames({selected: isActive});

      // First matched active child wins,
      // ie in /path/child and /path/child-path without this conditional /path/child-path
      // will always overrule /path/child
      if (!isChildActive && isActive) {
        isChildActive = true;
      }

      let linkElement = currentChild.link;
      if (typeof linkElement === 'string') {
        linkElement = <Link to={currentChild.path}>{linkElement}</Link>;
      }

      children.push(
        <li className={menuItemClasses} key={index}>
          {linkElement}
        </li>
      );

      return children;
    }, []);

    return [<ul>{menuItems}</ul>, isChildActive];
  },

  getVersion() {
    let data = MetadataStore.get('dcosMetadata');
    if (data == null || data.version == null) {
      return null;
    }

    return (
      <span className="version-number">v.{data.version}</span>
    );
  },

  getSidebarHeader() {
    const defaultItems = [
      {
        className: 'hidden',
        html: <ClusterHeader showCaret={true} useClipboard={false} />,
        id: 'dropdown-trigger'
      },
      {
        className: 'dropdown-menu-section-header flush-top',
        html: <label>Support</label>,
        id: 'header-a',
        selectable: false
      },
      {
        html: 'Documentation',
        id: 'documentation',
        onClick: () => {
          global.open(MetadataStore.buildDocsURI('/'), '_blank');
        }
      },
      {
        html: 'Install CLI',
        id: 'install-cli',
        onClick: this.handleInstallCLI
      }
    ];

    return (
      <UserAccountDropdown
        menuItems={Hooks.applyFilter('userDropdownItems', defaultItems)} />
    );
  },

  handleSidebarTransitionEnd(event) {
    // Some elements (graphs and Gemini) need to update when the main content
    // width canges, so we emit an event.
    if (event.target === this.sidebarRef) {
      SidebarActions.sidebarWidthChange();
    }
  },

  handleOverlayClick() {
    SidebarActions.close();
  },

  toggleSidebarDocking() {
    global.requestAnimationFrame(() => {
      if (SidebarStore.get('isDocked')) {
        SidebarActions.undock();
      } else {
        SidebarActions.dock();
      }

      this.saveState_save();
    });
  },

  render() {
    let overlay = null;

    if (SidebarStore.get('isVisible')) {
      overlay = (
        <div className="sidebar-backdrop" onClick={this.handleOverlayClick} />
      );
    }

    return (
      <div className="sidebar-wrapper">
        <CSSTransitionGroup
          transitionName="sidebar-backdrop"
          transitionEnterTimeout={250}
          transitionLeaveTimeout={250}>
          {overlay}
        </CSSTransitionGroup>
        <div className="sidebar flex flex-direction-top-to-bottom"
          ref={(ref) => { this.sidebarRef = ref; }}>
          <header className="header flex-item-shrink-0">
            {this.getSidebarHeader()}
          </header>
          <GeminiScrollbar autoshow={true}
            className="flex-item-grow-1 flex-item-shrink-1 gm-scrollbar-container-flex gm-scrollbar-container-flex-view">
            <div className="sidebar-content-wrapper">
              <div className="sidebar-sections pod pod-short pod-narrow">
                {this.getNavigationSections()}
              </div>
              <div className="sidebar-dock-container pod pod-short pod-narrow flush-top">
                <Icon className="sidebar-dock-trigger"
                  size="mini"
                  id="sidebar-collapse"
                  onClick={this.toggleSidebarDocking} />
              </div>
            </div>
          </GeminiScrollbar>
        </div>
      </div>
    );
  }

});

module.exports = Sidebar;
