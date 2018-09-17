import { Trans, t } from "@lingui/macro";
import { withI18n } from "@lingui/react";
import PropTypes from "prop-types";
import React from "react";
import { MountService } from "foundation-ui";
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
  EDIT,
  RESTART,
  RESUME,
  SCALE,
  STOP
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
      return `dcos ${packageName} --name=${serviceID} update start --options=options.json`;
    }

    return `dcos marathon app update ${serviceID} options.json`;
  }

  getRestartCommand(service = this.props.service) {
    const serviceID = service ? service.getId() : "";

    return `dcos marathon app restart ${serviceID}`;
  }

  getServiceRestartMessage() {
    const command = this.getRestartCommand();

    return (
      <div>
        <Trans render="p">
          Restart your service from the DC/OS CLI.{" "}
          <a
            href={MetadataStore.buildDocsURI(
              "/cli/command-reference/dcos-marathon/dcos-marathon-app-restart/"
            )}
            target="_blank"
          >
            More information
          </a>
        </Trans>
        {this.getClipboardTrigger(command)}
      </div>
    );
  }

  getServiceStopMessage() {
    const command = this.getUpdateCommand();

    return (
      <div>
        <Trans render="p">
          Stop your service by scaling to 0 instances from the DC/OS CLI using
          an `options.json` file.{" "}
          <a
            href={MetadataStore.buildDocsURI(
              "/deploying-services/config-universe-service/"
            )}
            target="_blank"
          >
            More information
          </a>
        </Trans>
        {this.getClipboardTrigger(command)}
      </div>
    );
  }

  getServiceResumeMessage() {
    const command = this.getUpdateCommand();

    return (
      <div>
        <Trans render="p">
          Resume your service by scaling to 1 or more instances from the DC/OS
          CLI using an `options.json` file.{" "}
          <a
            href={MetadataStore.buildDocsURI(
              "/deploying-services/config-universe-service/"
            )}
            target="_blank"
          >
            More information
          </a>
        </Trans>
        {this.getClipboardTrigger(command)}
      </div>
    );
  }

  getServiceScaleMessage() {
    const command = this.getUpdateCommand();

    return (
      <div>
        <Trans render="p">
          Update the number of instances in your service's target configuration
          using an `options.json` file.
        </Trans>
        <Trans render="p">
          <span className="emphasis">Note:</span> Scaling to fewer instances is
          not supported.{" "}
          <a
            href={MetadataStore.buildDocsURI(
              "/deploying-services/config-universe-service/"
            )}
            target="_blank"
          >
            More information
          </a>{" "}
        </Trans>
        {this.getClipboardTrigger(command)}
      </div>
    );
  }

  getServiceEditMessage() {
    const { service } = this.props;

    return (
      <MountService.Mount type={"ServiceEditMessage:Modal"} service={service}>
        <Trans render="div" className="center">
          Editing this service is only available on{" "}
          <a href="https://mesosphere.com/product/" target="_blank">
            Mesosphere Enterprise DC/OS
          </a>.
        </Trans>
      </MountService.Mount>
    );
  }

  getServiceMessage() {
    const { actionID } = this.props;

    switch (actionID) {
      case RESTART:
        return this.getServiceRestartMessage();
      case STOP:
        return this.getServiceStopMessage();
      case RESUME:
        return this.getServiceResumeMessage();
      case SCALE:
        return this.getServiceScaleMessage();
      case EDIT:
        return this.getServiceEditMessage();
      default:
        return <noscript />;
    }
  }

  getServiceTypes(testFunction) {
    return this.props.service
      .flattenItems()
      .getItems()
      .reduce(
        function(memo, item) {
          if (testFunction(item)) {
            memo.selectedServices.push(item);
          } else {
            memo.otherServices.push(item);
          }

          return memo;
        },
        { selectedServices: [], otherServices: [] }
      );
  }

  getServiceList(services) {
    return services.map(function(item, index) {
      const comma = index === services.length - 1 ? "" : ", ";
      const itemID = item.getId();

      return (
        <span key={itemID}>
          <span className="emphasis">{itemID}</span>
          {comma}
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
    const { actionID, i18n } = this.props;
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
          <Trans render="p">
            For {otherServicesList}: Copy the JSON below into a file called{" "}
            <code>options.json</code>
            {". "}
            <a
              href={MetadataStore.buildDocsURI(
                "/deploying-services/config-universe-service/"
              )}
              target="_blank"
            >
              More information
            </a>
          </Trans>
          {this.getClipboardTrigger('{"instances": 0}')}
          <Trans render="p">
            Then, copy the command below into the DC/OS CLI.
          </Trans>
          {this.getClipboardTrigger(otherCommand)}
        </div>
      );
    }

    return (
      <div>
        <Trans render="p">
          {i18n._(ServiceActionLabels[actionID])} your group by{" "}
          {updateDescription} from the DC/OS CLI.
        </Trans>
        <Trans render="p">
          For {sdkServicesList}
          {": "}
          Create <code>{"<package-name>-options.json"}</code> files for each
          service. Here is a sample options file
          {". "}
          <a
            href={MetadataStore.buildDocsURI(
              "/deploying-services/config-universe-service/"
            )}
            target="_blank"
          >
            More information
          </a>
        </Trans>
        {this.getClipboardTrigger('{"env": {"<PACKAGE_NAME>_COUNT": "0"}}')}
        <Trans render="p">Then, use this command to update each service.</Trans>
        {this.getClipboardTrigger(sdkCommand)}
        {otherServicesMessage}
      </div>
    );
  }

  getGroupMessage() {
    const { actionID, i18n } = this.props;

    switch (actionID) {
      case STOP:
        return this.getGroupUpdateMessage(
          i18n._(t`scaling each service to 0 instances`)
        );
      case SCALE:
        return this.getGroupUpdateMessage(
          i18n._(t`updating the number of instances of each service`)
        );
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
            <Icon id="clipboard" size="mini" color="grey" />
          </ClipboardTrigger>
        </div>
        <pre className="prettyprint flush-bottom prettyprinted">{command}</pre>
      </div>
    );
  }

  getHeading() {
    const { actionID, service } = this.props;

    let itemText = <Trans>Service</Trans>;

    if (service instanceof Pod) {
      itemText = <Trans>Pod</Trans>;
    }

    if (service instanceof ServiceTree) {
      itemText = <Trans>Group</Trans>;
    }

    const action = actionID ? (
      <Trans id={ServiceActionLabels[actionID]} />
    ) : (
      actionID
    );

    return (
      <ModalHeading>
        {action} {itemText}
      </ModalHeading>
    );
  }

  getFooter() {
    const { onClose } = this.props;

    return (
      <div className="flush-bottom flex flex-direction-top-to-bottom flex-align-items-stretch-screen-small flex-direction-left-to-right-screen-small flex-justify-items-space-between-screen-small">
        <Trans
          render={
            <button className="button button-primary-link" onClick={onClose} />
          }
        >
          Close
        </Trans>
      </div>
    );
  }

  render() {
    const { open, onClose, service } = this.props;
    const message =
      service instanceof ServiceTree
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

module.exports = withI18n()(ServiceActionDisabledModal);
