import PropTypes from "prop-types";
import React from "react";
import { withI18n } from "@lingui/react";
import { t } from "@lingui/macro";

import DSLExpression from "#SRC/js/structs/DSLExpression";
import DSLFilterField from "#SRC/js/components/DSLFilterField";
import FilterBar from "#SRC/js/components/FilterBar";
import FilterHeadline from "#SRC/js/components/FilterHeadline";
import NodesList from "#SRC/js/structs/NodesList";

import ResourceSwitchDropdown from "#SRC/js/components/ResourceSwitchDropdown";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
// @ts-ignore
import ConfigStore from "#SRC/js/stores/ConfigStore";

import FilterByFramework from "../../../../../services/src/js/components/FilterByFramework";

import NodesHealthDSLSection from "../../components/dsl/NodesHealthDSLSection";
import NodesStatusDSLSection from "../../components/dsl/NodesStatusDSLSection";
import NodesTypeDSLSection from "../../components/dsl/NodesTypeDSLSection";
import NodesRegionDSLFilter from "../../components/dsl/NodesRegionDSLFilter";
import NodesZoneDSLFilter from "../../components/dsl/NodesZoneDSLFilter";

import NodesHealthFilter from "../../filters/NodesHealthFilter";
import NodesRegionFilter from "../../filters/NodesRegionFilter";
import NodesStatusFilter from "../../filters/NodesStatusFilter";
import NodesZoneFilter from "../../filters/NodesZoneFilter";
import NodesTextFilter from "../../filters/NodesTextFilter";
import NodesTypeFilter from "../../filters/NodesTypeFilter";

const METHODS_TO_BIND = ["onResetFilter", "onFilterChangeHandler"];

const dslFormSections = () => [
  NodesHealthDSLSection,
  NodesTypeDSLSection,
  ...(hasMaintenance() ? [NodesStatusDSLSection] : []),
  NodesRegionDSLFilter,
  NodesZoneDSLFilter
];

const hasMaintenance = () =>
  findNestedPropertyInObject(
    ConfigStore.get("config"),
    "uiConfiguration.features.maintenance"
  );

class HostsPageContent extends React.PureComponent {
  constructor() {
    super(...arguments);

    const filters = [
      new NodesHealthFilter(),
      new NodesTextFilter(),
      new NodesTypeFilter(),
      ...(hasMaintenance() ? [NodesStatusFilter] : [])
    ];

    this.state = {
      expression: "",
      filterExpression: new DSLExpression(""),
      filters,
      defaultFilterData: { regions: [], zones: [] }
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    this.propsToState(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.propsToState(nextProps);
  }

  onResetFilter() {
    this.props.onResetFilter(...arguments);

    this.setState({
      filterExpression: new DSLExpression("")
    });

    if (this.serviceFilter !== null && this.serviceFilter.dropdown !== null) {
      this.serviceFilter.setDropdownValue("default");
    }
  }

  onFilterChangeHandler(event) {
    this.props.onFilterChange(
      new DSLExpression(event.value),
      this.state.filters
    );
    this.setState({
      expression: event.value,
      filterExpression: new DSLExpression(event.value)
    });
  }

  propsToState(props) {
    const { allHosts } = props;
    const {
      defaultFilterData: { regions },
      defaultFilterData: { zones }
    } = this.state;

    let query = props.location.query["filterExpression"];

    if (query === undefined) {
      query = "";
    } else {
      query = decodeURIComponent(query);
    }

    const newZones = Array.from(
      new Set(
        allHosts.getItems().reduce(function(prev, host) {
          if (host.getZoneName() === "N/A") {
            return prev;
          }
          prev.push(host.getZoneName());

          return prev;
        }, [])
      )
    );

    const newRegions = Array.from(
      new Set(
        allHosts
          .getItems()
          .map(h => h.getRegionName())
          .filter(name => name !== "N/A")
      )
    );

    // If no region/ zones added from props return
    if (
      newRegions.length === regions.length &&
      newRegions.every(region => regions.indexOf(region) !== -1) &&
      newZones.length === zones.length &&
      newZones.every(zone => zones.indexOf(zone) !== -1)
    ) {
      return;
    }

    const filters = [
      new NodesHealthFilter(),
      new NodesTextFilter(),
      new NodesTypeFilter(),
      NodesRegionFilter,
      new NodesZoneFilter(newZones),
      ...(hasMaintenance() ? [NodesStatusFilter] : [])
    ];

    this.props.onFilterChange(new DSLExpression(query), filters);

    this.setState({
      filterExpression: new DSLExpression(query),
      filters,
      defaultFilterData: { regions: newRegions, zones: newZones }
    });
  }

  getFilterBar() {
    const { filterExpression, filters, defaultFilterData } = this.state;

    return (
      <div className="column-12 flush-left">
        <DSLFilterField
          filters={filters}
          formSections={dslFormSections()}
          expression={filterExpression}
          onChange={this.onFilterChangeHandler}
          defaultData={defaultFilterData}
        />
      </div>
    );
  }

  isGridView() {
    return this.props.location.pathname.includes("grid");
  }

  getGridViewResourceSwitch() {
    if (!this.isGridView()) {
      return null;
    }

    return (
      <ResourceSwitchDropdown
        selectedResource={this.props.selectedResource}
        onResourceSelectionChange={this.props.onResourceSelectionChange}
      />
    );
  }

  render() {
    const {
      byServiceFilter,
      children,
      filterInputText,
      filteredNodeCount,
      handleFilterChange,
      hosts,
      isFiltering,
      selectedResource,
      services,
      totalNodeCount,
      viewTypeRadioButtons,
      i18n
    } = this.props;

    return (
      <div className="flex-item-grow-1 flex flex-direction-top-to-bottom">
        {/* L10NTODO: Pluralize
        We should pluralize FilterHeadline name here using lingui macro instead of
        doing it manually in FilterHeadline */}
        <FilterHeadline
          currentLength={filteredNodeCount}
          isFiltering={isFiltering}
          name={i18n._(t`Node`)}
          onReset={this.onResetFilter}
          totalLength={totalNodeCount}
        />
        <FilterBar rightAlignLastNChildren={this.isGridView() ? 2 : 1}>
          {filterInputText}
          {this.getFilterBar()}
          <div className="form-group flush-bottom">
            <FilterByFramework
              byFrameworkFilter={byServiceFilter}
              handleFilterChange={handleFilterChange}
              ref={ref => (this.serviceFilter = ref)}
              frameworks={services}
              totalHostsCount={totalNodeCount}
            />
          </div>
          {this.getGridViewResourceSwitch()}
          {viewTypeRadioButtons}
        </FilterBar>
        {React.cloneElement(children, {
          hosts,
          selectedResource,
          services
        })}
      </div>
    );
  }
}

HostsPageContent.propTypes = {
  byServiceFilter: PropTypes.string,
  filterInputText: PropTypes.node,
  filterItemList: PropTypes.array.isRequired,
  filteredNodeCount: PropTypes.number.isRequired,
  handleFilterChange: PropTypes.func.isRequired,
  hosts: PropTypes.instanceOf(NodesList).isRequired,
  isFiltering: PropTypes.bool,
  onFilterChange: PropTypes.func,
  onResetFilter: PropTypes.func.isRequired,
  onResourceSelectionChange: PropTypes.func.isRequired,
  selectedResource: PropTypes.string.isRequired,
  services: PropTypes.array.isRequired,
  totalNodeCount: PropTypes.number.isRequired,
  viewTypeRadioButtons: PropTypes.node.isRequired
};

module.exports = withI18n()(HostsPageContent);
