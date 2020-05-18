import { routerShape } from "react-router";
import PropTypes from "prop-types";
import * as React from "react";

import AppDispatcher from "#SRC/js/events/AppDispatcher";
import ContainerUtil from "#SRC/js/utils/ContainerUtil";
import * as EventTypes from "#SRC/js/constants/EventTypes";
import MesosStateStore from "#SRC/js/stores/MesosStateStore";
import DSLExpression from "#SRC/js/structs/DSLExpression";

import PodInstanceStatusFilter from "#PLUGINS/services/src/js/filters/PodInstanceStatusFilter";
import PodInstancesZoneFilter from "#PLUGINS/services/src/js/filters/PodInstancesZoneFilter";
import PodInstancesRegionFilter from "#PLUGINS/services/src/js/filters/PodInstancesRegionFilter";
import PodInstanceTextFilter from "#PLUGINS/services/src/js/filters/PodInstanceTextFilter";

import ActionKeys from "../../constants/ActionKeys";
import MarathonActions from "../../events/MarathonActions";
import Pod from "../../structs/Pod";
import PodInstancesView from "./PodInstancesView";
import PodUtil from "../../utils/PodUtil";
import { ServiceActionItem } from "../../constants/ServiceActionItem";
import TaskModals from "../../components/modals/TaskModals";
import InstanceUtil from "../../utils/InstanceUtil";
import TaskMergeDataUtil from "../../utils/TaskMergeDataUtil";

import {
  REQUEST_MARATHON_POD_INSTANCE_KILL_ERROR,
  REQUEST_MARATHON_POD_INSTANCE_KILL_SUCCESS,
} from "../../constants/ActionTypes";

class PodInstancesContainer extends React.Component {
  static propTypes = {
    pod: PropTypes.instanceOf(Pod),
  };
  constructor(props) {
    super(props);

    const instances = PodUtil.mergeHistoricalInstanceList(
      props.pod.getInstanceList(),
      MesosStateStore.getPodHistoricalInstances(props.pod)
    ).getItems();

    const nodes = TaskMergeDataUtil.mergeTaskData(instances).map(
      InstanceUtil.getNode
    );

    this.state = {
      actionErrors: {},
      lastUpdate: 0,
      pendingActions: {},
      filterExpression: new DSLExpression(
        props?.location?.query?.q || "is:active"
      ),
      filters: [
        PodInstanceStatusFilter,
        PodInstancesZoneFilter,
        PodInstancesRegionFilter,
        PodInstanceTextFilter,
      ],
      defaultFilterData: {
        regions: nodes.map((i) => i?.getRegionName()).filter(interesting),
        zones: nodes.map((i) => i?.getZoneName()).filter(interesting),
      },
    };
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
  handleExpressionChange = (filterExpression = { value: "" }) => {
    const { router } = this.context;
    const { pathname } = this.props.location;
    router.push({ pathname, query: { q: filterExpression.value } });

    this.setState({ filterExpression });
  };

  getChildContext() {
    return {
      modalHandlers: this.getModalHandlers(),
    };
  }
  killPodInstances = (...args) => {
    this.setPendingAction(ActionKeys.POD_INSTANCES_KILL);

    return MarathonActions.killPodInstances(...args);
  };
  handleMesosStateChange = () => {
    this.setState({
      lastUpdate: Date.now(),
    });
  };
  handleServerAction = (payload) => {
    const { action } = payload;

    switch (action.type) {
      case REQUEST_MARATHON_POD_INSTANCE_KILL_ERROR:
        this.unsetPendingAction(ActionKeys.POD_INSTANCES_KILL, action.data);
        break;
      case REQUEST_MARATHON_POD_INSTANCE_KILL_SUCCESS:
        this.unsetPendingAction(ActionKeys.POD_INSTANCES_KILL);
        break;
    }
  };
  handleModalClose = (key) => {
    if (key) {
      this.clearActionError(key);
    }
    this.setState({ modal: {} });
  };

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
      ),
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
      ),
    });
  }
  clearActionError = (actionType) => {
    const { actionErrors } = this.state;

    this.setState({
      actionErrors: ContainerUtil.adjustActionErrors(
        actionErrors,
        actionType,
        null
      ),
    });
  };

  getModalHandlers() {
    const set = (id, props) => {
      // Set props to be passed into modal
      this.setState({
        modal: {
          ...props,
          id,
        },
      });
    };

    return {
      killPodInstances: (props) =>
        set(ServiceActionItem.KILL_POD_INSTANCES, props),
    };
  }

  getActions() {
    return {
      killPodInstances: this.killPodInstances,
    };
  }

  getModals() {
    const { pod } = this.props;
    const modalProps = {
      pod,
      ...this.state.modal,
    };

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
    const { filterExpression, filters, defaultFilterData } = this.state;
    const historicalInstances = MesosStateStore.getPodHistoricalInstances(pod);

    let instances = PodUtil.mergeHistoricalInstanceList(
      pod.getInstanceList(),
      historicalInstances
    );

    const totalInstances = instances.getItems().length;

    instances = instances.mapItems((instance) => {
      const instanceAgent = MesosStateStore.getNodeFromHostname(
        instance.getAgentAddress()
      );

      if (instanceAgent) {
        instance.agentId = instanceAgent.id;
      }

      return instance;
    });

    if (filterExpression.defined) {
      instances = instances.mapItems((instance) => {
        instance.podSpec = pod.getSpec();

        return instance;
      });
      instances = filterExpression.filter(filters, instances);
    }

    return (
      <div>
        <PodInstancesView
          pod={pod}
          instances={instances.getItems()}
          totalInstances={totalInstances}
          handleExpressionChange={this.handleExpressionChange}
          filters={filters}
          filterExpression={filterExpression}
          defaultFilterData={defaultFilterData}
        />
        {this.getModals()}
      </div>
    );
  }
}

const interesting = (i) => i && i !== "N/A";

// Make these modal handlers available via context
// so any child can trigger the opening of modals
PodInstancesContainer.childContextTypes = {
  modalHandlers: PropTypes.shape({
    killPodInstances: PropTypes.func,
  }),
};

PodInstancesContainer.contextTypes = {
  router: routerShape,
};

export default PodInstancesContainer;
