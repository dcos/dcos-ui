import { Confirm } from "reactjs-components";
import { routerShape } from "react-router";
import PureRender from "react-addons-pure-render-mixin";
import React, { PropTypes } from "react";

import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import StringUtil from "#SRC/js/utils/StringUtil";
import UserActions from "#SRC/js/constants/UserActions";

import AppLockedMessage from "./AppLockedMessage";
import Pod from "../../structs/Pod";
import Service from "../../structs/Service";
import ServiceTree from "../../structs/ServiceTree";

// This needs to be at least equal to @modal-animation-duration
const REDIRECT_DELAY = 300;
const METHODS_TO_BIND = [
  "handleRightButtonClick",
  "handleChangeInputFieldDestroy"
];

class ServiceDestroyModal extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      errorMsg: null,
      inputFieldDestroy: ""
    };

    this.shouldComponentUpdate = PureRender.shouldComponentUpdate.bind(this);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillUpdate(nextProps) {
    const requestCompleted = this.props.isPending && !nextProps.isPending;

    const shouldClose = requestCompleted && !nextProps.errors;

    if (shouldClose) {
      this.redirectToServices();
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

  handleRightButtonClick() {
    const { service } = this.props;
    const serviceName = service ? service.getId() : "";
    const inputFieldDestroyValue = this.state.inputFieldDestroy;

    if (inputFieldDestroyValue === serviceName) {
      this.props.deleteItem(this.shouldForceUpdate());
    }
  }

  handleChangeInputFieldDestroy(e) {
    this.setState({
      inputFieldDestroy: e.target.value
    });
  }

  getDestroyMessage() {
    const { service } = this.props;
    const serviceName = service ? service.getId() : "";

    return (
      <p>
        {`In order to delete`}
        {" "}
        <span className="emphasize">{serviceName}</span>
        {" "}
        please type the service name.
      </p>
    );
  }

  getInputFieldDestroy() {
    return (
      <input
        className="form-control filter-input-text"
        onChange={this.handleChangeInputFieldDestroy}
        type="text"
        value={this.state.inputFieldDestroy}
      />
    );
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

  redirectToServices() {
    const { router } = this.context;

    // Close the modal and redirect after the close animation has completed
    this.props.onClose();
    setTimeout(() => {
      router.push({ pathname: "/services/overview" });
    }, REDIRECT_DELAY);
  }

  render() {
    const { isPending, onClose, open, service } = this.props;

    let itemText = "Service";

    if (service instanceof Pod) {
      itemText = "Pod";
    }

    if (service instanceof ServiceTree) {
      itemText = "Group";
    }

    const heading = (
      <ModalHeading className="text-danger">
        {StringUtil.capitalize(UserActions.DELETE)} {itemText}
      </ModalHeading>
    );

    return (
      <Confirm
        disabled={isPending}
        header={heading}
        open={open}
        onClose={onClose}
        leftButtonText="Cancel"
        leftButtonCallback={onClose}
        rightButtonText={`${StringUtil.capitalize(UserActions.DELETE)} ${itemText}`}
        rightButtonClassName="button button-danger"
        rightButtonCallback={this.handleRightButtonClick}
        showHeader={true}
      >
        {this.getDestroyMessage()}
        {this.getInputFieldDestroy()}
        {this.getErrorMessage()}
      </Confirm>
    );
  }
}

ServiceDestroyModal.contextTypes = {
  router: routerShape
};

ServiceDestroyModal.propTypes = {
  deleteItem: PropTypes.func.isRequired,
  errors: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  isPending: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  service: PropTypes.oneOfType([
    PropTypes.instanceOf(ServiceTree),
    PropTypes.instanceOf(Service)
  ]).isRequired
};

module.exports = ServiceDestroyModal;
