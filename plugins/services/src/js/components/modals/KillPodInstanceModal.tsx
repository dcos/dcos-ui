import { Confirm } from "reactjs-components";
import PropTypes from "prop-types";
import * as React from "react";
import { Trans, t } from "@lingui/macro";
import { withI18n, i18nMark } from "@lingui/react";

import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import StringUtil from "#SRC/js/utils/StringUtil";

import AppLockedMessage from "./AppLockedMessage";
import Pod from "../../structs/Pod";

const ACTION_DISPLAY_NAMES = {
  restart: i18nMark("Restart"),
  stop: i18nMark("Stop"),
};

const ACTION_DISPLAY_NAMES_CONTINUOUS = {
  restart: i18nMark("Restarting..."),
  stop: i18nMark("Stopping..."),
};

class KillPodInstanceModal extends React.PureComponent {
  static defaultProps = {
    action: "restart",
    killPodInstances: () => {},
    pod: new Pod(),
    selectedItems: [],
  };
  static propTypes = {
    action: PropTypes.string,
    errors: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    isPending: PropTypes.bool.isRequired,
    killPodInstances: PropTypes.func,
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    pod: PropTypes.instanceOf(Pod),
    selectedItems: PropTypes.array,
  };

  state = { errorMsg: null };

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
    const action = ACTION_DISPLAY_NAMES[this.props.action];
    // L10NTODO: Pluralize
    const instanceCountContent = `${selectedItemsLength} ${StringUtil.pluralize(
      "Instance",
      selectedItemsLength
    )}`;

    return (
      <div>
        <Trans render="p">
          You are about to {i18n._(action).toLowerCase()} {instanceCountContent}
          . Are you sure you want to continue?
        </Trans>
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
      selectedItems,
      i18n,
    } = this.props;

    let buttonText = i18n._(ACTION_DISPLAY_NAMES[action]);

    if (this.shouldForceUpdate()) {
      buttonText = i18n._(t`Force`) + " " + buttonText;
    }

    if (isPending) {
      buttonText = i18n._(ACTION_DISPLAY_NAMES_CONTINUOUS[action]);
    }

    const killAction = () =>
      killPodInstances(
        pod,
        selectedItems.map((item) => item.id),
        this.shouldForceUpdate()
      );

    // L10NTODO: Pluralize
    const header = (
      <ModalHeading className="text-danger">
        {i18n._(ACTION_DISPLAY_NAMES[action])}{" "}
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
        leftButtonText={i18n._(t`Cancel`)}
        leftButtonClassName="button button-primary-link flush-left"
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

export default withI18n()(KillPodInstanceModal);
