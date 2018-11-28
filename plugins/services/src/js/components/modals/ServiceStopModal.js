import { Trans, t } from "@lingui/macro";
import { withI18n } from "@lingui/react";
import { Confirm } from "reactjs-components";
import PropTypes from "prop-types";
import React from "react";

import ModalHeading from "#SRC/js/components/modals/ModalHeading";

import AppLockedMessage from "./AppLockedMessage";
import Pod from "../../structs/Pod";
import Service from "../../structs/Service";
import ServiceTree from "../../structs/ServiceTree";

class ServiceStopModal extends React.PureComponent {
  constructor() {
    super(...arguments);

    this.state = {
      errorMsg: null
    };
  }

  componentWillUpdate(nextProps) {
    const requestCompleted = this.props.isPending && !nextProps.isPending;

    const shouldClose = requestCompleted && !nextProps.errors;

    if (shouldClose) {
      this.props.onClose();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { errors } = nextProps;
    if (!errors) {
      this.setState({ errorMsg: null });

      return;
    }

    if (typeof errors === "string") {
      this.setState({ errorMsg: errors });

      return;
    }

    let { message: errorMsg = "", details } = errors;
    const hasDetails = details && details.length !== 0;

    if (hasDetails) {
      errorMsg = details.reduce(function(memo, error) {
        return `${memo} ${error.errors.join(" ")}`;
      }, "");
    }

    if (!errorMsg || !errorMsg.length) {
      errorMsg = null;
    }

    this.setState({ errorMsg });
  }

  shouldForceUpdate() {
    return this.state.errorMsg && /force=true/.test(this.state.errorMsg);
  }

  getErrorMessage() {
    const { errorMsg = null } = this.state;

    if (!errorMsg) {
      return null;
    }

    if (this.shouldForceUpdate()) {
      return <AppLockedMessage service={this.props.service} />;
    }

    return (
      <h4 className="text-align-center text-danger flush-top">{errorMsg}</h4>
    );
  }

  getServiceLabel() {
    const { service, i18n } = this.props;

    if (service instanceof Pod) {
      return i18n._(t`Pod`);
    }

    if (service instanceof ServiceTree) {
      return i18n._(t`Group`);
    }

    return i18n._(t`Service`);
  }

  getModalHeading() {
    const serviceLabel = this.getServiceLabel();

    return (
      <ModalHeading>
        <Trans render="span">Stop {serviceLabel}</Trans>
      </ModalHeading>
    );
  }

  render() {
    const { isPending, onClose, open, service, stopItem, i18n } = this.props;
    const serviceLabel = this.getServiceLabel();
    const serviceName = service.getName();

    return (
      <Confirm
        disabled={isPending}
        header={this.getModalHeading()}
        open={open}
        onClose={onClose}
        leftButtonCallback={onClose}
        leftButtonClassName="button button-primary-link flush-left"
        rightButtonText={i18n._(t`Stop`) + ` ${serviceLabel}`}
        rightButtonCallback={() => stopItem(this.shouldForceUpdate())}
        rightButtonClassName="button button-danger"
        showHeader={true}
      >
        <Trans render="p">
          Stopping the <strong>{serviceName}</strong>{" "}
          {serviceLabel.toLowerCase()} will remove all currently running
          instances of the {serviceLabel.toLowerCase()}. The{" "}
          {serviceLabel.toLowerCase()} will not be deleted.
        </Trans>
        {this.getErrorMessage()}
      </Confirm>
    );
  }
}

ServiceStopModal.propTypes = {
  stopItem: PropTypes.func.isRequired,
  errors: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  isPending: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  service: PropTypes.oneOfType([
    PropTypes.instanceOf(ServiceTree),
    PropTypes.instanceOf(Service)
  ]).isRequired
};

module.exports = withI18n()(ServiceStopModal);
