var _ = require('underscore');
var classNames = require('classnames');
var GeminiScrollbar = require('react-gemini-scrollbar');
var Link = require('react-router').Link;
var React = require('react');
var State = require('react-router').State;
import {Tooltip} from 'reactjs-components';

import ClusterHeader from './ClusterHeader';
import Config from '../config/Config';
var EventTypes = require('../constants/EventTypes');
import IconDCOSLogoMark from './icons/IconDCOSLogoMark';
import PluginSDK from 'PluginSDK';

var InternalStorageMixin = require('../mixins/InternalStorageMixin');
var MesosSummaryStore = require('../stores/MesosSummaryStore');
var MetadataStore = require('../stores/MetadataStore');
var SidebarActions = require('../events/SidebarActions');

let defaultMenuItems = ['dashboard', 'services', 'nodes-list', 'universe', 'system'];

let {Hooks} = PluginSDK;

var Sidebar = React.createClass({

  displayName: 'Sidebar',

  mixins: [State, InternalStorageMixin],

  contextTypes: {
    router: React.PropTypes.func
  },

  componentDidMount: function () {
    this.internalStorage_update({
      mesosInfo: MesosSummaryStore.get('states').lastSuccessful()
    });

    MetadataStore.addChangeListener(
      EventTypes.DCOS_METADATA_CHANGE,
      this.onDCOSMetadataChange
    );
  },

  componentWillUnmount: function () {
    MetadataStore.removeChangeListener(
      EventTypes.DCOS_METADATA_CHANGE,
      this.onDCOSMetadataChange
    );
  },

  onDCOSMetadataChange: function () {
    this.forceUpdate();
  },

  handleInstallCLI: function () {
    SidebarActions.close();
    SidebarActions.openCliInstructions();
  },

  handleVersionClick: function () {
    SidebarActions.close();
    SidebarActions.showVersions();
  },

  getMenuItems: function () {
    let currentPath = this.context.router.getLocation().getCurrentPath();

    const menuItems = Hooks.applyFilter(
      'sidebarNavigation',
      defaultMenuItems
    );

    return _.map(menuItems, function (routeKey) {
      var route = this.context.router.namedRoutes[routeKey];
      // Figure out if current route is active
      var isActive = route.handler.routeConfig.matches.test(currentPath);
      var iconClasses = {
        'sidebar-menu-item-icon icon icon-sprite icon-sprite-medium': true,
        'icon-sprite-medium-color': isActive,
        'icon-sprite-medium-black': !isActive
      };

      iconClasses[`icon-${route.handler.routeConfig.icon}`] = true;

      var itemClassSet = classNames({
        'sidebar-menu-item': true,
        'selected': isActive
      });

      return (
        <li className={itemClassSet} key={route.name}>
          <Link to={route.name}>
            <i className={classNames(iconClasses)}></i>
            <span className="sidebar-menu-item-label h4 flush">
              {route.handler.routeConfig.label}
            </span>
          </Link>
        </li>
      );

    }, this);
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
    let defaultButtonSet = [
      (
        <Tooltip content="Documentation" key="button-docs" elementTag="a"
          href={`${Config.documentationURI}/`} target="_blank"
          wrapperClassName="button button-link tooltip-wrapper">
          <i className="icon icon-sprite icon-documents icon-sprite-medium clickable"></i>
        </Tooltip>
      ),
      (
        <Tooltip content="Install CLI"
          key="button-cli" elementTag="a" onClick={this.handleInstallCLI}
          wrapperClassName="button button-link tooltip-wrapper">
          <i className="icon icon-sprite icon-cli icon-sprite-medium clickable"></i>
        </Tooltip>
      )
    ];

    let buttonSet = Hooks.applyFilter(
      'sidebarFooterButtonSet', defaultButtonSet
    );
    let footer = null;

    if (buttonSet && buttonSet.length) {
      footer = <div className="icon-buttons">{buttonSet}</div>;
    }

    return Hooks.applyFilter('sidebarFooter', footer, defaultButtonSet);
  },

  render: function () {
    return (
      <div className="sidebar flex-container-col">
        <div className="sidebar-header">
          <ClusterHeader />
        </div>
        <GeminiScrollbar autoshow={true} className="sidebar-content container-scrollable">
          <nav>
            <div className="container container-fluid container-fluid-narrow">
              <ul className="sidebar-menu list-unstyled">
                {this.getMenuItems()}
              </ul>
            </div>
          </nav>
        </GeminiScrollbar>
        <div className="sidebar-footer">
          <div className="container container-fluid container-pod container-pod-short logo-container">
            <div className="sidebar-footer-image">
              <a href={Config.productHomepageURI} target="_blank">
                <IconDCOSLogoMark />
              </a>
            </div>
            <p className="text-align-center flush-top flush-bottom mute small">
              <span className="clickable" onClick={this.handleVersionClick}>
                <span className="company-name small">{Config.productName} </span>
                <span className="app-name small">{this.getVersion()}</span>
              </span>
            </p>
          </div>
          {this.getFooter()}
        </div>
      </div>
    );
  }

});

module.exports = Sidebar;
