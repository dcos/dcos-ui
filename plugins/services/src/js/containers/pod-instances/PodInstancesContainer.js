import { routerShape } from "react-router";
import PropTypes from "prop-types";
import React from "react";

import AppDispatcher from "#SRC/js/events/AppDispatcher";
import ContainerUtil from "#SRC/js/utils/ContainerUtil";
import EventTypes from "#SRC/js/constants/EventTypes";
import MesosStateStore from "#SRC/js/stores/MesosStateStore";
import DSLExpression from "#SRC/js/structs/DSLExpression";
import DSLFilterList from "#SRC/js/structs/DSLFilterList";
import Util from "#SRC/js/utils/Util";

import PodInstanceStatusFilter from "#PLUGINS/services/src/js/filters/PodInstanceStatusFilter";
import PodInstancesZoneFilter from "#PLUGINS/services/src/js/filters/PodInstancesZoneFilter";
import PodInstancesRegionFilter from "#PLUGINS/services/src/js/filters/PodInstancesRegionFilter";
import PodInstanceTextFilter from "#PLUGINS/services/src/js/filters/PodInstanceTextFilter";

import ActionKeys from "../../constants/ActionKeys";
import MarathonActions from "../../events/MarathonActions";
import Pod from "../../structs/Pod";
import PodInstancesView from "./PodInstancesView";
import PodUtil from "../../utils/PodUtil";
import ServiceActionItem from "../../constants/ServiceActionItem";
import TaskModals from "../../components/modals/TaskModals";
import InstanceUtil from "../../utils/InstanceUtil";
import TaskMergeDataUtil from "../../utils/TaskMergeDataUtil";

import {
  REQUEST_MARATHON_POD_INSTANCE_KILL_ERROR,
  REQUEST_MARATHON_POD_INSTANCE_KILL_SUCCESS
} from "../../constants/ActionTypes";

const METHODS_TO_BIND = [
  "handleMesosStateChange",
  "handleServerAction",
  "handleModalClose",
  "handleExpressionChange",
  "clearActionError",
  "killPodInstances"
];

class PodInstancesContainer extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      actionErrors: {},
      lastUpdate: 0,
      pendingActions: {},
      filterExpression: new DSLExpression(""),
      filters: new DSLFilterList([
        new PodInstanceStatusFilter(),
        new PodInstanceTextFilter()
      ]),
      defaultFilterData: { zones: [], regions: [] }
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

  componentWillMount() {
    this.setFilterOptions(this.props);
  }

  componentWillUnmount() {
    MesosStateStore.removeChangeListener(
      EventTypes.MESOS_STATE_CHANGE,
      this.handleMesosStateChange
    );

    AppDispatcher.unregister(this.dispatcher);
  }

  handleExpressionChange(filterExpression = { value: "" }) {
    const { router } = this.context;
    const {
      location: { pathname }
    } = this.props;
    router.push({ pathname, query: { q: filterExpression.value } });

    this.setState({ filterExpression });
  }

  setFilterOptions(props) {
    const historicalInstances = MesosStateStore.getPodHistoricalInstances(
      props.pod
    );

    const instances = PodUtil.mergeHistoricalInstanceList(
      props.pod.getInstanceList(),
      historicalInstances
    );

    const {
      defaultFilterData: { regions, zones },
      filterExpression
    } = this.state;

    const query =
      Util.findNestedPropertyInObject(props, "location.query.q") || "is:active";

    const mergedInstances = TaskMergeDataUtil.mergeTaskData(
      instances.getItems()
    );

    const newZones = Object.keys(
      mergedInstances.reduce(function(prev, instance) {
        const node = InstanceUtil.getNode(instance);

        if (!node || node.getZoneName() === "N/A") {
          return prev;
        }
        prev[node.getZoneName()] = "";

        return prev;
      }, {})
    );

    const newRegions = Object.keys(
      mergedInstances.reduce(function(prev, instance) {
        const node = InstanceUtil.getNode(instance);

        if (!node || node.getRegionName() === "N/A") {
          return prev;
        }
        prev[node.getRegionName()] = "";

        return prev;
      }, {})
    );

    // If no region/ zones added from props return
    if (
      newRegions.length === regions.length &&
      newRegions.every(region => regions.indexOf(region) !== -1) &&
      newZones.length === zones.length &&
      newZones.every(zone => zones.indexOf(zone) !== -1) &&
      filterExpression.value === query
    ) {
      return;
    }

    const filters = new DSLFilterList([
      new PodInstanceStatusFilter(),
      new PodInstancesZoneFilter(newZones),
      new PodInstancesRegionFilter(newRegions),
      new PodInstanceTextFilter()
    ]);

    this.setState({
      filterExpression: new DSLExpression(query),
      filters,
      defaultFilterData: { regions: newRegions, zones: newZones }
    });
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
    const { filterExpression, filters, defaultFilterData } = this.state;
    const historicalInstances = MesosStateStore.getPodHistoricalInstances(pod);

    let instances = PodUtil.mergeHistoricalInstanceList(
      pod.getInstanceList(),
      historicalInstances
    );

    const totalInstances = instances.getItems().length;

    instances = instances.mapItems(function(instance) {
      const instanceAgent = MesosStateStore.getNodeFromHostname(
        instance.getAgentAddress()
      );

      if (instanceAgent) {
        instance.agentId = instanceAgent.id;
      }

      return instance;
    });

    if (filterExpression.defined) {
      instances = instances.mapItems(function(instance) {
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

// Make these modal handlers available via context
// so any child can trigger the opening of modals
PodInstancesContainer.childContextTypes = {
  modalHandlers: PropTypes.shape({
    killPodInstances: PropTypes.func
  })
};

PodInstancesContainer.contextTypes = {
  router: routerShape
};

PodInstancesContainer.propTypes = {
  pod: PropTypes.instanceOf(Pod)
};

module.exports = PodInstancesContainer;
