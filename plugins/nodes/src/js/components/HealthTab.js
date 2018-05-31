import PureRender from "react-addons-pure-render-mixin";
import PropTypes from "prop-types";
import React from "react";
import { hashHistory } from "react-router";
import { Table } from "reactjs-components";

import FilterBar from "#SRC/js/components/FilterBar";
import FilterHeadline from "#SRC/js/components/FilterHeadline";
import FilterInputText from "#SRC/js/components/FilterInputText";
import ResourceTableUtil from "#SRC/js/utils/ResourceTableUtil";
import TableUtil from "#SRC/js/utils/TableUtil";
import UnitHealthDropdown from "#SRC/js/components/UnitHealthDropdown";
import UnitHealthUtil from "#SRC/js/utils/UnitHealthUtil";

const METHODS_TO_BIND = [
  "handleHealthSelection",
  "handleSearchStringChange",
  "renderHealth",
  "renderUnitHealthCheck",
  "resetFilter"
];

class HealthTab extends React.Component {
  constructor() {
    super(...arguments);

    this.shouldComponentUpdate = PureRender.shouldComponentUpdate.bind(this);
    this.state = {
      healthFilter: "all",
      searchString: ""
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleHealthSelection(selectedHealth) {
    this.setState({ healthFilter: selectedHealth.id });
  }

  handleSearchStringChange(searchString = "") {
    this.setState({ searchString });
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{ width: "25%" }} />
        <col />
      </colgroup>
    );
  }

  getColumns() {
    const classNameFn = ResourceTableUtil.getClassName;
    const headings = ResourceTableUtil.renderHeading({
      health: "Health",
      id: "Health Check",
      role: "Role"
    });
    const sortFunction = UnitHealthUtil.getHealthSortFunction;
    const getHealthSorting = TableUtil.getHealthSortingOrder;

    return [
      {
        className: classNameFn,
        headerClassName: classNameFn,
        heading: headings,
        prop: "health",
        render: this.renderHealth,
        sortable: true,
        sortFunction: getHealthSorting
      },
      {
        className: classNameFn,
        headerClassName: classNameFn,
        heading: headings,
        prop: "id",
        render: this.renderUnitHealthCheck,
        sortable: true,
        sortFunction
      }
    ];
  }

  getVisibleData(data, searchString, healthFilter) {
    return data
      .filter({ title: searchString, health: healthFilter })
      .getItems();
  }

  resetFilter() {
    if (this.healthFilter !== null && this.healthFilter.dropdown !== null) {
      this.healthFilter.setDropdownValue("all");
    }

    this.setState({
      searchString: "",
      healthFilter: "all"
    });
  }

  renderHealth(prop, node) {
    const health = node.getHealth();

    return <span className={health.classNames}>{health.title}</span>;
  }

  renderUnitHealthCheck(prop, unit) {
    const healthCheckName = unit.getTitle();
    const { nodeID } = this.props.params;
    const unitNodeID = this.props.node.get("hostname");
    const unitID = unit.get("id");

    return (
      <a
        className="emphasize clickable text-overflow"
        onClick={() => {
          hashHistory.push(`/nodes/${nodeID}/health/${unitNodeID}/${unitID}`);
        }}
        title={healthCheckName}
      >
        {healthCheckName}
      </a>
    );
  }

  render() {
    const { healthFilter, searchString } = this.state;
    const units = this.props.units;
    const visibleData = this.getVisibleData(units, searchString, healthFilter);

    return (
      <div>
        <FilterHeadline
          currentLength={visibleData.length}
          isFiltering={healthFilter !== "all" || searchString !== ""}
          name={"Health Check"}
          onReset={this.resetFilter}
          totalLength={units.getItems().length}
        />
        <FilterBar>
          <FilterInputText
            className="flush-bottom"
            handleFilterChange={this.handleSearchStringChange}
            searchString={searchString}
          />
          <UnitHealthDropdown
            className="button dropdown-toggle text-align-left"
            dropdownMenuClassName="dropdown-menu"
            initialID="all"
            onHealthSelection={this.handleHealthSelection}
            ref={ref => (this.healthFilter = ref)}
          />
        </FilterBar>
        <Table
          className="table table-flush table-borderless-outer
            table-borderless-inner-columns table-hover flush-bottom"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          containerSelector=".gm-scroll-view"
          data={visibleData}
          itemHeight={TableUtil.getRowHeight()}
          sortBy={{ prop: "health", order: "asc" }}
        />
      </div>
    );
  }
}

HealthTab.propTypes = {
  node: PropTypes.object.isRequired,
  units: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired
};

module.exports = HealthTab;
