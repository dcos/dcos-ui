import classNames from "classnames";
import { Tooltip } from "reactjs-components";
import { routerShape } from "react-router";
import PropTypes from "prop-types";
import * as React from "react";
import { withI18n } from "@lingui/react";
import { Trans, t } from "@lingui/macro";
import { Badge, Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import DCOSStore from "#SRC/js/stores/DCOSStore";
import DSLFilterField from "#SRC/js/components/DSLFilterField";

import FilterBar from "#SRC/js/components/FilterBar";
import FilterHeadline from "#SRC/js/components/FilterHeadline";
import StringUtil from "#SRC/js/utils/StringUtil";
import { isSDKService } from "#PLUGINS/services/src/js/utils/ServiceUtil";

import TaskStatusDSLSection from "../../components/dsl/TaskStatusDSLSection";
import TaskZoneDSLSection from "../../components/dsl/TaskZoneDSLSection";
import TaskRegionDSLSection from "../../components/dsl/TaskRegionDSLSection";
import FuzzyTextDSLSection from "../../components/dsl/FuzzyTextDSLSection";

import * as ServiceStatus from "../../constants/ServiceStatus";
import TaskMergeDataUtil from "../../utils/TaskMergeDataUtil";

import TaskTable from "./TaskTable";

const DSL_FORM_SECTIONS = [
  TaskStatusDSLSection,
  TaskZoneDSLSection,
  TaskRegionDSLSection,
  FuzzyTextDSLSection,
];

class TasksView extends React.Component {
  static defaultProps = {
    itemID: "",
    tasks: [],
  };
  static propTypes = {
    params: PropTypes.object.isRequired,
    itemID: PropTypes.string,
    tasks: PropTypes.array,
  };

  state = { checkedItems: {} };

  UNSAFE_componentWillReceiveProps(nextProps) {
    const prevCheckedItems = this.state.checkedItems;
    const checkedItems = {};

    nextProps.tasks.forEach((task) => {
      if (prevCheckedItems[task.id]) {
        checkedItems[task.id] = true;
      }
    });

    this.setState({ checkedItems });
  }
  handleItemCheck = (idsChecked) => {
    const checkedItems = {};
    idsChecked.forEach((id) => {
      checkedItems[id] = true;
    });

    this.setState({ checkedItems });
  };

  handleActionClick(killAction) {
    const { checkedItems } = this.state;

    if (!Object.keys(checkedItems).length) {
      return;
    }

    this.context.modalHandlers.killTasks({
      action: killAction,
      selectedItems: Object.keys(checkedItems),
    });
  }

  getTaskTable(tasks, checkedItems) {
    const { params } = this.props;

    const classSet = classNames({
      "table table-flush table-borderless-outer table-borderless-inner-columns": true,
      "flush-bottom": true,
    });

    return (
      <TaskTable
        checkedItemsMap={checkedItems}
        className={classSet}
        params={params}
        onCheckboxChange={this.handleItemCheck}
        tasks={tasks}
        i18n={this.props.i18n}
      />
    );
  }

  getButtonContent(filterName, count) {
    return (
      <span className="button-align-content badge-container label flush">
        <span className="badge-container-text">
          {StringUtil.capitalize(filterName)}
        </span>
        <Badge>{count || 0}</Badge>
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
    const isDeploying = Object.keys(checkedItems).some((taskId) => {
      const service = DCOSStore.serviceTree.getServiceFromTaskID(taskId);

      return service && service.getServiceStatus() === ServiceStatus.DEPLOYING;
    });

    const isSDK = Object.keys(checkedItems).some((taskId) => {
      const service = DCOSStore.serviceTree.getServiceFromTaskID(taskId);

      return service && isSDKService(service);
    });

    // Only show Stop if a scheduler task isn't selected
    const hasSchedulerTask = tasks.some(
      (task) => task.id in checkedItems && task.isSchedulerTask
    );

    // Using Button's native "disabled" prop prevents onMouseLeave from
    // being correctly called, preventing correct dismissal of the Tooltip.
    //
    // So we overwrite the click handlers manually.
    let handleRestartClick = () => {};
    let handleStopClick = () => {};

    if (!isDeploying && !isSDK) {
      handleRestartClick = this.handleActionClick.bind(this, "restart");
    }

    if (!hasSchedulerTask) {
      handleStopClick = this.handleActionClick.bind(this, "stop");
    }

    const restartButtonClasses = classNames("button button-primary-link", {
      disabled: isDeploying || isSDK,
    });
    const stopButtonClasses = classNames("button button-primary-link", {
      disabled: hasSchedulerTask,
    });

    return (
      <div className="button-collection flush-bottom">
        <Tooltip
          content={
            <Trans render="span">
              Restarting tasks is not supported while the service is deploying.
            </Trans>
          }
          suppress={!isDeploying || isSDK}
          width={200}
          wrapperClassName="button-group"
          wrapText={true}
        >
          <button className={restartButtonClasses} onClick={handleRestartClick}>
            <Icon shape={SystemIcons.Repeat} size={iconSizeXs} />
            <Trans render="span">Restart</Trans>
          </button>
        </Tooltip>
        <Tooltip
          content={
            <Trans render="span">
              Stopping a scheduler task is not supported.
            </Trans>
          }
          suppress={!hasSchedulerTask}
          width={200}
          wrapText={true}
          wrapperClassName="button-group"
        >
          <button className={stopButtonClasses} onClick={handleStopClick}>
            <Icon shape={SystemIcons.CircleClose} size={iconSizeXs} />
            <Trans render="span">Stop</Trans>
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
      defaultFilterData,
    } = this.props;

    const filterExpressionValue = filterExpression.value;

    const hostClasses = classNames("flush-left", {
      "column-medium-5": !filterExpressionValue,
      "column-medium-12": filterExpressionValue,
    });

    return (
      <div className={hostClasses}>
        <DSLFilterField
          filters={filters}
          formSections={DSL_FORM_SECTIONS}
          defaultData={defaultFilterData}
          expression={filterExpression}
          onChange={handleExpressionChange}
        />
      </div>
    );
  }

  render() {
    const { tasks, totalTasks, handleExpressionChange, i18n } = this.props;

    const { checkedItems } = this.state;

    let rightAlignLastNChildren = 0;
    const hasCheckedTasks = Object.keys(checkedItems).length !== 0;

    if (hasCheckedTasks) {
      rightAlignLastNChildren = 1;
    }

    const mergedTasks = TaskMergeDataUtil.mergeTaskData(tasks);

    // L10NTODO: Pluralize
    // We should pluralize FilterHeadline name here using lingui macro instead of
    // doing it manually in FilterHeadline
    return (
      <div className="flex-container-col flex-grow">
        <FilterHeadline
          currentLength={mergedTasks.length}
          name={i18n._(t`task`)}
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
    killTasks: PropTypes.func.isRequired,
  }).isRequired,
};

TasksView.contextTypes = {
  modalHandlers: PropTypes.shape({
    createGroup: PropTypes.func,
  }).isRequired,
  router: routerShape,
};

export default withI18n()(TasksView);
