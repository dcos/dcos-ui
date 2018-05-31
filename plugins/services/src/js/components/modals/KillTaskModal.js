import { Confirm } from "reactjs-components";
import PropTypes from "prop-types";
import React from "react";
import PureRender from "react-addons-pure-render-mixin";

import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import StringUtil from "#SRC/js/utils/StringUtil";

import AppLockedMessage from "./AppLockedMessage";

const ACTION_DISPLAY_NAMES = {
  restart: "Restart",
  stop: "Stop"
};

class KillTaskModal extends React.Component {
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
    const action = ACTION_DISPLAY_NAMES[this.props.action] || "";
    const taskCountContent = `${selectedItemsLength} ${StringUtil.pluralize(
      "task",
      selectedItemsLength
    )}`;

    return (
      <div>
        <p>
          You are about to {action.toLowerCase()} {taskCountContent}. Are you
          sure you want to continue?
        </p>
        {this.getErrorMessage()}
      </div>
    );
  }

  render() {
    const {
      action,
      isPending,
      killTasks,
      onClose,
      open,
      selectedItems
    } = this.props;

    let buttonText = `${ACTION_DISPLAY_NAMES[action]} ${StringUtil.pluralize(
      "Task",
      selectedItems.length
    )}`;

    if (this.shouldForceUpdate()) {
      buttonText = "Force " + buttonText;
    }

    const killTasksAction = () =>
      killTasks(selectedItems, action === "stop", this.shouldForceUpdate());

    const header = (
      <ModalHeading className="text-danger">
        {ACTION_DISPLAY_NAMES[action]}{" "}
        {StringUtil.pluralize("Task", selectedItems.length)}
      </ModalHeading>
    );

    return (
      <Confirm
        closeByBackdropClick={true}
        disabled={isPending}
        header={header}
        open={open}
        onClose={onClose}
        leftButtonText="Cancel"
        leftButtonClassName="button button-primary-link flush-left"
        leftButtonCallback={onClose}
        rightButtonText={buttonText}
        rightButtonClassName="button button-danger"
        rightButtonCallback={killTasksAction}
        showHeader={true}
      >
        {this.getModalContents()}
      </Confirm>
    );
  }
}

KillTaskModal.defaultProps = {
  action: "restart",
  killTasks: () => {},
  selectedItems: []
};

KillTaskModal.propTypes = {
  action: PropTypes.string,
  errors: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  isPending: PropTypes.bool.isRequired,
  killTasks: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedItems: PropTypes.array
};

module.exports = KillTaskModal;
