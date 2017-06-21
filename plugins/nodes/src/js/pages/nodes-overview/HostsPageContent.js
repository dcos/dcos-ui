import PureRender from "react-addons-pure-render-mixin";
import React from "react";

import FilterBar from "../../../../../../src/js/components/FilterBar";
import FilterButtons from "../../../../../../src/js/components/FilterButtons";
import FilterByService
  from "../../../../../services/src/js/components/FilterByService";
import FilterHeadline from "../../../../../../src/js/components/FilterHeadline";
import ResourceBarChart
  from "../../../../../../src/js/components/charts/ResourceBarChart";

const HEALTH_FILTER_BUTTONS = ["all", "healthy", "unhealthy"];

const METHODS_TO_BIND = ["onResetFilter"];

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

HostsPageContent.propTypes = {
  byServiceFilter: React.PropTypes.string,
  filterButtonContent: React.PropTypes.func,
  filterInputText: React.PropTypes.node,
  filterItemList: React.PropTypes.array.isRequired,
  filteredNodeCount: React.PropTypes.number.isRequired,
  handleFilterChange: React.PropTypes.func.isRequired,
  hosts: React.PropTypes.array.isRequired,
  isFiltering: React.PropTypes.bool,
  nodeCount: React.PropTypes.number.isRequired,
  onFilterChange: React.PropTypes.func,
  onResetFilter: React.PropTypes.func.isRequired,
  onResourceSelectionChange: React.PropTypes.func.isRequired,
  refreshRate: React.PropTypes.number.isRequired,
  selectedFilter: React.PropTypes.string,
  selectedResource: React.PropTypes.string.isRequired,
  services: React.PropTypes.array.isRequired,
  totalHostsResources: React.PropTypes.object.isRequired,
  totalNodeCount: React.PropTypes.number.isRequired,
  totalResources: React.PropTypes.object.isRequired,
  viewTypeRadioButtons: React.PropTypes.node.isRequired
};

module.exports = HostsPageContent;
