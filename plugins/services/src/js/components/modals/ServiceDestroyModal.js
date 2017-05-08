import { Confirm } from "reactjs-components";
import { routerShape } from "react-router";
import PureRender from "react-addons-pure-render-mixin";
import React, { PropTypes } from "react";

import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import StringUtil from "#SRC/js/utils/StringUtil";
import UserActions from "#SRC/js/constants/UserActions";
import ClickToSelect from "#SRC/js/components/ClickToSelect";

import AppLockedMessage from "./AppLockedMessage";
import Framework from "../../structs/Framework";
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
      inputFieldDestroy: "",
      isButtonDisabled: true
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
    const { service, onClose } = this.props;
    const serviceName = service ? service.getId() : "";
    const inputFieldDestroyValue = this.state.inputFieldDestroy;

    if (service instanceof Framework) {
      onClose();
    }

    if (inputFieldDestroyValue === serviceName) {
      this.props.deleteItem(this.shouldForceUpdate());
    }
  }

  handleChangeInputFieldDestroy(e) {
    const { service } = this.props;
    const serviceName = service ? service.getId() : "";
    const inputValue = e.target.value;
    const comparison = inputValue === serviceName;

    this.setState({
      inputFieldDestroy: e.target.value,
      isButtonDisabled: !comparison
    });
  }

  getDestroyBody() {
    const { service } = this.props;

    if (service instanceof Framework) {
      return this.getDestroyPackage();
    } else {
      return this.getDestroyService();
    }
  }

  getDestroyPackage() {
    const { service } = this.props;
    const serviceName = service ? service.getId() : "";

    return (
      <div>
        <p>
          {`In order to delete a service, you must use the DC/OS CLI to perform this command. Refer to the documentation`}
          {" "}
          <a
            href="https://docs.mesosphere.com/service-docs/hdfs/uninstall/"
            target="_blank"
            title="documentation uninstall guide"
          >
            documentation
          </a>
          {" "}
          {`for complete instructions or copy and paste this command into your CLI`}
        </p>
        <div className="flush-top snippet-wrapper">
          <ClickToSelect>
            <pre className="prettyprint flush-bottom">
              dcos packages uninstall --app-id={serviceName}
            </pre>
          </ClickToSelect>
        </div>
      </div>
    );
  }

  getDestroyService() {
    const { service } = this.props;
    const serviceName = service ? service.getId() : "";

    return (
      <div>
        <p>
          {`In order to delete`}
          {" "}
          <span className="emphasize">{serviceName}</span>
          {" "}
          please type the service name.
        </p>
        <input
          className="form-control filter-input-text"
          onChange={this.handleChangeInputFieldDestroy}
          type="text"
          value={this.state.inputFieldDestroy}
        />
      </div>
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
    const { onClose, open, service } = this.props;
    let isButtonDisabled = this.state.isButtonDisabled;

    let itemText = `${StringUtil.capitalize(UserActions.DELETE)}`;

    if (service instanceof Pod) {
      itemText += " Pod";
    }

    if (service instanceof ServiceTree) {
      itemText += " Group";
    }

    if (service instanceof Framework) {
      isButtonDisabled = false;
      itemText = "Dismiss";
    }

    const heading = (
      <ModalHeading className="text-danger">
        {StringUtil.capitalize(UserActions.DELETE)} {itemText}
      </ModalHeading>
    );

    return (
      <Confirm
        disabled={isButtonDisabled}
        header={heading}
        open={open}
        onClose={onClose}
        leftButtonText="Cancel"
        leftButtonCallback={onClose}
        rightButtonText={itemText}
        rightButtonClassName="button button-danger"
        rightButtonCallback={this.handleRightButtonClick}
        showHeader={true}
      >
        {this.getDestroyBody()}
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
