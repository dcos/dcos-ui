import React, { PropTypes } from "react";
import PureRender from "react-addons-pure-render-mixin";

import AppLockedMessage from "./AppLockedMessage";
import FormModal from "../../../../../../src/js/components/FormModal";
import ModalHeading
  from "../../../../../../src/js/components/modals/ModalHeading";
import Pod from "../../structs/Pod";
import Service from "../../structs/Service";
import ServiceTree from "../../structs/ServiceTree";

class ServiceScaleFormModal extends React.Component {
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

  getScaleFormDefinition() {
    const { service } = this.props;
    let instancesCount = service.getInstancesCount();

    if (service instanceof ServiceTree) {
      instancesCount = "1.0";
    }

    return [
      {
        fieldType: "number",
        formElementClass: "horizontal-center",
        min: 0,
        name: "instances",
        placeholder: instancesCount,
        value: instancesCount.toString(),
        required: true,
        showLabel: false,
        writeType: "input"
      }
    ];
  }

  getHeader() {
    let headerText = "Service";

    if (this.props.service instanceof Pod) {
      headerText = "Pod";
    }

    if (this.props.service instanceof ServiceTree) {
      headerText = "Group";
    }

    return <ModalHeading>Scale {headerText}</ModalHeading>;
  }

  getBodyText() {
    let bodyText = "How many instances would you like to scale to?";

    if (this.props.service instanceof ServiceTree) {
      bodyText =
        "By which factor would you like to scale all applications within this group?";
    }

    return (
      <p className="text-align-center flush-top">
        {bodyText}
      </p>
    );
  }

  render() {
    const { clearError, isPending, onClose, open } = this.props;

    const buttonDefinition = [
      {
        text: "Cancel",
        className: "button button-medium",
        isClose: true
      },
      {
        text: "Scale Service",
        className: "button button-primary button-medium",
        isSubmit: true
      }
    ];

    const onSubmit = model => {
      this.props.scaleItem(model.instances, this.shouldForceUpdate());
    };

    return (
      <FormModal
        buttonDefinition={buttonDefinition}
        definition={this.getScaleFormDefinition()}
        modalProps={{
          header: this.getHeader(),
          showHeader: true
        }}
        disabled={isPending}
        onClose={onClose}
        onSubmit={onSubmit}
        onChange={clearError}
        open={open}
      >
        {this.getBodyText()}
        {this.getErrorMessage()}
      </FormModal>
    );
  }
}

ServiceScaleFormModal.propTypes = {
  scaleItem: PropTypes.func.isRequired,
  errors: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  isPending: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  service: PropTypes.oneOfType([
    PropTypes.instanceOf(ServiceTree),
    PropTypes.instanceOf(Service)
  ]).isRequired
};

module.exports = ServiceScaleFormModal;
