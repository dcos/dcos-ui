import {Confirm} from 'reactjs-components';
import React, {PropTypes} from 'react';
import PureRender from 'react-addons-pure-render-mixin';

import AppLockedMessage from './AppLockedMessage';
import Pod from '../../structs/Pod';
import StringUtil from '../../../../../../src/js/utils/StringUtil';

const ACTION_DISPLAY_NAMES = {
  kill: 'Kill',
  killAndScale: 'Kill and Scale'
};

class KillPodInstanceModal extends React.Component {
  constructor() {
    super(...arguments);

    this.shouldComponentUpdate = PureRender.shouldComponentUpdate.bind(this);
  }

  componentWillUpdate(nextProps) {
    const requestCompleted = this.props.isPending
      && !nextProps.isPending;

    const shouldClose = requestCompleted && !nextProps.errors;

    if (shouldClose) {
      this.props.onClose();
    }
  }

  shouldForceUpdate() {
    return this.props.errors && /force=true/.test(this.props.errors);
  }

  getErrorMessage() {
    let {errors} = this.props;

    if (!errors) {
      return null;
    }

    if (this.shouldForceUpdate()) {
      return <AppLockedMessage />;
    }

    return (
      <p className="text-danger flush-top">{errors}</p>
    );
  }

  getModalContents() {
    let selectedItemsLength = this.props.selectedItems.length;
    let action = ACTION_DISPLAY_NAMES[this.props.action];
    let instanceCountContent = `${selectedItemsLength} ${StringUtil.pluralize('Instance', selectedItemsLength)}`;

    return (
      <div className="container container-pod container-pod-short-top text-align-center flush-bottom">
        <h2 className="text-danger text-align-center flush-top">
          {action} {StringUtil.pluralize('Instance', selectedItemsLength)}
        </h2>
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

    const killAction = () => killPodInstances(
      pod,
      selectedItems.map(function (item) {
        return item.id;
      }),
      this.shouldForceUpdate()
    );

    return (
      <Confirm
        closeByBackdropClick={true}
        disabled={isPending}
        open={open}
        onClose={onClose}
        leftButtonText="Close"
        leftButtonCallback={onClose}
        rightButtonText={buttonText}
        rightButtonClassName="button button-danger"
        rightButtonCallback={killAction}>
        {this.getModalContents()}
      </Confirm>
    );
  }
}

KillPodInstanceModal.defaultProps = {
  action: 'kill',
  pod: new Pod(),
  selectedItems: []
};

KillPodInstanceModal.propTypes = {
  action: PropTypes.string,
  errors: PropTypes.string,
  isPending: PropTypes.bool.isRequired,
  killPodInstances: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  pod: PropTypes.instanceOf(Pod),
  selectedItems: PropTypes.array
};

module.exports = KillPodInstanceModal;
