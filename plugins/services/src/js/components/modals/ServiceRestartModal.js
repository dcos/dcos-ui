import { Confirm } from "reactjs-components";
import React, { PropTypes } from "react";
import PureRender from "react-addons-pure-render-mixin";

import AppLockedMessage from "./AppLockedMessage";
import ModalHeading
  from "../../../../../../src/js/components/modals/ModalHeading";
import Service from "../../structs/Service";
import ServiceTree from "../../structs/ServiceTree";

class ServiceRestartModal extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      errorMsg: null
    };

    this.shouldComponentUpdate = PureRender.shouldComponentUpdate.bind(this);
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

  render() {
    const { isPending, onClose, open, service, restartService } = this.props;

    const heading = (
      <ModalHeading>
        Restart Service
      </ModalHeading>
    );
    let serviceName = "";

    if (service) {
      serviceName = service.getId();
    }

    return (
      <Confirm
        disabled={isPending}
        header={heading}
        open={open}
        onClose={onClose}
        leftButtonCallback={onClose}
        rightButtonText="Restart Service"
        rightButtonClassName="button button-danger"
        rightButtonCallback={() =>
          restartService(service, this.shouldForceUpdate())}
        showHeader={true}
      >
        <p>
          Are you sure you want to restart
          {" "}
          <span className="emphasize">{serviceName}</span>
          ?
        </p>
        {this.getErrorMessage()}
      </Confirm>
    );
  }
}

ServiceRestartModal.propTypes = {
  errors: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  isPending: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  restartService: PropTypes.func.isRequired,
  service: PropTypes.oneOfType([
    PropTypes.instanceOf(ServiceTree),
    PropTypes.instanceOf(Service)
  ]).isRequired
};

module.exports = ServiceRestartModal;
