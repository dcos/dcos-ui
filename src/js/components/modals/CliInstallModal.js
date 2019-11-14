import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";

import browserInfo from "browser-info";
import classNames from "classnames";
import { Modal } from "reactjs-components";
import PropTypes from "prop-types";
import React from "react";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import ClickToSelect from "../ClickToSelect";
import MetadataStore from "../../stores/MetadataStore";
import ModalHeading from "../modals/ModalHeading";

const METHODS_TO_BIND = ["onClose"];
const osTypes = {
  Windows: "windows",
  "OS X": "darwin",
  Linux: "linux"
};

class CliInstallModal extends React.Component {
  constructor(...args) {
    super(...args);

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
    const hostname = global.location.hostname;
    const protocol = global.location.protocol.replace(/[^\w]/g, "");
    let port = "";
    if (global.location.port) {
      port = ":" + global.location.port;
    }
    const clusterUrl = `${protocol}://${hostname}${port}`;
    const { selectedOS } = this.state;

    // Starting from DC/OS >=2.0, users can stick to the "latest" CLI.
    // However on DC/OS 1.x we must use the correct CLI for the given version of DC/OS.
    const dcosVersion = MetadataStore.parsedVersion;
    const cliVersion =
      dcosVersion.substring(0, 2) === "1." ? `dcos-${dcosVersion}` : "latest";

    const downloadUrl = `https://downloads.dcos.io/cli/releases/binaries/dcos/${osTypes[selectedOS]}/x86-64/${cliVersion}/dcos`;
    if (selectedOS === "Windows") {
      return this.getWindowsInstallInstruction(clusterUrl, downloadUrl);
    }

    const instructions = [
      `curl ${downloadUrl} -o dcos`,
      `chmod +x ./dcos`,
      `sudo mv dcos /usr/local/bin`,
      `dcos cluster setup ${clusterUrl}`,
      `dcos`
    ].filter(instruction => instruction !== undefined);

    return (
      <div>
        <Trans render="p" className="short-bottom">
          Copy and paste the code snippet into the terminal:
        </Trans>
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
      `cd path/to/download/directory`,
      `dcos cluster setup ${clusterUrl}`,
      `dcos`
    ]
      .filter(instruction => instruction !== undefined)
      .map((instruction, index) => {
        const helpText =
          index === 0
            ? i18nMark("In Command Prompt, enter")
            : i18nMark("Enter");

        return (
          <li key={index}>
            <Trans render="p" className="short-bottom" id={helpText} />
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
        <Trans render="li">
          Download and install:{" "}
          <a href={downloadUrl + ".exe"}>
            <Icon
              shape={SystemIcons.Download}
              size={iconSizeXs}
              color="currentColor"
            />
            Download dcos.exe
          </a>
          .
        </Trans>
        {steps}
      </ol>
    );
  }

  getOSButtons() {
    const { selectedOS } = this.state;

    return Object.keys(osTypes).map((name, index) => {
      const classSet = classNames({
        "button button-outline": true,
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

  render() {
    const { footer, open, showFooter, title } = this.props;
    const header = (
      <ModalHeading>
        <Trans id={title} render="span" />
      </ModalHeading>
    );

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
        <div className="install-cli-modal-content">
          <Trans render="p">
            Choose your operating system and follow the instructions. For any
            issues or questions, please refer to our{" "}
            <a
              href={MetadataStore.buildDocsURI("/cli/install")}
              target="_blank"
            >
              documentation
            </a>
            .
          </Trans>
          <div className="button-group">{this.getOSButtons()}</div>
          {this.getCliInstructions()}
        </div>
      </Modal>
    );
  }
}

CliInstallModal.propTypes = {
  title: PropTypes.string.isRequired,
  subHeaderContent: PropTypes.string,
  showFooter: PropTypes.bool.isRequired,
  footer: PropTypes.node,
  onClose: PropTypes.func.isRequired
};

module.exports = CliInstallModal;
