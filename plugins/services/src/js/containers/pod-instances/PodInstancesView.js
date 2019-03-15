import PropTypes from "prop-types";
import React from "react";
import { routerShape } from "react-router";
import classNames from "classnames";
import { Trans, t } from "@lingui/macro";
import { withI18n } from "@lingui/react";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import DSLFilterField from "#SRC/js/components/DSLFilterField";
import DSLFilterList from "#SRC/js/structs/DSLFilterList";
import DSLFilterTypes from "#SRC/js/constants/DSLFilterTypes";

import FilterHeadline from "#SRC/js/components/FilterHeadline";
import FilterBar from "#SRC/js/components/FilterBar";
import Pod from "../../structs/Pod";
import PodInstancesTable from "./PodInstancesTable";
import TaskMergeDataUtil from "../../utils/TaskMergeDataUtil";

import TaskStatusDSLSection from "../../components/dsl/TaskStatusDSLSection";
import TaskZoneDSLSection from "../../components/dsl/TaskZoneDSLSection";
import TaskRegionDSLSection from "../../components/dsl/TaskRegionDSLSection";
import FuzzyTextDSLSection from "../../components/dsl/FuzzyTextDSLSection";

const METHODS_TO_BIND = ["handleKillClick", "handleSelectionChange"];

class PodInstancesView extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      selectedItems: []
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  getKillButtons() {
    if (!this.state.selectedItems.length) {
      return null;
    }

    return (
      <div className="button-collection flush-bottom">
        <div
          className="button button-primary-link"
          onClick={this.handleKillClick}
        >
          <Icon shape={SystemIcons.Repeat} size={iconSizeXs} />
          <Trans render="span">Restart</Trans>
        </div>
      </div>
    );
  }

  handleKillClick() {
    const { selectedItems } = this.state;

    if (!selectedItems.length) {
      return;
    }

    this.context.modalHandlers.killPodInstances({
      action: "restart",
      selectedItems
    });
  }

  handleSelectionChange(selectedItems) {
    this.setState({ selectedItems });
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
      instances,
      totalInstances,
      handleExpressionChange,
      filterExpression,
      i18n
    } = this.props;

    const { selectedItems } = this.state;

    let rightAlignLastNChildren = 0;
    let filterTextExpression = [];
    let filterText = "";

    if (filterExpression.ast) {
      filterTextExpression = filterExpression.ast.children.filter(function(
        filter
      ) {
        return filter.filterType === DSLFilterTypes.FUZZY;
      });

      let filterParams = { text: "" };
      if (filterTextExpression.length > 0) {
        filterParams = filterTextExpression[0].filterParams;
      } else if (
        filterExpression.ast.filterParams &&
        !filterExpression.ast.filterParams.label
      ) {
        filterParams = filterExpression.ast.filterParams;
      }
      filterText = filterParams.text;
    }

    const hasCheckedTasks = Object.keys(selectedItems).length !== 0;

    if (hasCheckedTasks) {
      rightAlignLastNChildren = 1;
    }

    const mergedTasks = TaskMergeDataUtil.mergeTaskData(instances);

    // L10NTODO: Pluralize
    // We should pluralize FilterHeadline name here using lingui macro instead of
    // doing it manually in FilterHeadline
    return (
      <div className="flex-container-col flex-grow">
        <FilterHeadline
          currentLength={mergedTasks.length}
          inverseStyle={inverseStyle}
          name={i18n._(t`Instance`)}
          totalLength={totalInstances}
          onReset={handleExpressionChange}
        />
        <div className="filter-tasks-bar">
          <FilterBar rightAlignLastNChildren={rightAlignLastNChildren}>
            {this.getFilterBar()}
            {this.getKillButtons()}
          </FilterBar>
        </div>
        <PodInstancesTable
          instances={mergedTasks}
          onSelectionChange={this.handleSelectionChange}
          pod={this.props.pod}
          filterText={filterText}
        />
      </div>
    );
  }
}

PodInstancesView.contextTypes = {
  modalHandlers: PropTypes.shape({
    killPodInstances: PropTypes.func.isRequired
  }).isRequired,
  router: routerShape
};

PodInstancesView.defaultProps = {
  inverseStyle: false,
  instances: [],
  totalInstances: 0,
  handleExpressionChange() {}
};

PodInstancesView.propTypes = {
  inverseStyle: PropTypes.bool,
  instances: PropTypes.instanceOf(Array).isRequired,
  pod: PropTypes.instanceOf(Pod).isRequired,
  totalInstances: PropTypes.number.isRequired,
  handleExpressionChange: PropTypes.func.isRequired,
  filters: PropTypes.instanceOf(DSLFilterList)
};

export default withI18n()(PodInstancesView);
