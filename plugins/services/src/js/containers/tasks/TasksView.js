import classNames from "classnames";
import mixin from "reactjs-mixin";
import { Tooltip } from "reactjs-components";
import React from "react";

import FilterBar from "../../../../../../src/js/components/FilterBar";
import FilterButtons from "../../../../../../src/js/components/FilterButtons";
import FilterHeadline from "../../../../../../src/js/components/FilterHeadline";
import FilterInputText
  from "../../../../../../src/js/components/FilterInputText";
import GraphQLTaskUtil from "../../utils/GraphQLTaskUtil";
import Icon from "../../../../../../src/js/components/Icon";
import SaveStateMixin from "../../../../../../src/js/mixins/SaveStateMixin";
import Service from "../../structs/Service";
import ServiceStatusTypes from "../../constants/ServiceStatusTypes";
import StringUtil from "../../../../../../src/js/utils/StringUtil";
import TaskStates from "../../constants/TaskStates";
import TaskTable from "./TaskTable";

const METHODS_TO_BIND = [
  "handleItemCheck",
  "handleSearchStringChange",
  "handleStatusFilterChange",
  "resetFilter"
];

const STATUS_FILTER_BUTTONS = ["all", "active", "completed"];

class TasksView extends mixin(SaveStateMixin) {
  constructor() {
    super();

    this.state = {
      checkedItems: {},
      searchString: "",
      filterByStatus: "active"
    };

    this.saveState_properties = ["filterByStatus"];

    METHODS_TO_BIND.forEach(function(method) {
      this[method] = this[method].bind(this);
    }, this);
  }

  componentWillMount() {
    this.saveState_key = `tasksView#${this.props.itemID}`;
    super.componentWillMount();
  }

  componentWillReceiveProps(nextProps) {
    const prevCheckedItems = this.state.checkedItems;
    const checkedItems = {};

    nextProps.tasks.forEach(function(task) {
      if (prevCheckedItems[task.id]) {
        checkedItems[task.id] = true;
      }
    });

    this.setState({ checkedItems });
  }

  handleItemCheck(idsChecked) {
    const checkedItems = {};
    idsChecked.forEach(function(id) {
      checkedItems[id] = true;
    });

    this.setState({ checkedItems });
  }

  handleActionClick(killAction) {
    const { checkedItems } = this.state;

    if (!Object.keys(checkedItems).length) {
      return;
    }

    this.context.modalHandlers.killTasks({
      action: killAction,
      selectedItems: Object.keys(checkedItems)
    });
  }

  handleSearchStringChange(searchString = "") {
    this.setState({ searchString });
  }

  handleStatusFilterChange(filterByStatus) {
    this.setState({ filterByStatus });
  }

  getFilteredTasks() {
    let { tasks } = this.props;
    const { filterByStatus, searchString } = this.state;

    if (searchString !== "") {
      tasks = StringUtil.filterByString(tasks, "id", searchString);
    }

    if (filterByStatus !== "all") {
      tasks = tasks.filter(function(task) {
        return TaskStates[task.state].stateTypes.includes(filterByStatus);
      });
    }

    return tasks;
  }

  getTaskTable(tasks, checkedItems) {
    const { inverseStyle, params } = this.props;

    const classSet = classNames({
      "table table-borderless-outer table-borderless-inner-columns": true,
      "flush-bottom": true,
      inverse: inverseStyle
    });

    return (
      <TaskTable
        checkedItemsMap={checkedItems}
        className={classSet}
        params={params}
        onCheckboxChange={this.handleItemCheck}
        tasks={tasks}
      />
    );
  }

  resetFilter() {
    this.setState({
      searchString: "",
      filterByStatus: "all"
    });
  }

  getButtonContent(filterName, count) {
    return (
      <span className="button-align-content badge-container label flush">
        <span className="badge-container-text">
          {StringUtil.capitalize(filterName)}
        </span>
        <span className="badge badge-rounded">{count || 0}</span>
      </span>
    );
  }

