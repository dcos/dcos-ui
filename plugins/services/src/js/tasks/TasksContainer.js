import React, {PropTypes} from 'react';

import ActionKeys from '../constants/ActionKeys';
import MarathonActions from '../events/MarathonActions';
import ServiceActionItem from '../constants/ServiceActionItem';
import TaskModals from '../components/modals/TaskModals';
import TasksView from './TasksView';

import AppDispatcher from '../../../../../src/js/events/AppDispatcher';
import ContainerUtil from '../../../../../src/js/utils/ContainerUtil';

import {
  REQUEST_MARATHON_POD_INSTANCE_KILL_ERROR,
  REQUEST_MARATHON_POD_INSTANCE_KILL_SUCCESS,

  REQUEST_MARATHON_TASK_KILL_ERROR,
  REQUEST_MARATHON_TASK_KILL_SUCCESS
} from '../constants/ActionTypes';

const METHODS_TO_BIND = [
  'handleServerAction',
  'handleModalClose',
  'clearActionError',
  'killPodInstances',
  'killTasks'
];

class TasksContainer extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      actionErrors: {},
      pendingActions: {}
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    // Listen for server actions so we can update state immediately
    // on the completion of an API request.
    this.dispatcher = AppDispatcher.register(this.handleServerAction);
  }

  componentWillUnmount() {
    AppDispatcher.unregister(this.dispatcher);
  }

  getChildContext() {
    return {
      modalHandlers: this.getModalHandlers()
    };
  }

  killPodInstances() {
    this.setPendingAction(ActionKeys.POD_INSTANCES_KILL);

    return MarathonActions.killPodInstances(...arguments);
  }

  killTasks() {
    this.setPendingAction(ActionKeys.TASK_KILL);

    return MarathonActions.killTasks(...arguments);
  }

  handleServerAction(payload) {
    const {action} = payload;

    switch (action.type) {
      case REQUEST_MARATHON_POD_INSTANCE_KILL_ERROR:
        this.unsetPendingAction(ActionKeys.POD_INSTANCES_KILL, action.data);
        break;
      case REQUEST_MARATHON_POD_INSTANCE_KILL_SUCCESS:
        this.unsetPendingAction(ActionKeys.POD_INSTANCES_KILL);
        break;

      case REQUEST_MARATHON_TASK_KILL_ERROR:
        this.unsetPendingAction(ActionKeys.TASK_KILL, action.data);
        break;
      case REQUEST_MARATHON_TASK_KILL_SUCCESS:
        this.unsetPendingAction(ActionKeys.TASK_KILL);
        break;
    }
  }

  handleModalClose(key) {
    if (key) {
      this.clearActionError(key);
    }
    this.setState({modal: {}});
  }

  fetchData() {
    // Re-fetch data - this will end up being a single Relay request
  }
  /**
   * Sets the actionType to pending in state which will in turn be pushed
   * to children components as a prop. Also clears any existing error for
   * the actionType
   * @param {String} actionType
   */
  setPendingAction(actionType) {
    const {actionErrors, pendingActions} = this.state;

    this.setState({
      actionErrors: ContainerUtil.adjustActionErrors(
        actionErrors, actionType, null
      ),
      pendingActions: ContainerUtil.adjustPendingActions(
        pendingActions, actionType, true
      )
    });
  }
  /**
   * Sets the pending actionType to false in state which will in turn be
   * pushed down to children via props. Can optional set an error for the
   * actionType
   * @param  {String} actionType
   * @param  {Any} error
   */
  unsetPendingAction(actionType, error = null) {
    const {actionErrors, pendingActions} = this.state;

    this.setState({
      actionErrors: ContainerUtil.adjustActionErrors(
        actionErrors, actionType, error
      ),
      pendingActions: ContainerUtil.adjustPendingActions(
        pendingActions, actionType, false
      )
    });

    // Fetch new data if action was successful
    if (!error) {
      this.fetchData();
    }
  }

  clearActionError(actionType) {
    const {actionErrors} = this.state;

    this.setState({
      actionErrors: ContainerUtil.adjustActionErrors(
        actionErrors, actionType, null
      )
    });
  }

  getModalHandlers() {
    const set = (id, props) => {
      // Set props to be passed into modal
      this.setState({
        modal: Object.assign({}, props, {id})
      });
    };

    return {
      killTasks: (props) => set(ServiceActionItem.KILL_TASKS, props),
      killPodInstances: (props) => set(
        ServiceActionItem.KILL_POD_INSTANCES, props)
    };
  }

  getActions() {
    return {
      killPodInstances: this.killPodInstances,
      killTasks: this.killTasks
    };
  }

  getModals() {
    let modalProps = Object.assign({}, this.state.modal);

    return (
      <TaskModals
        actions={this.getActions()}
        actionErrors={this.state.actionErrors}
        clearError={this.clearActionError}
        onClose={this.handleModalClose}
        pendingActions={this.state.pendingActions}
        modalProps={modalProps} />
    );
  }

  render() {
    return (
      <div>
        <TasksView
          tasks={this.props.tasks}
          label="Instance" />
        {this.getModals()}
      </div>
    );
  }
}

// Make these modal handlers available via context
// so any child can trigger the opening of modals
TasksContainer.childContextTypes = {
  modalHandlers: PropTypes.shape({
    killTasks: PropTypes.func,
    killPodInstances: PropTypes.func
  })
};

TasksContainer.propTypes = {
  tasks: PropTypes.array.isRequired
};

module.exports = TasksContainer;
