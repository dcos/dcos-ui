import classNames from 'classnames';
import GeminiScrollbar from 'react-gemini-scrollbar';
import {Link, routerShape} from 'react-router';
import React from 'react';
import {Tooltip} from 'reactjs-components';
import PluginSDK from 'PluginSDK';

import {keyCodes} from '../utils/KeyboardUtil';
import ClusterHeader from './ClusterHeader';
import EventTypes from '../constants/EventTypes';
import Icon from './Icon';
import InternalStorageMixin from '../mixins/InternalStorageMixin';
import MesosSummaryStore from '../stores/MesosSummaryStore';
import MetadataStore from '../stores/MetadataStore';
import PrimarySidebarLink from '../components/PrimarySidebarLink';
import SaveStateMixin from '../mixins/SaveStateMixin';
import SidebarActions from '../events/SidebarActions';

const {
  NavigationService,
  EventTypes: {NAVIGATION_CHANGE}} = PluginSDK.get('navigation');

let defaultMenuItems = [
  '/dashboard',
  '/services',
  '/jobs',
  '/universe',
  '/nodes',
  '/network',
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

  saveState_properties: ['sidebarExpanded'],

  mixins: [SaveStateMixin, InternalStorageMixin],

  contextTypes: {
    router: routerShape
  },

  getInitialState() {
    return {sidebarExpanded: true};
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
    const childRoutesMap = Hooks
        .applyFilter('secondaryNavigation', path, childRoutesPaths)
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
