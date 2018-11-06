import { Trans, t } from "@lingui/macro";
import { withI18n } from "@lingui/react";
import { Confirm } from "reactjs-components";
import PropTypes from "prop-types";
import React from "react";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";

class JobStopRunModal extends React.Component {
  getContentHeader(selectedItems, selectedItemsLength) {
    let headerContent = `Are you sure you want to stop ${selectedItemsLength} Job Runs?`;
    if (selectedItemsLength === 1) {
      headerContent = "Are you sure you want to stop this?";
    }

    return (
      <ModalHeading key="confirmHeader">
        <Trans render="span" id={headerContent} />
      </ModalHeading>
    );
  }

  getConfirmTextBody(selectedItems, selectedItemsLength) {
    let bodyText;

    if (selectedItemsLength === 1) {
      bodyText = `You are about to stop the job run with id ${
        selectedItems[0]
      }.`;
    } else {
      bodyText = "You are about to stop the selected job runs.";
    }

    return (
      <span key="confirmText">
        <Trans render="span" id={bodyText} />
      </span>
    );
  }

  render() {
    const {
      onClose,
      onSuccess,
      open,
      selectedItems,
      disabled,
      i18n
    } = this.props;
    const selectedItemsLength = selectedItems.length;
    let rightButtonText = i18n._(t`Stop Job Run`);

    // L10NTODO: Pluralize
    if (selectedItemsLength > 1) {
      rightButtonText = i18n._(t`Stop Job Runs`);
    }

    return (
      <Confirm
        closeByBackdropClick={true}
        disabled={disabled}
        header={this.getContentHeader(selectedItems, selectedItemsLength)}
        open={open}
        onClose={onClose}
        leftButtonText={i18n._(t`Cancel`)}
        leftButtonCallback={onClose}
        leftButtonClassName="button button-primary-link"
        rightButtonText={rightButtonText}
        rightButtonClassName="button button-danger"
        rightButtonCallback={onSuccess}
        showHeader={true}
      >
        <div className="text-align-center">
          {this.getConfirmTextBody(selectedItems, selectedItemsLength)}
        </div>
      </Confirm>
    );
  }
}

JobStopRunModal.defaultProps = {
  onSuccess() {}
};

JobStopRunModal.propTypes = {
  jobID: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  open: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  selectedItems: PropTypes.array.isRequired
};

export default withI18n()(JobStopRunModal);
