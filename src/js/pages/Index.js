import classNames from "classnames";
import isEqual from "lodash.isequal";
import React from "react";
import { CSSTransitionGroup } from "react-transition-group";

import { StoreMixin } from "mesosphere-shared-reactjs";

import Config from "../config/Config";
import ConfigStore from "../stores/ConfigStore";
import EventTypes from "../constants/EventTypes";
import MetadataStore from "../stores/MetadataStore";
import MesosStateStore from "../stores/MesosStateStore";
import Modals from "../components/Modals";
import RequestErrorMsg from "../components/RequestErrorMsg";
import ServerErrorModal from "../components/ServerErrorModal";
import HeaderBar from "../components/HeaderBar";
import Sidebar from "../components/Sidebar";
import SidebarActions from "../events/SidebarActions";
import SidebarStore from "../stores/SidebarStore";
import { hasViewportChanged, getCurrentViewport } from "../utils/ViewportUtil";
import * as viewport from "../constants/Viewports";

function getSidebarState() {
  return {
    isVisible: SidebarStore.get("isVisible")
  };
}

var Index = React.createClass({
  displayName: "Index",

  mixins: [StoreMixin],

  getInitialState() {
    return {
      mesosSummaryErrorCount: 0,
      showErrorModal: false,
      modalErrorMsg: "",
      configErrorCount: 0,
      previousWindowWidth: global.innerWidth
    };
  },

  componentWillMount() {
    MetadataStore.init();
    SidebarStore.init();
    MesosStateStore.addChangeListener(
      EventTypes.MESOS_STATE_CHANGE,
      this.onMesosStoreChange
    );

    // We want to always request the summary endpoint. This will ensure that
    // our charts always have data to render.
    this.store_listeners = [
      {
        name: "summary",
        events: ["success", "error"],
        suppressUpdate: true
      }
    ];
  },

  componentDidMount() {
    SidebarStore.addChangeListener(
      EventTypes.SIDEBAR_CHANGE,
      this.onSideBarChange
    );
    global.addEventListener("resize", this.handleWindowResize.bind(this));

    ConfigStore.addChangeListener(EventTypes.CONFIG_ERROR, this.onConfigError);
  },

  shouldComponentUpdate(nextProps, nextState) {
    return !(isEqual(this.props, nextProps) && isEqual(this.state, nextState));
  },

  componentWillUnmount() {
    global.remvoveEventListener("resize", this.handleWindowResize);

    SidebarStore.removeChangeListener(
      EventTypes.SIDEBAR_CHANGE,
      this.onSideBarChange
    );
    ConfigStore.removeChangeListener(
      EventTypes.CONFIG_ERROR,
      this.onConfigError
    );
    MesosStateStore.removeChangeListener(
      EventTypes.MESOS_STATE_CHANGE,
      this.onMesosStoreChange
    );
  },

  onSideBarChange() {
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

  onMesosStoreChange() {},

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

  handleWindowResize() {
    const currentWindowWidth = global.innerWidth;

    if (
      !hasViewportChanged(this.state.previousWindowWidth, currentWindowWidth)
    ) {
      this.setState({
        previousWindowWidth: currentWindowWidth
      });

      return;
    }

    if (getCurrentViewport() === viewport.DESKTOP) {
      SidebarActions.open();
    }

    if (getCurrentViewport() === viewport.MOBILE) {
      SidebarActions.close();
    }

    this.setState({
      previousWindowWidth: currentWindowWidth
    });
  },

  renderOverlay() {
    const { isVisible } = getSidebarState();
    let overlay = null;

    if (!isVisible) {
      return null;
    }

    overlay = (
      <div className="sidebar-backdrop" onClick={SidebarActions.close} />
    );

    if (window.innerWidth <= viewport.MOBILE_THRESHOLD) {
      return (
        <CSSTransitionGroup
          transitionName="sidebar-backdrop"
          transitionEnterTimeout={250}
          transitionLeaveTimeout={250}
        >
          {overlay}
        </CSSTransitionGroup>
      );
    }
  },

  render() {
    const { isVisible } = getSidebarState();

    const showErrorScreen =
      this.state.configErrorCount >= Config.delayAfterErrorCount;

    var classSet = classNames("application-wrapper", {
      "sidebar-visible": isVisible,
      "sidebar-docked": isVisible
    });

    return (
      <div className={classSet}>
        <HeaderBar />
        <div className="application-wrapper-inner">
          {this.getScreenOverlays(showErrorScreen)}
          <Sidebar location={this.props.location} />
          {this.renderOverlay()}
          {this.props.children}
          <Modals
            showErrorModal={this.state.showErrorModal}
            modalErrorMsg={this.state.modalErrorMsg}
          />
          <ServerErrorModal />
        </div>
      </div>
    );
  }
});

module.exports = Index;
