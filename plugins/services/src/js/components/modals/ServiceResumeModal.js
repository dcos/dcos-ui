import { Trans, t } from "@lingui/macro";
import { withI18n } from "@lingui/react";
import { Confirm } from "reactjs-components";
import PropTypes from "prop-types";
import React from "react";

import FieldInput from "#SRC/js/components/form/FieldInput";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormRow from "#SRC/js/components/form/FormRow";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";

import AppLockedMessage from "./AppLockedMessage";
import Service from "../../structs/Service";
import ServiceTree from "../../structs/ServiceTree";

const METHODS_TO_BIND = ["handleConfirmation", "handleInstancesFieldChange"];

class ServiceResumeModal extends React.PureComponent {
  constructor() {
    super(...arguments);

    this.state = {
      instancesFieldValue: 1,
      errorMsg: null
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillUpdate(nextProps) {
    const requestCompleted = this.props.isPending && !nextProps.isPending;
    const shouldClose = requestCompleted && !nextProps.errors;

    if (shouldClose) {
      this.props.onClose();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { errors, open } = nextProps;

    if (open && !this.props.open) {
      this.setState({ instancesFieldValue: 1 });
    }

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

  handleConfirmation() {
    const instances =
      this.state.instancesFieldValue == null
        ? 1
        : this.state.instancesFieldValue;

    this.props.resumeService(instances, this.shouldForceUpdate());
  }

  handleInstancesFieldChange(event) {
    this.setState({
      instancesFieldValue: event.target.value
    });
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

  getModalContent() {
    const {
      props: { service }
    } = this;

    if (service.getLabels().MARATHON_SINGLE_INSTANCE_APP) {
      return (
        <Trans render="p">
          This service is currently stopped. Do you want to resume this service?
        </Trans>
      );
    }

    return (
      <div>
        <Trans render="p">
          This service is currently stopped. Do you want to resume this service?
          You can change the number of instances to resume by using the field
          below.
        </Trans>
        <FormRow>
          <FormGroup className="form-row-element column-12 form-row-input">
            <FieldInput
              name="instances"
              onChange={this.handleInstancesFieldChange}
              type="number"
              value={this.state.instancesFieldValue}
            />
          </FormGroup>
        </FormRow>
      </div>
    );
  }

  shouldForceUpdate() {
    return this.state.errorMsg && /force=true/.test(this.state.errorMsg);
  }

  render() {
    const { isPending, onClose, open, i18n } = this.props;

    const heading = (
      <ModalHeading>
        <Trans render="span">Resume Service</Trans>
      </ModalHeading>
    );

    return (
      <Confirm
        disabled={isPending}
        header={heading}
        open={open}
        onClose={onClose}
        leftButtonCallback={onClose}
        leftButtonClassName="button button-primary-link flush-left"
        rightButtonText={i18n._(t`Resume Service`)}
        rightButtonClassName="button button-primary"
        rightButtonCallback={this.handleConfirmation}
        showHeader={true}
      >
        {this.getModalContent()}
        {this.getErrorMessage()}
      </Confirm>
    );
  }
}

ServiceResumeModal.propTypes = {
  errors: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  isPending: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  resumeService: PropTypes.func.isRequired,
  service: PropTypes.oneOfType([
    PropTypes.instanceOf(ServiceTree),
    PropTypes.instanceOf(Service)
  ]).isRequired
};

module.exports = withI18n()(ServiceResumeModal);
