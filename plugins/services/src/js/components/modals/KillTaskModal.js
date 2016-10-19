import {Confirm} from 'reactjs-components';
import React, {PropTypes} from 'react';
import PureRender from 'react-addons-pure-render-mixin';

import AppLockedMessage from './AppLockedMessage';
import StringUtil from '../../../../../../src/js/utils/StringUtil';

const ACTION_DISPLAY_NAMES = {
  kill: 'Kill',
  killAndScale: 'Kill and Scale'
};

class KillTaskModal extends React.Component {
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
    let action = ACTION_DISPLAY_NAMES[this.props.action] || '';
    let taskCountContent = `${selectedItemsLength} ${StringUtil.pluralize('Task', selectedItemsLength)}`;

    return (
      <div className={'pod pod-short flush-right flush-bottom flush-left text-align-center'}>
        <h2 className="text-danger text-align-center flush-top">
          {action} {StringUtil.pluralize('Task', selectedItemsLength)}
        </h2>
        <p>
          You are about to {action.toLowerCase()} {taskCountContent}.
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
      killTasks,
      onClose,
      open,
      selectedItems
    } = this.props;

    let buttonText = ACTION_DISPLAY_NAMES[action];

    if (this.shouldForceUpdate()) {
      buttonText = 'Force ' + buttonText;
    }

    const killTasksAction = () => killTasks(
      selectedItems,
      action === 'killAndScale',
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
        rightButtonCallback={killTasksAction}>
        {this.getModalContents()}
      </Confirm>
    );
  }
}

KillTaskModal.defaultProps = {
  action: 'kill',
  selectedItems: []
};

KillTaskModal.propTypes = {
  action: PropTypes.string,
  errors: PropTypes.string,
  isPending: PropTypes.bool.isRequired,
  killTasks: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedItems: PropTypes.array
};

module.exports = KillTaskModal;
