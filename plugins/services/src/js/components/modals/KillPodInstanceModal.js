import { Confirm } from "reactjs-components";
import React, { PropTypes } from "react";
import PureRender from "react-addons-pure-render-mixin";

import AppLockedMessage from "./AppLockedMessage";
import ModalHeading
  from "../../../../../../src/js/components/modals/ModalHeading";
import Pod from "../../structs/Pod";
import StringUtil from "../../../../../../src/js/utils/StringUtil";

const ACTION_DISPLAY_NAMES = {
  restart: "Restart",
  stop: "Stop"
};

class KillPodInstanceModal extends React.Component {
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
    const { errorMsg } = this.state;

    if (!errorMsg) {
      return null;
    }

    if (this.shouldForceUpdate()) {
      return <AppLockedMessage />;
    }

    return <p className="text-danger flush-top">{errorMsg}</p>;
  }

  getModalContents() {
    const selectedItemsLength = this.props.selectedItems.length;
    const action = ACTION_DISPLAY_NAMES[this.props.action];
    const instanceCountContent = `${selectedItemsLength} ${StringUtil.pluralize("Instance", selectedItemsLength)}`;

    return (
      <div className="text-align-center">
        <p>
          You are about to {action.toLowerCase()} {instanceCountContent}.
          <br />
          Are you sure you want to continue?
        </p>
        {this.getErrorMessage()}
      </div>
    );
  }

  render() {
    const {
      action,
      isPending,
      killPodInstances,
      onClose,
      open,
      pod,
      selectedItems
    } = this.props;

    let buttonText = ACTION_DISPLAY_NAMES[action];

    if (this.shouldForceUpdate()) {
      buttonText = `Force ${buttonText}`;
    }

    const killAction = () =>
      killPodInstances(
        pod,
        selectedItems.map(function(item) {
          return item.id;
        }),
        this.shouldForceUpdate()
      );

    const header = (
      <ModalHeading className="text-danger">
        {ACTION_DISPLAY_NAMES[action]}
        {" "}
        {StringUtil.pluralize("Instance", selectedItems.length)}
      </ModalHeading>
    );

    return (
      <Confirm
        closeByBackdropClick={true}
        disabled={isPending}
        header={header}
        open={open}
        onClose={onClose}
        leftButtonText="Close"
        leftButtonCallback={onClose}
        rightButtonText={buttonText}
        rightButtonClassName="button button-danger"
        rightButtonCallback={killAction}
        showHeader={true}
      >
        {this.getModalContents()}
      </Confirm>
    );
  }
}

KillPodInstanceModal.defaultProps = {
  action: "restart",
  killPodInstances: () => {},
  pod: new Pod(),
  selectedItems: []
};

KillPodInstanceModal.propTypes = {
  action: PropTypes.string,
  errors: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  isPending: PropTypes.bool.isRequired,
  killPodInstances: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  pod: PropTypes.instanceOf(Pod),
  selectedItems: PropTypes.array
};

module.exports = KillPodInstanceModal;
