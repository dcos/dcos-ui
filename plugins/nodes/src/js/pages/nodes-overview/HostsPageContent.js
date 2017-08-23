/* @flow */
import PureRender from "react-addons-pure-render-mixin";
import React from "react";

import FilterBar from "#SRC/js/components/FilterBar";
import FilterButtons from "#SRC/js/components/FilterButtons";
import FilterHeadline from "#SRC/js/components/FilterHeadline";
import ResourceBarChart from "#SRC/js/components/charts/ResourceBarChart";

import FilterByService
  from "../../../../../services/src/js/components/FilterByService";

const HEALTH_FILTER_BUTTONS = ["all", "healthy", "unhealthy"];

const METHODS_TO_BIND = ["onResetFilter"];

type Props = {
  byServiceFilter?: string,
  filterButtonContent?: Function,
  filterInputText?: number | string | React.Element | Array<any>,
  filterItemList: Array<any>,
  filteredNodeCount: number,
  handleFilterChange: Function,
  hosts: Array<any>,
  isFiltering?: boolean,
  nodeCount: number,
  onFilterChange?: Function,
  onResetFilter: Function,
  onResourceSelectionChange: Function,
  refreshRate: number,
  selectedFilter?: string,
  selectedResource: string,
  services: Array<any>,
  totalHostsResources: Object,
  totalNodeCount: number,
  totalResources: Object,
  viewTypeRadioButtons: number | string | React.Element | Array<any>,
};

class HostsPageContent extends React.Component {
  constructor() {
    super(...arguments);
    this.shouldComponentUpdate = PureRender.shouldComponentUpdate.bind(this);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }



  onResetFilter() {
    this.props.onResetFilter(...arguments);

    if (this.serviceFilter !== null && this.serviceFilter.dropdown !== null) {
      this.serviceFilter.setDropdownValue("default");
    }
  }

  render() {
    const {
      byServiceFilter,
      children,
      filterButtonContent,
      filterInputText,
      filterItemList,
      filteredNodeCount,
      handleFilterChange,
      hosts,
      isFiltering,
      nodeCount,
      onFilterChange,
      onResourceSelectionChange,
      refreshRate,
      selectedFilter,
      selectedResource,
      services,
      totalHostsResources,
      totalNodeCount,
      totalResources,
      viewTypeRadioButtons
    } = this.props;

    return (
      <div>
        <ResourceBarChart
          itemCount={nodeCount}
          onResourceSelectionChange={onResourceSelectionChange}
          refreshRate={refreshRate}
          resourceType="Nodes"
          resources={totalHostsResources}
          selectedResource={selectedResource}
          totalResources={totalResources}
        />
        <FilterHeadline
          currentLength={filteredNodeCount}
          isFiltering={isFiltering}
          name="Node"
          onReset={this.onResetFilter}
          totalLength={totalNodeCount}
        />
        <FilterBar rightAlignLastNChildren={1}>
          {filterInputText}
          <FilterButtons
            filterByKey="title"
            filters={HEALTH_FILTER_BUTTONS}
            itemList={filterItemList}
            onFilterChange={onFilterChange}
            renderButtonContent={filterButtonContent}
            selectedFilter={selectedFilter}
          />
          <div className="form-group flush-bottom">
            <FilterByService
              byServiceFilter={byServiceFilter}
              handleFilterChange={handleFilterChange}
              ref={ref => (this.serviceFilter = ref)}
              services={services}
              totalHostsCount={totalNodeCount}
            />
          </div>
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

module.exports = HostsPageContent;
