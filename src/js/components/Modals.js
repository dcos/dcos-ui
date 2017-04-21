import React from "react";
import { Hooks } from "PluginSDK";

import CliInstallModal from "./modals/CliInstallModal";
import Config from "../config/Config";
import ErrorModal from "./modals/ErrorModal";
import EventTypes from "../constants/EventTypes";
import InternalStorageMixin from "../mixins/InternalStorageMixin";
import SidebarStore from "../stores/SidebarStore";
import VersionsModal from "./modals/VersionsModal";

var Modals = React.createClass({
  displayName: "Modals",

  mixins: [InternalStorageMixin],

  propTypes: {
    showErrorModal: React.PropTypes.bool,
    modalErrorMsg: React.PropTypes.node
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
        <p className="text-align-center flush-bottom">
          We are unable to retrieve the version
          {" "}
          {Config.productName}
          {" "}
          versions. Please try again.
        </p>
      )
    });
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
          <div className="row text-align-center">
            <button
              className="button button-primary button-medium"
              onClick={onClose}
            >
              Close
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
    var showCliModal = this.state.showingCliModal;

    return (
      <div>
        {this.getCliInstallModal(showCliModal)}
        {this.getVersionsModal(this.state.showingVersionsModal)}
        {this.getErrorModal(this.state.showErrorModal)}
      </div>
    );
  }
});

module.exports = Modals;
