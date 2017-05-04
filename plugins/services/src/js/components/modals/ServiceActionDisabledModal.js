import React, { PropTypes } from "react";
import { injectIntl } from "react-intl";
import { Modal } from "reactjs-components";

import ClipboardTrigger from "#SRC/js/components/ClipboardTrigger";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import Pod from "../../structs/Pod";
import Service from "../../structs/Service";
import ServiceActionLabels from "../../constants/ServiceActionLabels";
import ServiceTree from "../../structs/ServiceTree";
import {
  SCALE,
  RESTART,
  RESUME,
  SUSPEND,
  DELETE
} from "../../constants/ServiceActionItem";

const METHODS_TO_BIND = ["handleTextCopy"];

class ServiceActionDisabledModal extends React.Component {
  constructor() {
    super(...arguments);

    this.state = { isTextCopied: false };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.open !== nextProps.open) {
      this.setState({ isTextCopied: false });
    }
  }

  handleTextCopy() {
    this.setState({ isTextCopied: true });
  }

  getUpdateCommand() {
    const { service } = this.props;
    const serviceID = service.getId();
    const packageName = service.getLabels().DCOS_PACKAGE_NAME;

    return `dcos ${packageName} --name=${serviceID} update --options=<my-options>.json`;
  }

  getRestartCommand() {
    const { service } = this.props;
    const serviceID = service.getId();

    return `dcos marathon app restart ${serviceID}`;
  }

  getDeleteCommand() {
    const { service } = this.props;
    const serviceID = service.getId();
    const packageName = service.getLabels().DCOS_PACKAGE_NAME;

    return `dcos package uninstall ${packageName} --app-id=${serviceID}`;
  }

  getRestartMessage() {
    const { intl } = this.props;
    const command = this.getRestartCommand();

    return (
      <div>
        <p>
          {intl.formatMessage({ id: "SERVICE_ACTIONS.SDK_SERVICE_RESTART" })}
          {" "}
          <a
            href={MetadataStore.buildDocsURI(
              "/cli/command-reference/dcos-marathon/dcos-marathon-app-restart/"
            )}
            target="_blank"
          >
            {intl.formatMessage({ id: "DOCS.MORE_INFORMATION" })}
          </a>
        </p>
        {this.getClipboardTrigger(command)}
      </div>
    );
  }

  getSuspendMessage() {
    const { intl } = this.props;
    const command = this.getUpdateCommand();

    return (
      <div>
        <p>
          {intl.formatMessage({ id: "SERVICE_ACTIONS.SDK_SERVICE_SUSPEND" })}
          {" "}
          <a
            href={MetadataStore.buildDocsURI(
              "/deploying-services/config-universe-service/"
            )}
            target="_blank"
          >
            {intl.formatMessage({ id: "DOCS.MORE_INFORMATION" })}
          </a>
        </p>
        {this.getClipboardTrigger(command)}
      </div>
    );
  }

  getResumeMessage() {
    const { intl } = this.props;
    const command = this.getUpdateCommand();

    return (
      <div>
        <p>
          {intl.formatMessage({ id: "SERVICE_ACTIONS.SDK_SERVICE_RESUME" })}
          {" "}
          <a
            href={MetadataStore.buildDocsURI(
              "/deploying-services/config-universe-service/"
            )}
            target="_blank"
          >
            {intl.formatMessage({ id: "DOCS.MORE_INFORMATION" })}
          </a>
        </p>
        {this.getClipboardTrigger(command)}
      </div>
    );
  }

  getScaleMessage() {
    const { intl } = this.props;
    const command = this.getUpdateCommand();

    return (
      <div>
        <p>
          {intl.formatMessage({ id: "SERVICE_ACTIONS.SDK_SERVICE_SCALE" })}
        </p>
        <p>
          <span className="emphasis">Note:</span>
          {" "}
          {intl.formatMessage({ id: "SERVICE_ACTIONS.SDK_SERVICE_SCALE_NOTE" })}
          {" "}
          <a
            href={MetadataStore.buildDocsURI(
              "/usage/managing-services/config-universe-service"
            )}
            target="_blank"
          >
            {intl.formatMessage({ id: "DOCS.MORE_INFORMATION" })}
          </a>
          {" "}
        </p>
        {this.getClipboardTrigger(command)}
      </div>
    );
  }

  getDeleteMessage() {
    const { intl, service } = this.props;
    const serviceID = service ? service.getId() : "";
    const command = this.getDeleteCommand();

    return (
      <div>
        <p>
          {intl.formatMessage({
            id: "SERVICE_ACTIONS.SDK_SERVICE_DELETE_PART_1"
          })}
          {" "}
          <span className="emphasis">{serviceID}</span>
          {" "}
          {intl.formatMessage({
            id: "SERVICE_ACTIONS.SDK_SERVICE_DELETE_PART_2"
          })}

          {" "}
          <a
            href={MetadataStore.buildDocsURI("/deploying-services/uninstall/")}
            target="_blank"
          >
            {intl.formatMessage({ id: "DOCS.DOCUMENTATION" })}
          </a> for complete instructions.{" "}
        </p>
        {this.getClipboardTrigger(command)}
        <p>
          {intl.formatMessage({
            id: "SERVICE_ACTIONS.SDK_SERVICE_DELETE_PART_3"
          })}
          {" "}
          <a
            href={MetadataStore.buildDocsURI(
              "/usage/managing-services/uninstall/#framework-cleaner"
            )}
            target="_blank"
          >
            {intl.formatMessage({
              id: "SERVICE_ACTIONS.SDK_SERVICE_DELETE_PART_4"
            })}
          </a>
          .
        </p>
      </div>
    );
  }

  getMessage() {
    const { actionID } = this.props;

    switch (actionID) {
      case RESTART:
        return this.getRestartMessage();
      case SUSPEND:
        return this.getSuspendMessage();
      case RESUME:
        return this.getResumeMessage();
      case SCALE:
        return this.getScaleMessage();
      case DELETE:
        return this.getDeleteMessage();
      default:
        return <noscript />;
    }
  }

  getClipboardTrigger(command) {
    const { intl } = this.props;
    const { isTextCopied } = this.state;
    const copyID = isTextCopied ? "CLIPBOARD.COPIED" : "CLIPBOARD.COPY";

    return [
      <pre key="command">{command}</pre>,
      <p key="copy-link">
        <ClipboardTrigger
          className="clickable"
          copyText={command}
          onTextCopy={this.handleTextCopy}
        >
          <a>{intl.formatMessage({ id: copyID })}</a>
        </ClipboardTrigger>
      </p>
    ];
  }

  getHeading() {
    const { actionID, intl, service } = this.props;

    let itemText = "Service";

    if (service instanceof Pod) {
      itemText = "Pod";
    }

    if (service instanceof ServiceTree) {
      itemText = "Group";
    }

    const action = actionID
      ? intl.formatMessage({ id: ServiceActionLabels[actionID] })
      : actionID;

    return (
      <ModalHeading>
        {`${action} ${itemText}`}
      </ModalHeading>
    );
  }

  getFooter() {
    const { intl, onClose } = this.props;

    return (
      <div className="button-collection text-align-center flush-bottom">
        <button className="button" onClick={onClose}>
          {intl.formatMessage({ id: "BUTTON.CLOSE" })}
        </button>
      </div>
    );
  }

  render() {
    const { onClose, open } = this.props;

    return (
      <Modal
        open={open}
        onClose={onClose}
        header={this.getHeading()}
        modalClass="modal confirm-modal"
        showCloseButton={false}
        showHeader={true}
        showFooter={true}
        footer={this.getFooter()}
      >
        {this.getMessage()}
      </Modal>
    );
  }
}

ServiceActionDisabledModal.propTypes = {
  actionID: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  service: PropTypes.oneOfType([
    PropTypes.instanceOf(ServiceTree),
    PropTypes.instanceOf(Service)
  ])
};

module.exports = injectIntl(ServiceActionDisabledModal);
