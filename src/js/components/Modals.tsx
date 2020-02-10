import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import PropTypes from "prop-types";
import * as React from "react";
import { Hooks } from "PluginSDK";
import { MountService } from "foundation-ui";

import CliInstallModal from "./modals/CliInstallModal";
import Config from "../config/Config";
import ErrorModal from "./modals/ErrorModal";
import * as EventTypes from "../constants/EventTypes";
import SidebarStore from "../stores/SidebarStore";
import LanguageModalStore from "../stores/LanguageModalStore";
import VersionsModal from "./modals/VersionsModal";
import LanguagePreferenceFormModal from "./modals/LanguagePreferenceFormModal";

const getLanguageModalState = () => LanguageModalStore.get("isVisible");

export default class Modals extends React.Component {
  static propTypes = {
    showErrorModal: PropTypes.bool,
    modalErrorMsg: PropTypes.node
  };

  static defaultProps = {
    showErrorModal: false,
    modalErrorMsg: ""
  };

  state = {
    modalErrorMsg: this.props.modalErrorMsg,
    showingCliModal: false,
    showingClusterLinkingModal: false,
    showingVersionsModal: false,
    showErrorModal: this.props.showErrorModal,
    showLanguagePrefModal: false
  };

  UNSAFE_componentWillReceiveProps(props) {
    this.setState({
      modalErrorMsg: props.modalErrorMsg,
      showErrorModal: props.showErrorModal
    });
  }

  componentDidMount() {
    SidebarStore.addChangeListener(
      EventTypes.SHOW_CLI_INSTRUCTIONS,
      this.handleShowCli
    );

    SidebarStore.addChangeListener(
      EventTypes.SHOW_CLUSTER_LINKING,
      this.handleShowClusterLinking
    );

    LanguageModalStore.addChangeListener(
      EventTypes.LANGUAGE_MODAL_CHANGE,
      this.handleLanguageModalToggle
    );
  }

  componentWillUnmount() {
    SidebarStore.removeChangeListener(
      EventTypes.SHOW_CLI_INSTRUCTIONS,
      this.handleShowCli
    );

    SidebarStore.removeChangeListener(
      EventTypes.SHOW_CLUSTER_LINKING,
      this.handleShowClusterLinking
    );

    LanguageModalStore.removeChangeListener(
      EventTypes.LANGUAGE_MODAL_CHANGE,
      this.handleLanguageModalToggle
    );
  }

  handleShowVersionsSuccess = () => {
    this.setState({ showingVersionsModal: true });
  };

  handleShowVersionsError = () => {
    this.setState({
      showErrorModal: true,
      modalErrorMsg: (
        <Trans render="p" className="text-align-center flush-bottom">
          We are unable to retrieve the version {Config.productName} versions.
          Please try again.
        </Trans>
      )
    });
  };

  handleShowClusterLinking = () => {
    this.setState({ showingClusterLinkingModal: true });
  };

  handleShowCli = () => {
    this.setState({ showingCliModal: true });
  };

  handleLanguageModalToggle = () => {
    this.setState({ showLanguagePrefModal: getLanguageModalState() });
  };

  getCliModalOptions = () => {
    const onClose = () => {
      this.setState({ showingCliModal: false });
    };

    return {
      onClose,
      title: i18nMark("Install DC/OS CLI"),
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
  };

  getCliInstallModal = showModal => {
    let options = {
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
  };

  getClusterLinkingModal = showModal => {
    const onClose = () => {
      this.setState({ showingClusterLinkingModal: false });
    };

    return (
      <MountService.Mount
        type={"Modals:SwitchingModal"}
        open={showModal}
        onClose={onClose}
      />
    );
  };

  getVersionsModal = showModal => {
    const onClose = () => {
      this.setState({ showingVersionsModal: false });
    };

    const versions = SidebarStore.get("versions");

    return (
      <VersionsModal
        onClose={onClose}
        versionDump={versions}
        open={showModal}
      />
    );
  };

  getErrorModal = show => {
    const onClose = () => {
      this.setState({ showErrorModal: false });
    };

    let errorMsg = null;
    if (this.state.modalErrorMsg) {
      errorMsg = this.state.modalErrorMsg;
    }

    return <ErrorModal onClose={onClose} errorMsg={errorMsg} open={show} />;
  };

  getLanguagePrefModal = showModal => {
    return <LanguagePreferenceFormModal isOpen={showModal} />;
  };

  render() {
    const {
      showingCliModal,
      showingClusterLinkingModal,
      showingVersionsModal,
      showErrorModal,
      showLanguagePrefModal
    } = this.state;

    return (
      <div>
        {this.getClusterLinkingModal(showingClusterLinkingModal)}
        {this.getCliInstallModal(showingCliModal)}
        {this.getVersionsModal(showingVersionsModal)}
        {this.getErrorModal(showErrorModal)}
        {this.getLanguagePrefModal(showLanguagePrefModal)}
      </div>
    );
  }
}