  getStopButtons() {
    const { service, tasks } = this.props;
    const { checkedItems } = this.state;

    if (!Object.keys(checkedItems).length) {
      return null;
    }

    // Only allow restarting the task if the service isn't deploying.
    const isDeploying =
      service.getServiceStatus().key === ServiceStatusTypes.DEPLOYING;
    // Only show Stop if a scheduler task isn't selected
    const hasSchedulerTask = tasks.some(
      task => task.id in checkedItems && task.schedulerTask
    );

    // Using Button's native "disabled" prop prevents onMouseLeave from
    // being correctly called, preventing correct dismissal of the Tooltip.
    //
    // So we overwrite the click handlers manually.
    let handleRestartClick = function() {};
    let handleStopClick = function() {};

    if (!isDeploying) {
      handleRestartClick = this.handleActionClick.bind(this, "restart");
    }

    if (!hasSchedulerTask) {
      handleStopClick = this.handleActionClick.bind(this, "stop");
    }

    const restartButtonClasses = classNames("button button-link", {
      disabled: isDeploying
    });
    const stopButtonClasses = classNames("button button-link", {
      disabled: hasSchedulerTask
    });

    return (
      <div className="button-collection flush-bottom">
        <Tooltip
          content="Restarting tasks is not supported while the service is deploying."
          suppress={!isDeploying}
          width={200}
          wrapperClassName="button-group"
          wrapText={true}
        >
          <button className={restartButtonClasses} onClick={handleRestartClick}>
            <Icon id="repeat" size="mini" />
            <span>Restart</span>
          </button>
        </Tooltip>
        <Tooltip
          content="Stopping a scheduler task is not supported."
          suppress={!hasSchedulerTask}
          width={200}
          wrapText={true}
          wrapperClassName="button-group"
        >
          <button className={stopButtonClasses} onClick={handleStopClick}>
            <Icon id="circle-close" size="mini" />
            <span>Stop</span>
          </button>
        </Tooltip>
      </div>
    );
  }

  render() {
    const { inverseStyle, tasks } = this.props;
    const { checkedItems, filterByStatus, searchString } = this.state;
    let filteredTasks = this.getFilteredTasks();

    // Get task states based on TaskStates types
    const taskStates = tasks.map(function(task) {
      const { stateTypes } = TaskStates[task.state];

      return stateTypes.find(function(state) {
        return state === "active" || state === "completed";
      });
    });

    let rightAlignLastNChildren = 0;
    const hasCheckedTasks = Object.keys(checkedItems).length !== 0;

    if (hasCheckedTasks) {
      rightAlignLastNChildren = 1;
    }

    filteredTasks = filteredTasks.map(GraphQLTaskUtil.mergeData);

    return (
      <div className="flex-container-col flex-grow">
        <FilterHeadline
          currentLength={filteredTasks.length}
          inverseStyle={inverseStyle}
          isFiltering={filterByStatus !== "all" || searchString !== ""}
          onReset={this.resetFilter}
          name={"task"}
          totalLength={tasks.length}
        />
        <FilterBar rightAlignLastNChildren={rightAlignLastNChildren}>
          <FilterInputText
            className="flush-bottom"
            searchString={searchString}
            handleFilterChange={this.handleSearchStringChange}
            inverseStyle={inverseStyle}
          />
          <FilterButtons
            renderButtonContent={this.getButtonContent}
            filters={STATUS_FILTER_BUTTONS}
            onFilterChange={this.handleStatusFilterChange}
            inverseStyle={inverseStyle}
            itemList={taskStates}
            selectedFilter={filterByStatus}
          />
          {this.getStopButtons()}
        </FilterBar>
        {this.getTaskTable(filteredTasks, checkedItems)}
      </div>
    );
  }
}

TasksView.contextTypes = {
  modalHandlers: React.PropTypes.shape({
    killTasks: React.PropTypes.func.isRequired
  }).isRequired
};

TasksView.defaultProps = {
  inverseStyle: false,
  itemID: "",
  tasks: []
};

TasksView.propTypes = {
  params: React.PropTypes.object.isRequired,
  inverseStyle: React.PropTypes.bool,
  itemID: React.PropTypes.string,
  service: React.PropTypes.instanceOf(Service).isRequired,
  tasks: React.PropTypes.array
};

module.exports = TasksView;
