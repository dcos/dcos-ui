var _ = require('underscore');
var classNames = require('classnames');
var React = require('react');
var RouteHandler = require('react-router').RouteHandler;
import {StoreMixin} from 'mesosphere-shared-reactjs';

var Config = require('../config/Config');
import ConfigStore from '../stores/ConfigStore';
import EventTypes from '../constants/EventTypes';
import HistoryStore from '../stores/HistoryStore';
import IconDCOSLogoMark from '../components/icons/IconDCOSLogoMark';
var InternalStorageMixin = require('../mixins/InternalStorageMixin');
var MetadataStore = require('../stores/MetadataStore');
var MesosSummaryStore = require('../stores/MesosSummaryStore');
var Modals = require('../components/Modals');
var RequestErrorMsg = require('../components/RequestErrorMsg');
import ServerErrorModal from '../components/ServerErrorModal';
var Sidebar = require('../components/Sidebar');
var SidebarActions = require('../events/SidebarActions');
var SidebarStore = require('../stores/SidebarStore');

function getSidebarState() {
  return {
    isOpen: SidebarStore.get('isOpen')
  };
}

var Index = React.createClass({

  displayName: 'Index',

  mixins: [InternalStorageMixin, StoreMixin],

  getInitialState: function () {
    return {
      mesosSummaryErrorCount: 0,
      showErrorModal: false,
      modalErrorMsg: '',
      configErrorCount: 0
    };
  },

  componentWillMount: function () {
    HistoryStore.init();
    MesosSummaryStore.init();
    MetadataStore.init();
    SidebarStore.init();

    // We want to always request the summary endpoint. This will ensure that
    // our charts always have data to render.
    this.store_listeners = [{
      name: 'summary',
      events: ['success', 'error'],
      suppressUpdate: true
    }];

    let state = getSidebarState();
    state.metadataLoaded = false;
    this.internalStorage_set(state);
  },

  componentDidMount: function () {
    SidebarStore.addChangeListener(
      EventTypes.SIDEBAR_CHANGE, this.onSideBarChange
    );
    window.addEventListener('resize', SidebarActions.close);

    ConfigStore.addChangeListener(
      EventTypes.CONFIG_ERROR, this.onConfigError
    );

    MetadataStore.addChangeListener(
      EventTypes.METADATA_CHANGE, this.onMetadataStoreSuccess
    );
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    return !(_.isEqual(this.props, nextProps) &&
        _.isEqual(this.state, nextState));
  },

  componentWillUnmount: function () {
    SidebarStore.removeChangeListener(
      EventTypes.SIDEBAR_CHANGE, this.onSideBarChange
    );
    window.removeEventListener('resize', SidebarActions.close);

    ConfigStore.removeChangeListener(
      EventTypes.CONFIG_ERROR, this.onConfigError
    );

    MetadataStore.removeChangeListener(
      EventTypes.METADATA_CHANGE, this.onMetadataStoreSuccess
    );

    MesosSummaryStore.unmount();
  },

  onSideBarChange: function () {
    this.internalStorage_update(getSidebarState());
    this.forceUpdate();
  },

  onMetadataStoreSuccess: function () {
    this.internalStorage_update({'metadataLoaded': true});
  },

  onConfigError: function () {
    this.setState({configErrorCount: this.state.configErrorCount + 1});

    if (this.state.configErrorCount < Config.delayAfterErrorCount) {
      ConfigStore.fetchConfig();
    }
  },

  onSummaryStoreSuccess: function () {
    let prevStatesProcessed = this.internalStorage_get().statesProcessed;

    // Reset count as we've just received a successful response
    if (this.state.mesosSummaryErrorCount > 0) {
      this.setState({mesosSummaryErrorCount: 0});
    } else if (!prevStatesProcessed) {
      // This conditional is needed to remove the loading screen after
      // receiving a successful server response. This forceupdate should only
      // run once, otherwise the whole application will update.
      this.forceUpdate();
    }
  },

  onSummaryStoreError: function () {
    this.setState({
      mesosSummaryErrorCount: this.state.mesosSummaryErrorCount + 1
    });
  },

  getLoadingScreen: function (showLoadingScreen) {
    if (!showLoadingScreen) {
      return null;
    }

    return (
      <div className="application-loading-indicator container container-pod vertical-center">
        <IconDCOSLogoMark />
      </div>
    );
  },

  getErrorScreen: function (showErrorScreen) {
    if (!showErrorScreen) {
      return null;
    }

    return <RequestErrorMsg />;
  },

  getScreenOverlays: function (showLoadingScreen, showErrorScreen) {
    if (!showLoadingScreen && !showErrorScreen) {
      return null;
    }

    return (
      <div className="container container-pod vertical-center">
        {this.getErrorScreen(showErrorScreen)}
        {this.getLoadingScreen(showLoadingScreen)}
      </div>
    );
  },

  render: function () {
    var data = this.internalStorage_get();
    let showErrorScreen =
      (this.state.mesosSummaryErrorCount >= Config.delayAfterErrorCount)
      || (this.state.configErrorCount >= Config.delayAfterErrorCount);
    let showLoadingScreen = !showErrorScreen
      && (!MesosSummaryStore.get('statesProcessed') || !data.metadataLoaded);

    var classSet = classNames({
      'canvas-sidebar-open': data.isOpen
    });

    return (
      <div>
        <div id="canvas" className={classSet}>
          {this.getScreenOverlays(showLoadingScreen, showErrorScreen)}
          <Sidebar />
          <RouteHandler />
        </div>
        <Modals
          showErrorModal={this.state.showErrorModal}
          modalErrorMsg={this.state.modalErrorMsg} />
        <ServerErrorModal />
      </div>
    );
  }
});

module.exports = Index;
