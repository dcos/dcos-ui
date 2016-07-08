var classNames = require('classnames');
var GeminiScrollbar = require('react-gemini-scrollbar');
var Link = require('react-router').Link;
var React = require('react');
var State = require('react-router').State;
import {Tooltip} from 'reactjs-components';

import ClusterHeader from './ClusterHeader';
// import Config from '../config/Config';
var EventTypes = require('../constants/EventTypes');
import Icon from './Icon';
// import IconDCOSLogoMark from './icons/IconDCOSLogoMark';
import {keyCodes} from '../utils/KeyboardUtil';
var InternalStorageMixin = require('../mixins/InternalStorageMixin');
var MesosSummaryStore = require('../stores/MesosSummaryStore');
import MetadataStore from '../stores/MetadataStore';
import NotificationStore from '../stores/NotificationStore';
import PluginSDK from 'PluginSDK';
import SaveStateMixin from '../mixins/SaveStateMixin';
var SidebarActions = require('../events/SidebarActions');

let defaultMenuItems = [
  'dashboard',
  'services-page',
  'jobs-page',
  'nodes-list',
  'network',
  'universe',
  'system'
];

let {Hooks} = PluginSDK;

var Sidebar = React.createClass({

  displayName: 'Sidebar',

  saveState_key: 'sidebar',

  saveState_properties: ['sidebarExpanded'],

  mixins: [SaveStateMixin, State, InternalStorageMixin],

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState: function () {
    return {sidebarExpanded: true};
  },

  componentDidMount: function () {
    this.internalStorage_update({
      mesosInfo: MesosSummaryStore.get('states').lastSuccessful()
    });

    MetadataStore.addChangeListener(
      EventTypes.DCOS_METADATA_CHANGE,
      this.onDCOSMetadataChange
    );

    global.window.addEventListener('keydown', this.handleKeyPress, true);
  },

  componentWillUnmount: function () {
    MetadataStore.removeChangeListener(
      EventTypes.DCOS_METADATA_CHANGE,
      this.onDCOSMetadataChange
    );

    global.window.removeEventListener('keydown', this.handleKeyPress, true);
  },

  onDCOSMetadataChange: function () {
    this.forceUpdate();
  },

  handleInstallCLI: function () {
    SidebarActions.close();
    SidebarActions.openCliInstructions();
  },

  handleKeyPress: function (event) {
    let nodeName = event.target.nodeName;
    if (event.keyCode === keyCodes.leftBracket
      && !(nodeName === 'INPUT' || nodeName === 'TEXTAREA')) {
      // #sidebarWidthChange is passed as a callback so that the sidebar
      // has had a chance to update before Gemini re-renders.
      this.setState({sidebarExpanded: !this.state.sidebarExpanded}, () => {
        SidebarActions.sidebarWidthChange();
        this.saveState_save();
      });
    }
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

    return menuItems.map((routeKey) => {
      let notificationCount = NotificationStore.getNotificationCount(routeKey);
      var route = this.context.router.namedRoutes[routeKey];
      // Figure out if current route is active
      var isActive = route.handler.routeConfig.matches.test(currentPath);
      let icon = React.cloneElement(
        route.handler.routeConfig.icon,
        {className: 'sidebar-menu-item-icon icon icon-small'}
      );

      var itemClassSet = classNames({
        'sidebar-menu-item': true,
        'selected': isActive
      });

      let sidebarText = (
        <span className="sidebar-menu-item-label">
          {route.handler.routeConfig.label}
        </span>
      );

      if (notificationCount > 0) {
        sidebarText = (
          <span className="sidebar-menu-item-label badge-container badge-primary">
            <span className="sidebar-menu-item-label-text">
              {route.handler.routeConfig.label}
            </span>
            <span className="badge text-align-center">{notificationCount}</span>
          </span>
        );
      }

      return (
        <li className={itemClassSet} key={route.name}>
          <Link to={route.name}>
            {icon}
            {sidebarText}
          </Link>
        </li>
      );

    });
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

  render: function () {
    let sidebarClasses = classNames('sidebar flex flex-direction-top-to-bottom flex-item-shrink-0', {
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
          className="navigation flex-item-grow-1 flex-item-shrink-1 inverse"
          >
          <div className="navigation-inner pod pod-short pod-narrow">
            <div className="sidebar-section pod pod-shorter flush-top flush-left flush-right">
              <ul className="sidebar-menu">
                {this.getMenuItems()}
              </ul>
            </div>
            <div className="sidebar-section pod pod-shorter flush-top flush-left flush-right">
              <h6 className="sidebar-section-header inverse">
                Resources
              </h6>
              <ul className="sidebar-menu">
                {this.getMenuItems()}
              </ul>
            </div>
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
