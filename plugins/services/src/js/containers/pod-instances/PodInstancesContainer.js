import React, { PropTypes } from "react";

import ActionKeys from "../../constants/ActionKeys";
import MarathonActions from "../../events/MarathonActions";
import Pod from "../../structs/Pod";
import PodInstancesView from "./PodInstancesView";
import PodUtil from "../../utils/PodUtil";
import ServiceActionItem from "../../constants/ServiceActionItem";
import TaskModals from "../../components/modals/TaskModals";

import AppDispatcher from "../../../../../../src/js/events/AppDispatcher";
import ContainerUtil from "../../../../../../src/js/utils/ContainerUtil";
import EventTypes from "../../../../../../src/js/constants/EventTypes";
import MesosStateStore from "../../../../../../src/js/stores/MesosStateStore";

import {
  REQUEST_MARATHON_POD_INSTANCE_KILL_ERROR,
  REQUEST_MARATHON_POD_INSTANCE_KILL_SUCCESS
} from "../../constants/ActionTypes";

const METHODS_TO_BIND = [
  "handleMesosStateChange",
  "handleServerAction",
  "handleModalClose",
  "clearActionError",
  "killPodInstances"
];

class PodInstancesContainer extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      actionErrors: {},
      lastUpdate: 0,
      pendingActions: {}
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    MesosStateStore.addChangeListener(
      EventTypes.MESOS_STATE_CHANGE,
      this.handleMesosStateChange
    );
    // Listen for server actions so we can update state immediately
    // on the completion of an API request.
    this.dispatcher = AppDispatcher.register(this.handleServerAction);
  }

  componentWillUnmount() {
    MesosStateStore.removeChangeListener(
      EventTypes.MESOS_STATE_CHANGE,
      this.handleMesosStateChange
    );

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

  handleMesosStateChange() {
    this.setState({
      lastUpdate: Date.now()
    });
  }

  handleServerAction(payload) {
    const { action } = payload;

    switch (action.type) {
      case REQUEST_MARATHON_POD_INSTANCE_KILL_ERROR:
        this.unsetPendingAction(ActionKeys.POD_INSTANCES_KILL, action.data);
        break;
      case REQUEST_MARATHON_POD_INSTANCE_KILL_SUCCESS:
        this.unsetPendingAction(ActionKeys.POD_INSTANCES_KILL);
        break;
    }
  }

  handleModalClose(key) {
    if (key) {
      this.clearActionError(key);
    }
    this.setState({ modal: {} });
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
    const { actionErrors, pendingActions } = this.state;

    this.setState({
      actionErrors: ContainerUtil.adjustActionErrors(
        actionErrors,
        actionType,
        null
      ),
      pendingActions: ContainerUtil.adjustPendingActions(
        pendingActions,
        actionType,
        true
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
    const { actionErrors, pendingActions } = this.state;

    this.setState({
      actionErrors: ContainerUtil.adjustActionErrors(
        actionErrors,
        actionType,
        error
      ),
      pendingActions: ContainerUtil.adjustPendingActions(
        pendingActions,
        actionType,
        false
      )
    });

    // Fetch new data if action was successful
    if (!error) {
      this.fetchData();
    }
  }

  clearActionError(actionType) {
    const { actionErrors } = this.state;

    this.setState({
      actionErrors: ContainerUtil.adjustActionErrors(
        actionErrors,
        actionType,
        null
      )
    });
  }

  getModalHandlers() {
    const set = (id, props) => {
      // Set props to be passed into modal
      this.setState({
        modal: Object.assign({}, props, { id })
      });
    };

    return {
      killPodInstances: props =>
        set(ServiceActionItem.KILL_POD_INSTANCES, props)
    };
  }

  getActions() {
    return {
      killPodInstances: this.killPodInstances
    };
  }

  getModals() {
    const { pod } = this.props;
    const modalProps = Object.assign({ pod }, this.state.modal);

    return (
      <TaskModals
        actions={this.getActions()}
        actionErrors={this.state.actionErrors}
        clearError={this.clearActionError}
        onClose={this.handleModalClose}
        pendingActions={this.state.pendingActions}
        modalProps={modalProps}
      />
    );
  }

  render() {
    const { pod } = this.props;

    const historicalInstances = MesosStateStore.getPodHistoricalInstances(pod);
    let instances = PodUtil.mergeHistoricalInstanceList(
      pod.getInstanceList(),
      historicalInstances
    );

    instances = instances.mapItems(function(instance) {
      instance.agent = MesosStateStore.getNodeFromHostname(
        instance.getAgentAddress()
      );

      return instance;
    });

    return (
      <div>
        <PodInstancesView instances={instances} pod={pod} />
        {this.getModals()}
      </div>
    );
  }
}

// Make these modal handlers available via context
// so any child can trigger the opening of modals
PodInstancesContainer.childContextTypes = {
  modalHandlers: PropTypes.shape({
    killPodInstances: PropTypes.func
  })
};

PodInstancesContainer.propTypes = {
  pod: PropTypes.instanceOf(Pod)
};

module.exports = PodInstancesContainer;
