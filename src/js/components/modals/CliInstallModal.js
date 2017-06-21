import browserInfo from "browser-info";
import classNames from "classnames";
import { Hooks } from "PluginSDK";
import { Modal } from "reactjs-components";
import React from "react";

import ClickToSelect from "../ClickToSelect";
import Icon from "../Icon";
import MetadataStore from "../../stores/MetadataStore";
import ModalHeading from "../modals/ModalHeading";

const METHODS_TO_BIND = ["onClose"];
const osTypes = {
  Windows: "windows",
  "OS X": "darwin",
  Linux: "linux"
};

class CliInstallModal extends React.Component {
  constructor() {
    super(...arguments);

    let selectedOS = browserInfo().os;
    if (!Object.keys(osTypes).includes(selectedOS)) {
      selectedOS = "Linux";
    }

    this.state = { selectedOS };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleSelectedOSChange(selectedOS) {
    this.setState({ selectedOS });
  }

  onClose() {
    this.props.onClose();
  }

  getSubHeader() {
    if (!this.props.subHeaderContent) {
      return false;
    }

    return (
      <p className="text-align-center flush-bottom">
        {this.props.subHeaderContent}
      </p>
    );
  }

  getCliInstructions() {
    // TODO (DCOS-8495): Binary cli links have hardcoded version, these should
    // be updated to a /latest endpoint, when that becomes available.
    // Binary cli links are also all pointing to the open version, which is
    // intentional.
    const hostname = global.location.hostname;
    const protocol = global.location.protocol.replace(/[^\w]/g, "");
    let port = "";
    if (global.location.port) {
      port = ":" + global.location.port;
    }
    const clusterUrl = `${protocol}://${hostname}${port}`;
    const { selectedOS } = this.state;
    let version = MetadataStore.parsedVersion;
    // Prepend 'dcos-' to any version other than latest
    if (version !== "latest") {
      version = `dcos-${version}`;
    }
    const downloadUrl = `https://downloads.dcos.io/binaries/cli/${osTypes[selectedOS]}/x86-64/${version}/dcos`;
    if (selectedOS === "Windows") {
      return this.getWindowsInstallInstruction(clusterUrl, downloadUrl);
    }

    const instructions = [
      `curl ${downloadUrl} -o dcos`,
      "sudo mv dcos /usr/local/bin",
      "sudo chmod +x /usr/local/bin/dcos",
      `dcos config set core.dcos_url ${clusterUrl}`,
      Hooks.applyFilter("dcosInstallCommandExtraSteps", undefined),
      "dcos"
    ].filter(instruction => instruction !== undefined);

    return (
      <div>
        <p className="short-bottom">
          Copy and paste the code snippet into the terminal:
        </p>
        <div className="flush-top snippet-wrapper">
          <ClickToSelect>
            <pre className="prettyprint flush-bottom">
              {instructions.join(" && \n")}
            </pre>
          </ClickToSelect>
        </div>
      </div>
    );
  }

  getWindowsInstallInstruction(clusterUrl, downloadUrl) {
    const steps = [
      "cd path/to/download/directory",
      <span>
        dcos config set core.dcos_url <a href={clusterUrl}>{clusterUrl}</a>
      </span>,
      Hooks.applyFilter("dcosInstallCommandExtraSteps", undefined),
      "dcos"
    ]
      .filter(instruction => instruction !== undefined)
      .map((instruction, index) => {
        let helpText = "Enter";

        if (index === 0) {
          helpText = "In Terminal, enter";
        }

        return (
          <li key={index}>
            <p className="short-bottom">{helpText}</p>
            <div className="flush-top snippet-wrapper">
              <ClickToSelect>
                <pre className="prettyprint flush-bottom prettyprinted">
                  {instruction}
                </pre>
              </ClickToSelect>
            </div>
          </li>
        );
      });

    return (
      <ol>
        <li>
          Download and install: <a href={downloadUrl + ".exe"}>
            <Icon id="download" size="mini" /> Download dcos.exe
          </a>.
        </li>
        {steps}
      </ol>
    );
  }

  getOSButtons() {
    const { selectedOS } = this.state;

    return Object.keys(osTypes).map((name, index) => {
      const classSet = classNames({
        "button button-stroke": true,
        active: name === selectedOS
      });

      return (
        <button
          className={classSet}
          key={index}
          onClick={this.handleSelectedOSChange.bind(this, name)}
        >
          {name}
        </button>
      );
    });
  }

  getContent() {
    return (
      <div className="install-cli-modal-content">
        <h4 className="flush-top">Installation</h4>
        <p>
          {
            "Choose your operating system and follow the instructions. For any issues or questions, please refer to our "
          }
          <a
            href={MetadataStore.buildDocsURI("/usage/cli/install")}
            target="_blank"
          >
            documentation
          </a>.
        </p>
        <div className="button-group">
          {this.getOSButtons()}
        </div>
        {this.getCliInstructions()}
      </div>
    );
  }

  render() {
    const { footer, open, showFooter, title } = this.props;
    const header = <ModalHeading align="left" level={5}>{title}</ModalHeading>;

    return (
      <Modal
        header={header}
        footer={footer}
        modalClass="modal"
        onClose={this.onClose}
        open={open}
        showHeader={true}
        showFooter={showFooter}
        subHeader={this.getSubHeader()}
      >
        {this.getContent()}
      </Modal>
    );
  }
}

CliInstallModal.propTypes = {
  title: React.PropTypes.string.isRequired,
  subHeaderContent: React.PropTypes.string,
  showFooter: React.PropTypes.bool.isRequired,
  footer: React.PropTypes.node,
  onClose: React.PropTypes.func.isRequired
};

module.exports = CliInstallModal;
