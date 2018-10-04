import { Trans } from "@lingui/macro";
import PropTypes from "prop-types";
import React from "react";
import { Hooks } from "PluginSDK";
import { MountService } from "foundation-ui";

import CliInstallModal from "./modals/CliInstallModal";
import Config from "../config/Config";
import ErrorModal from "./modals/ErrorModal";
import EventTypes from "../constants/EventTypes";
import SidebarStore from "../stores/SidebarStore";
import VersionsModal from "./modals/VersionsModal";

var Modals = React.createClass({
  displayName: "Modals",

  propTypes: {
    showErrorModal: PropTypes.bool,
    modalErrorMsg: PropTypes.node
  },

  getDefaultProps() {
    return {
      showErrorModal: false,
      modalErrorMsg: ""
    };
  },

  getInitialState() {
    var props = this.props;

    return {
      modalErrorMsg: props.modalErrorMsg,
      showingCliModal: false,
      showingClusterLinkingModal: false,
      showingVersionsModal: false,
      showErrorModal: props.showErrorModal
    };
  },

  componentWillReceiveProps(props) {
    this.setState({
      modalErrorMsg: props.modalErrorMsg,
      showErrorModal: props.showErrorModal
    });
  },

  componentDidMount() {
    SidebarStore.addChangeListener(
      EventTypes.SHOW_CLI_INSTRUCTIONS,
      this.handleShowCli
    );

    SidebarStore.addChangeListener(
      EventTypes.SHOW_CLUSTER_LINKING,
      this.handleShowClusterLinking
    );

    SidebarStore.addChangeListener(
      EventTypes.SHOW_VERSIONS_SUCCESS,
      this.handleShowVersionsSuccess
    );

    SidebarStore.addChangeListener(
      EventTypes.SHOW_VERSIONS_ERROR,
      this.handleShowVersionsError
    );
  },

  componentWillUnmount() {
    SidebarStore.removeChangeListener(
      EventTypes.SHOW_CLI_INSTRUCTIONS,
      this.handleShowCli
    );

    SidebarStore.removeChangeListener(
      EventTypes.SHOW_CLUSTER_LINKING,
      this.handleShowClusterLinking
    );

    SidebarStore.removeChangeListener(
      EventTypes.SHOW_VERSIONS_SUCCESS,
      this.handleShowVersionsSuccess
    );

    SidebarStore.removeChangeListener(
      EventTypes.SHOW_VERSIONS_ERROR,
      this.handleShowVersionsError
    );
  },

  handleShowVersionsSuccess() {
    this.setState({ showingVersionsModal: true });
  },

  handleShowVersionsError() {
    this.setState({
      showErrorModal: true,
      modalErrorMsg: (
        <Trans render="p" className="text-align-center flush-bottom">
          We are unable to retrieve the version {Config.productName} versions.
          Please try again.
        </Trans>
      )
    });
  },

  handleShowClusterLinking() {
    this.setState({ showingClusterLinkingModal: true });
  },

  handleShowCli() {
    this.setState({ showingCliModal: true });
  },

  getCliModalOptions() {
    var onClose = function() {
      this.setState({ showingCliModal: false });
    }.bind(this);

    return {
      onClose,
      title: "Install DC/OS CLI",
      showFooter: true,
      footer: (
        <div>
          <div className="text-align-center">
            <button className="button button-primary-link" onClick={onClose}>
              <Trans render="span">Close</Trans>
            </button>
          </div>
        </div>
      )
    };
  },

  getCliInstallModal(showModal) {
    var options = {
      onClose() {},
      title: "",
      showFooter: true,
      footer: <div />
    };

    if (this.state.showingCliModal) {
      Hooks.doAction("logFakePageView", {
        title: "CLI instructions",
        path: "/v/cli-instructions",
        referrer: "https://mesosphere.com/"
      });

      options = this.getCliModalOptions();
    }

    return <CliInstallModal open={showModal} {...options} />;
  },

  getClusterLinkingModal(showModal) {
    var onClose = function() {
      this.setState({ showingClusterLinkingModal: false });
    }.bind(this);

    return (
      <MountService.Mount
        type={"Modals:SwitchingModal"}
        open={showModal}
        onClose={onClose}
      />
    );
  },

  getVersionsModal(showModal) {
    var onClose = function() {
      this.setState({ showingVersionsModal: false });
    }.bind(this);

    var versions = SidebarStore.get("versions");

    return (
      <VersionsModal
        onClose={onClose}
        versionDump={versions}
        open={showModal}
      />
    );
  },

  getErrorModal(show) {
    var onClose = function() {
      this.setState({ showErrorModal: false });
    }.bind(this);

    var errorMsg = null;
    if (this.state.modalErrorMsg) {
      errorMsg = this.state.modalErrorMsg;
    }

    return <ErrorModal onClose={onClose} errorMsg={errorMsg} open={show} />;
  },

  render() {
    var {
      showingCliModal,
      showingClusterLinkingModal,
      showingVersionsModal,
      showErrorModal
    } = this.state;

    return (
      <div>
        {this.getClusterLinkingModal(showingClusterLinkingModal)}
        {this.getCliInstallModal(showingCliModal)}
        {this.getVersionsModal(showingVersionsModal)}
        {this.getErrorModal(showErrorModal)}
      </div>
    );
  }
});

module.exports = Modals;
