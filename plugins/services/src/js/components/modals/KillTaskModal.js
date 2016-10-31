import {Confirm} from 'reactjs-components';
import React, {PropTypes} from 'react';
import PureRender from 'react-addons-pure-render-mixin';

import AppLockedMessage from './AppLockedMessage';
import ModalHeading from '../../../../../../src/js/components/modals/ModalHeading';
import StringUtil from '../../../../../../src/js/utils/StringUtil';

const ACTION_DISPLAY_NAMES = {
  kill: 'Kill',
  killAndScale: 'Kill and Scale'
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
    const requestCompleted = this.props.isPending
      && !nextProps.isPending;

    const shouldClose = requestCompleted && !nextProps.errors;

    if (shouldClose) {
      this.props.onClose();
    }
  }

  componentWillReceiveProps(nextProps) {
    let {errors} = nextProps;
    if (!errors) {
      this.setState({errorMsg: null});

      return;
    }

    if (typeof errors === 'string') {
      this.setState({errorMsg: errors});

      return;
    }

    let {message: errorMsg = '', details} = errors;
    let hasDetails = details && details.length !== 0;

    if (hasDetails) {
      errorMsg = details.reduce(function (memo, error) {
        return `${memo} ${error.errors.join(' ')}`;
      }, '');
    }

    if (!errorMsg || !errorMsg.length) {
      errorMsg = null;
    }

    this.setState({errorMsg});
  }

  shouldForceUpdate() {
    return this.state.errorMsg && /force=true/.test(this.state.errorMsg);
  }

  getErrorMessage() {
    let {errorMsg} = this.state;

    if (!errorMsg) {
      return null;
    }

    if (this.shouldForceUpdate()) {
      return <AppLockedMessage />;
    }

    return (
      <p className="text-danger flush-top">{errorMsg}</p>
    );
  }

  getModalContents() {
    let selectedItemsLength = this.props.selectedItems.length;
    let action = ACTION_DISPLAY_NAMES[this.props.action] || '';
    let taskCountContent = `${selectedItemsLength} ${StringUtil.pluralize('Task', selectedItemsLength)}`;

    return (
      <div className="text-align-center">
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

    let header = (
      <ModalHeading className="text-danger">
        {ACTION_DISPLAY_NAMES[action]} {StringUtil.pluralize('Task', selectedItems.length)}
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
        rightButtonCallback={killTasksAction}
        showHeader={true}>
        {this.getModalContents()}
      </Confirm>
    );
  }
}

KillTaskModal.defaultProps = {
  action: 'kill',
  killTasks: () => {},
  selectedItems: []
};

KillTaskModal.propTypes = {
  action: PropTypes.string,
  errors: PropTypes.string,
  isPending: PropTypes.bool.isRequired,
  killTasks: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedItems: PropTypes.array
};

module.exports = KillTaskModal;
