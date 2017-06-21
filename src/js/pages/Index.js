import classNames from "classnames";
import deepEqual from "deep-equal";
import React from "react";

import { StoreMixin } from "mesosphere-shared-reactjs";

import Config from "../config/Config";
import ConfigStore from "../stores/ConfigStore";
import EventTypes from "../constants/EventTypes";
import InternalStorageMixin from "../mixins/InternalStorageMixin";
import MetadataStore from "../stores/MetadataStore";
import Modals from "../components/Modals";
import RequestErrorMsg from "../components/RequestErrorMsg";
import ServerErrorModal from "../components/ServerErrorModal";
import Sidebar from "../components/Sidebar";
import SidebarActions from "../events/SidebarActions";
import SidebarStore from "../stores/SidebarStore";

function getSidebarState() {
  return {
    isDocked: SidebarStore.get("isDocked"),
    isVisible: SidebarStore.get("isVisible")
  };
}

var Index = React.createClass({
  displayName: "Index",

  mixins: [InternalStorageMixin, StoreMixin],

  getInitialState() {
    return {
      mesosSummaryErrorCount: 0,
      showErrorModal: false,
      modalErrorMsg: "",
      configErrorCount: 0
    };
  },

  componentWillMount() {
    MetadataStore.init();
    SidebarStore.init();

    // We want to always request the summary endpoint. This will ensure that
    // our charts always have data to render.
    this.store_listeners = [
      {
        name: "summary",
        events: ["success", "error"],
        suppressUpdate: true
      }
    ];

    const state = getSidebarState();
    this.internalStorage_set(state);
  },

  componentDidMount() {
    SidebarStore.addChangeListener(
      EventTypes.SIDEBAR_CHANGE,
      this.onSideBarChange
    );
    global.addEventListener("resize", SidebarActions.close);

    ConfigStore.addChangeListener(EventTypes.CONFIG_ERROR, this.onConfigError);
  },

  shouldComponentUpdate(nextProps, nextState) {
    return !(deepEqual(this.props, nextProps) &&
      deepEqual(this.state, nextState));
  },

  componentWillUnmount() {
    SidebarStore.removeChangeListener(
      EventTypes.SIDEBAR_CHANGE,
      this.onSideBarChange
    );
    global.removeEventListener("resize", SidebarActions.close);

    ConfigStore.removeChangeListener(
      EventTypes.CONFIG_ERROR,
      this.onConfigError
    );
  },

  onSideBarChange() {
    this.internalStorage_update(getSidebarState());
    this.forceUpdate();
  },

  onConfigError() {
    this.setState({ configErrorCount: this.state.configErrorCount + 1 });

    if (this.state.configErrorCount < Config.delayAfterErrorCount) {
      ConfigStore.fetchConfig();
    }
  },

  onSummaryStoreSuccess() {
    // Reset count as we've just received a successful response
    if (this.state.mesosSummaryErrorCount > 0) {
      this.setState({ mesosSummaryErrorCount: 0 });
    }
  },

  onSummaryStoreError() {
    this.setState({
      mesosSummaryErrorCount: this.state.mesosSummaryErrorCount + 1
    });
  },

  getErrorScreen(showErrorScreen) {
    if (!showErrorScreen) {
      return null;
    }

    return <RequestErrorMsg />;
  },

  getScreenOverlays(showErrorScreen) {
    if (!showErrorScreen) {
      return null;
    }

    return (
      <div className="pod flush-right flush-left vertical-center">
        {this.getErrorScreen(showErrorScreen)}
      </div>
    );
  },

  render() {
    var { isDocked, isVisible } = this.internalStorage_get();
    const showErrorScreen =
      this.state.configErrorCount >= Config.delayAfterErrorCount;

    var classSet = classNames("application-wrapper", {
      "sidebar-visible": isVisible,
      "sidebar-docked": isDocked
    });

    return (
      <div className={classSet}>
        {this.getScreenOverlays(showErrorScreen)}
        <Sidebar location={this.props.location} />
        {this.props.children}
        <Modals
          showErrorModal={this.state.showErrorModal}
          modalErrorMsg={this.state.modalErrorMsg}
        />
        <ServerErrorModal />
      </div>
    );
  }
});

module.exports = Index;
