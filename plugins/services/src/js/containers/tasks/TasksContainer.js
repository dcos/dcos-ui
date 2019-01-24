import PropTypes from "prop-types";
import React from "react";

import AppDispatcher from "#SRC/js/events/AppDispatcher";
import ContainerUtil from "#SRC/js/utils/ContainerUtil";
import DSLExpression from "#SRC/js/structs/DSLExpression";
import DSLFilterList from "#SRC/js/structs/DSLFilterList";
import Tree from "#SRC/js/structs/Tree";

import TasksStatusFilter from "#PLUGINS/services/src/js/filters/TasksStatusFilter";
import TasksZoneFilter from "#PLUGINS/services/src/js/filters/TasksZoneFilter";
import TasksRegionFilter from "#PLUGINS/services/src/js/filters/TasksRegionFilter";
import TaskNameTextFilter from "#PLUGINS/services/src/js/filters/TaskNameTextFilter";

import ActionKeys from "../../constants/ActionKeys";
import MarathonActions from "../../events/MarathonActions";
import ServiceActionItem from "../../constants/ServiceActionItem";
import TaskModals from "../../components/modals/TaskModals";
import TasksView from "./TasksView";
import TaskUtil from "../../utils/TaskUtil";

import {
  REQUEST_MARATHON_TASK_KILL_ERROR,
  REQUEST_MARATHON_TASK_KILL_SUCCESS
} from "../../constants/ActionTypes";

const METHODS_TO_BIND = [
  "handleServerAction",
  "handleModalClose",
  "handleExpressionChange",
  "clearActionError",
  "killTasks"
];

class TasksContainer extends React.Component {
  constructor() {
    super(...arguments);

    const filters = new DSLFilterList([
      new TasksStatusFilter(),
      new TaskNameTextFilter()
    ]);
    this.state = {
      actionErrors: {},
      pendingActions: {},
      filterExpression: new DSLExpression(""),
      filters,
      defaultFilterData: { zones: [], regions: [] }
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    this.propsToState(this.props);
  }

  componentDidMount() {
    // Listen for server actions so we can update state immediately
    // on the completion of an API request.
    this.dispatcher = AppDispatcher.register(this.handleServerAction);
  }

  componentWillReceiveProps(nextProps) {
    this.propsToState(nextProps);
  }

  componentWillUnmount() {
    AppDispatcher.unregister(this.dispatcher);
  }

  getChildContext() {
    return {
      modalHandlers: this.getModalHandlers()
    };
  }

  killTasks() {
    this.setPendingAction(ActionKeys.TASK_KILL);

    return MarathonActions.killTasks(...arguments);
  }

  handleServerAction(payload) {
    const { action } = payload;

    switch (action.type) {
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
    this.setState({ modal: {} });
  }

  handleExpressionChange(filterExpression) {
    const { router } = this.context;
    const {
      location: { pathname }
    } = this.props;
    router.push({ pathname, query: { q: filterExpression.value } });

    this.setState({ filterExpression });
  }

  propsToState(props) {
    const {
      defaultFilterData: { regions },
      defaultFilterData: { zones }
    } = this.state;

    let query = props.location.query["q"];

    if (query === undefined) {
      query = "is:active";
    }

    const newZones = Array.from(
      new Set(
        props.tasks.reduce(function(prev, task) {
          const node = TaskUtil.getNode(task);

          if (!node || node.getZoneName() === "N/A") {
            return prev;
          }
          prev.push(node.getZoneName());

          return prev;
        }, [])
      )
    );

    const newRegions = Array.from(
      new Set(
        props.tasks.reduce(function(prev, task) {
          const node = TaskUtil.getNode(task);

          if (!node || node.getRegionName() === "N/A") {
            return prev;
          }
          prev.push(node.getRegionName());

          return prev;
        }, [])
      )
    );

    // If no region/ zones added from props return
    if (
      newRegions.length === regions.length &&
      newRegions.every(region => regions.indexOf(region) !== -1) &&
      newZones.length === zones.length &&
      newZones.every(zone => zones.indexOf(zone) !== -1)
    ) {
      this.setState({
        filterExpression: new DSLExpression(query)
      });

      return;
    }

    const filters = new DSLFilterList([
      new TasksStatusFilter(),
      new TasksZoneFilter(newZones),
      new TasksRegionFilter(newRegions),
      new TaskNameTextFilter()
    ]);

    this.setState({
      filterExpression: new DSLExpression(query),
      filters,
      defaultFilterData: { regions: newRegions, zones: newZones }
    });
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
      killTasks: props => set(ServiceActionItem.KILL_TASKS, props)
    };
  }

  getActions() {
    return {
      killTasks: this.killTasks
    };
  }

  getModals() {
    const modalProps = Object.assign({}, this.state.modal);

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
    const { tasks, params } = this.props;
    const { filterExpression, filters, defaultFilterData } = this.state;

    let filteredTasks = new Tree({ items: tasks });

    if (filterExpression.defined) {
      filteredTasks = filterExpression.filter(
        filters,
        filteredTasks.flattenItems()
      );
    }

    return (
      <div>
        <TasksView
          params={params}
          tasks={filteredTasks.getItems()}
          totalTasks={tasks.length}
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
TasksContainer.childContextTypes = {
  modalHandlers: PropTypes.shape({
    killTasks: PropTypes.func
  })
};

TasksContainer.contextTypes = {
  router: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

TasksContainer.propTypes = {
  tasks: PropTypes.array.isRequired,
  params: PropTypes.object.isRequired
};

module.exports = TasksContainer;
