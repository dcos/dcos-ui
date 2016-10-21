import classNames from 'classnames';
import GeminiScrollbar from 'react-gemini-scrollbar';
import {Link} from 'react-router';
import React from 'react';
import {Tooltip} from 'reactjs-components';
import PluginSDK from 'PluginSDK';

import ClusterHeader from './ClusterHeader';
import EventTypes from '../constants/EventTypes';
import Icon from './Icon';
import {keyCodes} from '../utils/KeyboardUtil';
import InternalStorageMixin from '../mixins/InternalStorageMixin';
import MesosSummaryStore from '../stores/MesosSummaryStore';
import MetadataStore from '../stores/MetadataStore';
import NotificationStore from '../stores/NotificationStore';
import SaveStateMixin from '../mixins/SaveStateMixin';
import SidebarActions from '../events/SidebarActions';

let {Hooks} = PluginSDK;

var Sidebar = React.createClass({

  displayName: 'Sidebar',

  saveState_key: 'sidebar',

  saveState_properties: ['sidebarExpanded'],

  mixins: [SaveStateMixin, InternalStorageMixin],

  contextTypes: {
    router: React.PropTypes.object
  },

  getInitialState() {
    return {sidebarExpanded: true};
  },

  componentDidMount() {
    this.internalStorage_update({
      mesosInfo: MesosSummaryStore.get('states').lastSuccessful()
    });

    MetadataStore.addChangeListener(
      EventTypes.DCOS_METADATA_CHANGE,
      this.onDCOSMetadataChange
    );

    global.window.addEventListener('keydown', this.handleKeyPress, true);
  },

  componentWillUnmount() {
    MetadataStore.removeChangeListener(
      EventTypes.DCOS_METADATA_CHANGE,
      this.onDCOSMetadataChange
    );

    global.window.removeEventListener('keydown', this.handleKeyPress, true);
  },

  onDCOSMetadataChange() {
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
      this.setState({sidebarExpanded: !this.state.sidebarExpanded}, () => {
        SidebarActions.sidebarWidthChange();
        this.saveState_save();
      });
    }
  },

  handleVersionClick() {
    SidebarActions.close();
    SidebarActions.showVersions();
  },

  getNavigationSections() {
    let indexRoute = this.props.routes
      .find(function (route) {
        return route.id === 'index';
      });

    return this.getMenuGroupsFromChildren(indexRoute.childRoutes)
      .map((group, index) => {
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
            {this.getNavigationGroup(group, this.props.location.pathname)}
          </div>
        );
      });
  },

  getGroupSubmenu({path, childRoutes = []}, {currentPath, isParentActive}) {
    let submenu = null;
    let isChildActive = false;

    if (isParentActive) {
      let menuItems = childRoutes.reduce(function (childRoutes, currentChild) {
        if (currentChild.isInSidebar) {
          let routeLabel = currentChild.path;
          let isActive = false;

          // Get the route label defined on the route's component.
          if (currentChild.component && currentChild.component.routeConfig) {
            routeLabel = currentChild.component.routeConfig.label;
            isActive = currentChild.component.routeConfig.matches
              .test(currentPath);
          }

          let menuItemClasses = classNames({selected: isActive});

          if (!isChildActive && isActive) {
            isChildActive = true;
          }

          childRoutes.push(
            <li className={menuItemClasses} key={routeLabel}>
              <Link to={`/${path}/${currentChild.path}`}>{routeLabel}</Link>
            </li>
          );
        }

        return childRoutes;
      }, []);

      if (menuItems.length) {
        submenu = <ul>{menuItems}</ul>;
      }
    }

    return {submenu, isChildActive};
  },

  getMenuGroupsFromChildren(appRoutes) {
    let groupIndexMap = {};

    // Loop over each top-level route and place into categories.
    return appRoutes.reduce(function (topLevelRoutes, route) {
      if (route.isInSidebar) {
        let {category} = route;

        // Assign an unused index to the new route category if we don't already
        // have an index assigned to that category.
        if (groupIndexMap[category] == null) {
          let newGroupIndex = topLevelRoutes.length;

          groupIndexMap[category] = newGroupIndex;
          topLevelRoutes[newGroupIndex] = {category, routes: []};
        }

        // Append the route to the corresponding category's list of routes.
        topLevelRoutes[groupIndexMap[category]].routes.push(route);
      }

      return topLevelRoutes;
    }, []);
  },

  getNavigationGroup(group, currentPath) {
    let groupMenuItems = group.routes.map((route, index) => {
      let icon = React.cloneElement(
        route.component.routeConfig.icon,
        {className: 'sidebar-menu-item-icon icon icon-small'}
      );
      let hasChildren = route.childRoutes && route.childRoutes.length !== 0;
      let notificationCount = NotificationStore.getNotificationCount(route.path);
      let isParentActive = route.component.routeConfig.matches.test(currentPath);
      let {isChildActive, submenu} = this.getGroupSubmenu(route, {
        currentPath,
        isParentActive
      });
      let sidebarText = (
        <span className="sidebar-menu-item-label">
          {route.component.routeConfig.label}
        </span>
      );

      if (notificationCount > 0) {
        sidebarText = (
          <span className="sidebar-menu-item-label badge-container">
            <span className="sidebar-menu-item-label-text badge-container-text">
              {route.component.routeConfig.label}
            </span>
            <span className="badge">{notificationCount}</span>
          </span>
        );
      }

      let itemClassSet = classNames({
        'sidebar-menu-item': true,
        selected: isParentActive && !isChildActive,
        open: isParentActive && hasChildren
      });

      return (
        <li className={itemClassSet} key={index}>
          <Link to={route.path}>{icon}{sidebarText}</Link>
          {submenu}
        </li>
      );
    });

    return <ul className="sidebar-menu">{groupMenuItems}</ul>;
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

  getFooter() {
    let defaultButtonSet = [(
      <Tooltip content="Documentation" key="button-docs" elementTag="a"
        href={MetadataStore.buildDocsURI('/')} target="_blank"
        wrapperClassName="button button-link tooltip-wrapper">
        <Icon className="clickable" id="pages" />
      </Tooltip>
    ), (
      <Tooltip content="Install CLI"
        key="button-cli" elementTag="a" onClick={this.handleInstallCLI}
        wrapperClassName="button button-link tooltip-wrapper">
        <Icon className="clickable" id="cli" />
      </Tooltip>
    )];

    let buttonSet = Hooks.applyFilter(
      'sidebarFooterButtonSet', defaultButtonSet
    );
    let footer = null;

    if (buttonSet && buttonSet.length) {
      footer = <div className="icon-buttons">{buttonSet}</div>;
    }

    return Hooks.applyFilter('sidebarFooter', footer, defaultButtonSet);
  },

  render() {
    let sidebarClasses = classNames('sidebar flex flex-direction-top-to-bottom',
      'flex-item-shrink-0', {
        'is-expanded': this.state.sidebarExpanded
      });

    return (
      <div className={sidebarClasses}>
        <header className="header flex-item-shrink-0">
          <div className="header-inner pod pod-narrow pod-short">
            <ClusterHeader />
          </div>
        </header>
        <GeminiScrollbar autoshow={true}
          className="navigation flex-item-grow-1 flex-item-shrink-1 gm-scrollbar-container-flex">
          <div className="navigation-inner pod pod-short pod-narrow">
            {this.getNavigationSections()}
          </div>
        </GeminiScrollbar>
        <div className="hide footer">
          <div className="footer-inner">
            <div className="pod pod-narrow pod-short">
              {this.getFooter()}
            </div>
          </div>
        </div>
      </div>
    );
  }

});

module.exports = Sidebar;
