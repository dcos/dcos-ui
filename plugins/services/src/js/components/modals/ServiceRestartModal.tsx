import { Trans, t } from "@lingui/macro";
import { withI18n, i18nMark } from "@lingui/react";
import { Confirm } from "reactjs-components";
import PropTypes from "prop-types";
import * as React from "react";

import ModalHeading from "#SRC/js/components/modals/ModalHeading";

import AppLockedMessage from "./AppLockedMessage";
import Pod from "../../structs/Pod";
import Service from "../../structs/Service";
import ServiceTree from "../../structs/ServiceTree";

class ServiceRestartModal extends React.PureComponent {
  static propTypes = {
    errors: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    isPending: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    restartService: PropTypes.func.isRequired,
    service: PropTypes.oneOfType([
      PropTypes.instanceOf(ServiceTree),
      PropTypes.instanceOf(Service),
    ]).isRequired,
  };
  constructor(...args) {
    super(...args);

    this.state = {
      errorMsg: null,
    };
  }

  UNSAFE_componentWillUpdate(nextProps) {
    const requestCompleted = this.props.isPending && !nextProps.isPending;

    const shouldClose = requestCompleted && !nextProps.errors;

    if (shouldClose) {
      this.props.onClose();
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
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
      errorMsg = details.reduce(
        (memo, error) => `${memo} ${error.errors.join(" ")}`,
        ""
      );
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
    const { service } = this.props;

    if (service instanceof Pod) {
      return i18nMark("Pod");
    }

    if (service instanceof ServiceTree) {
      return i18nMark("Group");
    }

    return i18nMark("Service");
  }

  getModalHeading() {
    const { i18n } = this.props;
    const serviceLabel = this.getServiceLabel();

    return (
      <ModalHeading>
        <Trans render="span">Restart {i18n._(serviceLabel)}</Trans>
      </ModalHeading>
    );
  }

  render() {
    const {
      isPending,
      onClose,
      open,
      service,
      restartService,
      i18n,
    } = this.props;
    const serviceName = service.getName();
    const serviceLabel = i18n._(this.getServiceLabel());
    const restartActionText = isPending
      ? i18n._(t`Restarting...`)
      : i18n._(t`Restart`) + ` ${serviceLabel}`;

    return (
      <Confirm
        disabled={isPending}
        header={this.getModalHeading()}
        open={open}
        onClose={onClose}
        leftButtonCallback={onClose}
        leftButtonClassName="button button-primary-link flush-left"
        rightButtonText={restartActionText}
        rightButtonClassName="button button-danger"
        rightButtonCallback={() =>
          restartService(service, this.shouldForceUpdate())
        }
        showHeader={true}
      >
        <Trans render="p">
          Restarting the <strong>{serviceName}</strong>{" "}
          {serviceLabel.toLowerCase()} will remove all currently running
          instances of the {serviceLabel.toLowerCase()} and then attempt to
          create new instances identical to those removed.
        </Trans>
        {this.getErrorMessage()}
      </Confirm>
    );
  }
}

export default withI18n()(ServiceRestartModal);
