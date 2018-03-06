import classNames from "classnames";
import mixin from "reactjs-mixin";
import { Tooltip } from "reactjs-components";
import { routerShape } from "react-router";
import PropTypes from "prop-types";
import React from "react";

import DCOSStore from "#SRC/js/stores/DCOSStore";
import DSLFilterField from "#SRC/js/components/DSLFilterField";

import FilterBar from "#SRC/js/components/FilterBar";
import FilterHeadline from "#SRC/js/components/FilterHeadline";
import Icon from "#SRC/js/components/Icon";
import SaveStateMixin from "#SRC/js/mixins/SaveStateMixin";
import StringUtil from "#SRC/js/utils/StringUtil";
import { isSDKService } from "#SRC/js/utils/ServiceUtil";

import TaskStatusDSLSection from "../../components/dsl/TaskStatusDSLSection";
import TaskZoneDSLSection from "../../components/dsl/TaskZoneDSLSection";
import TaskRegionDSLSection from "../../components/dsl/TaskRegionDSLSection";
import FuzzyTextDSLSection from "../../components/dsl/FuzzyTextDSLSection";

import ServiceStatusTypes from "../../constants/ServiceStatusTypes";
import TaskMergeDataUtil from "../../utils/TaskMergeDataUtil";

import TaskTable from "./TaskTable";

const METHODS_TO_BIND = ["handleItemCheck"];

class TasksView extends mixin(SaveStateMixin) {
  constructor() {
    super();

    this.state = {
      checkedItems: {}
    };

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

  getTaskTable(tasks, checkedItems) {
    const { inverseStyle, params } = this.props;

    const classSet = classNames({
      "table table-flush table-borderless-outer table-borderless-inner-columns": true,
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

  getButtonContent(filterName, count) {
    return (
      <span className="button-align-content badge-container label flush">
        <span className="badge-container-text">
          {StringUtil.capitalize(filterName)}
        </span>
        <span className="badge">{count || 0}</span>
      </span>
    );
  }

  getStopButtons() {
    const { tasks } = this.props;
    const { checkedItems } = this.state;

    if (!Object.keys(checkedItems).length) {
      return null;
    }

    // Only allow restarting the task if the service isn't deploying.
    const isDeploying = Object.keys(checkedItems).some(function(taskId) {
      const service = DCOSStore.serviceTree.getServiceFromTaskID(taskId);

      return (
        service &&
        service.getServiceStatus().key === ServiceStatusTypes.DEPLOYING
      );
    });

    const isSDK = Object.keys(checkedItems).some(function(taskId) {
      const service = DCOSStore.serviceTree.getServiceFromTaskID(taskId);

      return service && isSDKService(service);
    });

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

    if (!isDeploying && !isSDK) {
      handleRestartClick = this.handleActionClick.bind(this, "restart");
    }

    if (!hasSchedulerTask) {
      handleStopClick = this.handleActionClick.bind(this, "stop");
    }

    const restartButtonClasses = classNames("button button-primary-link", {
      disabled: isDeploying || isSDK
    });
    const stopButtonClasses = classNames("button button-primary-link", {
      disabled: hasSchedulerTask
    });

    return (
      <div className="button-collection flush-bottom">
        <Tooltip
          content="Restarting tasks is not supported while the service is deploying."
          suppress={!isDeploying || isSDK}
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

  getFilterBar() {
    const {
      filters,
      filterExpression,
      handleExpressionChange,
      defaultFilterData
    } = this.props;

    const filterExpressionValue = filterExpression.value;

    const hostClasses = classNames({
      "column-medium-5": !filterExpressionValue,
      "column-medium-12": filterExpressionValue
    });

    return (
      <div className={hostClasses}>
        <DSLFilterField
          filters={filters}
          formSections={[
            TaskStatusDSLSection,
            TaskZoneDSLSection,
            TaskRegionDSLSection,
            FuzzyTextDSLSection
          ]}
          defaultData={defaultFilterData}
          expression={filterExpression}
          onChange={handleExpressionChange}
        />
      </div>
    );
  }

  render() {
    const {
      inverseStyle,
      tasks,
      totalTasks,
      handleExpressionChange
    } = this.props;

    const { checkedItems } = this.state;

    let rightAlignLastNChildren = 0;
    const hasCheckedTasks = Object.keys(checkedItems).length !== 0;

    if (hasCheckedTasks) {
      rightAlignLastNChildren = 1;
    }

    const mergedTasks = tasks.map(TaskMergeDataUtil.mergeData);

    return (
      <div className="flex-container-col flex-grow">
        <FilterHeadline
          currentLength={mergedTasks.length}
          inverseStyle={inverseStyle}
          name={"task"}
          totalLength={totalTasks}
          onReset={() => handleExpressionChange({ value: "" })}
        />
        <div className="filter-tasks-bar">
          <FilterBar rightAlignLastNChildren={rightAlignLastNChildren}>
            {this.getFilterBar()}
            {this.getStopButtons()}
          </FilterBar>
        </div>
        {this.getTaskTable(mergedTasks, checkedItems)}
      </div>
    );
  }
}

TasksView.contextTypes = {
  modalHandlers: PropTypes.shape({
    killTasks: PropTypes.func.isRequired
  }).isRequired
};

TasksView.defaultProps = {
  inverseStyle: false,
  itemID: "",
  tasks: []
};

TasksView.propTypes = {
  params: PropTypes.object.isRequired,
  inverseStyle: PropTypes.bool,
  itemID: PropTypes.string,
  tasks: PropTypes.array
};

TasksView.contextTypes = {
  modalHandlers: PropTypes.shape({
    createGroup: PropTypes.func
  }).isRequired,
  router: routerShape
};

module.exports = TasksView;
