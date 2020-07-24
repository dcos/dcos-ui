import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";

import classNames from "classnames";
import { Modal } from "reactjs-components";
import * as React from "react";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import ClickToSelect from "../ClickToSelect";
import MetadataStore from "../../stores/MetadataStore";
import ModalHeading from "../modals/ModalHeading";

const osTypes = {
  Windows: "windows",
  "OS X": "darwin",
  Linux: "linux",
};

class CliInstallModal extends React.Component<
  {
    title: string;
    showFooter: boolean;
    footer?: React.ReactNode;
    onClose: () => void;
    open?: boolean;
  },
  { selectedOS: string }
> {
  constructor(props) {
    super(props);
    const platform = navigator.userAgent || "linux";
    this.state = {
      selectedOS: platform.match("Win")
        ? "Windows"
        : platform.match("Mac")
        ? "OS X"
        : "Linux",
    };
  }

  onClose = () => {
    this.props.onClose();
  };

  getCliInstructions() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol.replace(/[^\w]/g, "");
    let port = "";
    if (window.location.port) {
      port = ":" + window.location.port;
    }
    const clusterUrl = `${protocol}://${hostname}${port}`;
    const { selectedOS } = this.state;

    // Starting from DC/OS >=2.0, users can stick to the "latest" CLI.
    // However on DC/OS 1.x we must use the correct CLI for the given version of DC/OS.
    const dcosVersion = MetadataStore.parsedVersion;
    const cliVersion =
      dcosVersion.substring(0, 2) === "1." ? `dcos-${dcosVersion}` : "latest";
    const downloadUrl = `https://downloads.dcos.io/binaries/cli/${osTypes[selectedOS]}/x86-64/${cliVersion}/dcos`;
    if (selectedOS === "Windows") {
      return this.getWindowsInstallInstruction(clusterUrl, downloadUrl);
    }

    const instructions = [
      `curl ${downloadUrl} -o dcos`,
      `chmod +x ./dcos`,
      `sudo mv dcos /usr/local/bin`,
      `dcos cluster setup ${clusterUrl}`,
      `dcos`,
    ].join(" && \n");

    return (
      <div>
        <Trans render="p" className="short-bottom">
          Copy and paste the code snippet into the terminal:
        </Trans>
        <div className="flush-top snippet-wrapper">
          <ClickToSelect>
            <pre className="prettyprint flush-bottom">{instructions}</pre>
          </ClickToSelect>
        </div>
      </div>
    );
  }

  getWindowsInstallInstruction(clusterUrl: string, downloadUrl: string) {
    const steps = [
      `cd path/to/download/directory`,
      `dcos cluster setup ${clusterUrl}`,
      `dcos`,
    ].map((instruction, index) => {
      const helpText =
        index === 0 ? i18nMark("In Command Prompt, enter") : i18nMark("Enter");

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
    const onClick = () =>
      this.setState({ selectedOS: name as keyof typeof osTypes });
    return Object.keys(osTypes).map((name) => (
      <button
        key={name}
        className={classNames("button button-outline", {
          active: name === this.state.selectedOS,
        })}
        onClick={onClick}
      >
        {name}
      </button>
    ));
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

export default CliInstallModal;
