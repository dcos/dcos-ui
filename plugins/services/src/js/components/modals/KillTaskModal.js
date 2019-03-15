import { Confirm } from "reactjs-components";
import PropTypes from "prop-types";
import React from "react";
import { Trans, t } from "@lingui/macro";
import { withI18n, i18nMark } from "@lingui/react";

import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import StringUtil from "#SRC/js/utils/StringUtil";

import AppLockedMessage from "./AppLockedMessage";

const ACTION_DISPLAY_NAMES = {
  restart: i18nMark("Restart"),
  stop: i18nMark("Stop")
};

class KillTaskModal extends React.PureComponent {
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
    const { i18n } = this.props;
    const selectedItemsLength = this.props.selectedItems.length;
    const action = ACTION_DISPLAY_NAMES[this.props.action] || "";
    // L10NTODO: Pluralize
    const taskCountContent = `${selectedItemsLength} ${StringUtil.pluralize(
      "task",
      selectedItemsLength
    )}`;

    return (
      <div>
        <Trans render="p">
          You are about to {i18n._(action).toLowerCase()} {taskCountContent}.
          Are you sure you want to continue?
        </Trans>
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
      selectedItems,
      i18n
    } = this.props;

    // L10NTODO: Pluralize
    let buttonText = `${i18n._(
      ACTION_DISPLAY_NAMES[action]
    )} ${StringUtil.pluralize("Task", selectedItems.length)}`;

    if (this.shouldForceUpdate()) {
      buttonText = i18n._(t`Force`) + " " + buttonText;
    }

    const killTasksAction = () =>
      killTasks(selectedItems, action === "stop", this.shouldForceUpdate());

    // L10NTODO: Pluralize
    const header = (
      <ModalHeading className="text-danger">
        {i18n._(ACTION_DISPLAY_NAMES[action])}{" "}
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
        leftButtonText={i18n._(t`Cancel`)}
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

export default withI18n()(KillTaskModal);
