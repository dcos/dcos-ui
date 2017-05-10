import React, { PropTypes } from "react";
import { injectIntl } from "react-intl";
import { Modal } from "reactjs-components";

import ClipboardTrigger from "#SRC/js/components/ClipboardTrigger";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import { isSDKService } from "#SRC/js/utils/ServiceUtil";
import Icon from "#SRC/js/components/Icon";
import Pod from "../../structs/Pod";
import Service from "../../structs/Service";
import ServiceActionLabels from "../../constants/ServiceActionLabels";
import ServiceTree from "../../structs/ServiceTree";
import {
  DELETE,
  EDIT,
  RESTART,
  RESUME,
  SCALE,
  SUSPEND
} from "../../constants/ServiceActionItem";

const METHODS_TO_BIND = ["handleTextCopy"];

class ServiceActionDisabledModal extends React.Component {
  constructor() {
    super(...arguments);

    this.state = { copiedCommand: false };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.open !== nextProps.open) {
      this.setState({ copiedCommand: false });
    }
  }

  handleTextCopy(copiedCommand) {
    this.setState({ copiedCommand });
  }

  getUpdateCommand(service = this.props.service) {
    const serviceID = service ? service.getId() : "";
    const packageName = service.getLabels().DCOS_PACKAGE_NAME;

    // For everything SDK, not other packages
    if (isSDKService(service)) {
      return `dcos ${packageName} --name=${serviceID} update --options=${packageName}-options.json`;
    }

    return `dcos marathon app update ${serviceID} options.json`;
  }

  getRestartCommand(service = this.props.service) {
    const serviceID = service ? service.getId() : "";

    return `dcos marathon app restart ${serviceID}`;
  }

  getDeleteCommand(service = this.props.service) {
    const serviceID = service ? service.getId() : "";
    const packageName = service.getLabels().DCOS_PACKAGE_NAME;

    // For groups, not services
    if (service instanceof ServiceTree) {
      return `dcos marathon group remove ${serviceID}`;
    }

    return `dcos package uninstall ${packageName} --app-id=${serviceID}`;
  }

  getServiceRestartMessage() {
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

  getServiceSuspendMessage() {
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

  getServiceResumeMessage() {
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

  getServiceScaleMessage() {
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

  getServiceDeleteMessage() {
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
              id: "SERVICE_ACTIONS.SDK_SERVICE_CLEARNER_SCRIPT"
            })}
          </a>
          .
        </p>
      </div>
    );
  }

  getServiceEditMessage() {
    const { intl } = this.props;
    const command = this.getUpdateCommand();

    return (
      <div>
        <p>
          {intl.formatMessage({
            id: "SERVICE_ACTIONS.SDK_SERVICE_UPDATE_PART_1"
          })}
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
          {intl.formatMessage({
            id: "SERVICE_ACTIONS.SDK_SERVICE_UPDATE_PART_2"
          })}
        </p>
        {this.getClipboardTrigger(command)}
      </div>
    );
  }

  getServiceMessage() {
    const { actionID } = this.props;

    switch (actionID) {
      case RESTART:
        return this.getServiceRestartMessage();
      case SUSPEND:
        return this.getServiceSuspendMessage();
      case RESUME:
        return this.getServiceResumeMessage();
      case SCALE:
        return this.getServiceScaleMessage();
      case DELETE:
        return this.getServiceDeleteMessage();
      case EDIT:
        return this.getServiceEditMessage();
      default:
        return <noscript />;
    }
  }

  getServiceTypes(testFunction) {
    return this.props.service.flattenItems().getItems().reduce(function(
      memo,
      item
    ) {
      if (testFunction(item)) {
        memo.selectedServices.push(item);
      } else {
        memo.otherServices.push(item);
      }

      return memo;
    }, { selectedServices: [], otherServices: [] });
  }

  getServiceList(services) {
    return services.map(function(item, index) {
      const comma = index === services.length - 1 ? "" : ", ";
      const itemID = item.getId();

      return (
        <span key={itemID}>
          <span className="emphasis">{itemID}</span>{comma}
        </span>
      );
    });
  }

  getServiceListCommand(services, commandFunction) {
    return services
      .map(function(item) {
        return commandFunction(item);
      })
      .join(" &&\n");
  }

  getGroupUpdateMessage(updateDescription) {
    const { actionID, intl } = this.props;
    const { selectedServices, otherServices } = this.getServiceTypes(
      isSDKService
    );
    const sdkServicesList = this.getServiceList(selectedServices);
    const sdkCommand = this.getServiceListCommand(
      selectedServices,
      this.getUpdateCommand
    );

    let otherServicesMessage = "";
    if (otherServices.length > 0) {
      const otherServicesList = this.getServiceList(otherServices);
      const otherCommand = this.getServiceListCommand(
        otherServices,
        this.getUpdateCommand
      );

      otherServicesMessage = (
        <div>
          <p>
            {intl.formatMessage({ id: "SERVICE_ACTIONS.SDK_GROUP_UPDATE_7" })}
            {" "}
            {otherServicesList}
            : {intl.formatMessage({ id: "SERVICE_ACTIONS.SDK_GROUP_UPDATE_8" })}
            {" "}
            <code>options.json</code>
            {". "}
            <a
              href={MetadataStore.buildDocsURI(
                "/deploying-services/config-universe-service/"
              )}
              target="_blank"
            >
              {intl.formatMessage({ id: "DOCS.MORE_INFORMATION" })}
            </a>
          </p>
          {this.getClipboardTrigger('{"instances": 0}')}
          <p>
            {intl.formatMessage({ id: "SERVICE_ACTIONS.SDK_GROUP_UPDATE_9" })}.
          </p>
          {this.getClipboardTrigger(otherCommand)}
        </div>
      );
    }

    return (
      <div>
        <p>
          {intl.formatMessage({ id: ServiceActionLabels[actionID] })}
          {" "}
          {intl.formatMessage({ id: "SERVICE_ACTIONS.SDK_GROUP_UPDATE_1" })}
          {" "}
          {updateDescription}
          {" "}
          {intl.formatMessage({ id: "SERVICE_ACTIONS.SDK_GROUP_UPDATE_2" })}.
        </p>
        <p>
          {intl.formatMessage({ id: "SERVICE_ACTIONS.SDK_GROUP_UPDATE_3" })}
          {" "}
          {sdkServicesList}
          {": "}
          {intl.formatMessage({ id: "SERVICE_ACTIONS.SDK_GROUP_UPDATE_4" })}
          {" "}
          <code>{"<package-name>-options.json"}</code>
          {" "}
          {intl.formatMessage({ id: "SERVICE_ACTIONS.SDK_GROUP_UPDATE_5" })}
          {". "}
          <a
            href={MetadataStore.buildDocsURI(
              "/deploying-services/config-universe-service/"
            )}
            target="_blank"
          >
            {intl.formatMessage({ id: "DOCS.MORE_INFORMATION" })}
          </a>
        </p>
        {this.getClipboardTrigger('{"env": {"<PACKAGE_NAME>_COUNT": "0"}}')}
        <p>
          {intl.formatMessage({ id: "SERVICE_ACTIONS.SDK_GROUP_UPDATE_6" })}.
        </p>
        {this.getClipboardTrigger(sdkCommand)}
        {otherServicesMessage}
      </div>
    );
  }

  getGroupDeleteMessage() {
    const { actionID, service, intl } = this.props;
    const serviceID = service ? service.getId() : "";
    const { selectedServices } = this.getServiceTypes(isSDKService);
    const packageCommand = this.getServiceListCommand(
      selectedServices,
      this.getDeleteCommand
    );
    const groupCommand = this.getDeleteCommand();

    return (
      <div>
        <p>
          {intl.formatMessage({ id: "SERVICE_ACTIONS.SDK_GROUP_DELETE_1" })}
          {". "}
          <a
            href={MetadataStore.buildDocsURI("/deploying-services/uninstall/")}
            target="_blank"
          >
            {intl.formatMessage({ id: "DOCS.MORE_INFORMATION" })}
          </a>
        </p>
        {this.getClipboardTrigger(packageCommand)}
        <p>
          {intl.formatMessage({ id: "SERVICE_ACTIONS.SDK_GROUP_DELETE_2" })}
          {" "}
          <a
            href={MetadataStore.buildDocsURI(
              "/usage/managing-services/uninstall/#framework-cleaner"
            )}
            target="_blank"
          >
            {intl.formatMessage({
              id: "SERVICE_ACTIONS.SDK_SERVICE_CLEARNER_SCRIPT"
            })}
          </a>
          {" "}
          {intl.formatMessage({ id: "SERVICE_ACTIONS.SDK_GROUP_DELETE_3" })}.
        </p>
        <p>
          {intl.formatMessage({ id: "SERVICE_ACTIONS.SDK_GROUP_DELETE_4" })}
          {", "}
          {intl
            .formatMessage({ id: ServiceActionLabels[actionID] })
            .toLowerCase()}
          {" "}
          {intl.formatMessage({ id: "SERVICE_ACTIONS.SDK_GROUP_DELETE_5" })}
          {" "}
          <span className="emphasis">{serviceID}</span>
          {": "}
          {intl.formatMessage({ id: "SERVICE_ACTIONS.SDK_GROUP_DELETE_6" })}.
          {" "}
          <a
            href={MetadataStore.buildDocsURI(
              "/cli/command-reference/dcos-marathon/dcos-marathon-group-remove/"
            )}
            target="_blank"
          >
            {intl.formatMessage({ id: "DOCS.MORE_INFORMATION" })}
          </a>
        </p>
        {this.getClipboardTrigger(groupCommand)}
      </div>
    );
  }

  getGroupMessage() {
    const { actionID, intl } = this.props;

    switch (actionID) {
      case SUSPEND:
        return this.getGroupUpdateMessage(
          intl.formatMessage({ id: "SERVICE_ACTIONS.SDK_GROUP_UPDATE_SUSPEND" })
        );
      case SCALE:
        return this.getGroupUpdateMessage(
          intl.formatMessage({ id: "SERVICE_ACTIONS.SDK_GROUP_UPDATE_SCALE" })
        );
      case DELETE:
        return this.getGroupDeleteMessage();
      default:
        return <noscript />;
    }
  }

  getClipboardTrigger(command) {
    return (
      <div className="code-copy-wrapper">
        <div className="code-copy-icon">
          <ClipboardTrigger
            className="clickable"
            copyText={command}
            onTextCopy={this.handleTextCopy.bind(this, command)}
            useTooltip={true}
          >
            <Icon id="clipboard" size="mini" ref="copyButton" color="grey" />
          </ClipboardTrigger>
        </div>
        <pre className="prettyprint flush-bottom prettyprinted">
          {command}
        </pre>
      </div>
    );
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
    const { open, onClose, service } = this.props;
    const message = service instanceof ServiceTree
      ? this.getGroupMessage()
      : this.getServiceMessage();

    return (
      <Modal
        open={open}
        onClose={onClose}
        header={this.getHeading()}
        showCloseButton={false}
        showHeader={true}
        showFooter={true}
        footer={this.getFooter()}
      >
        {message}
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
