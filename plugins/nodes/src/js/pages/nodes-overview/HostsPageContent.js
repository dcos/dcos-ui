import PureRender from "react-addons-pure-render-mixin";
import React from "react";

import DSLExpression from "#SRC/js/structs/DSLExpression";
import DSLFilterList from "#SRC/js/structs/DSLFilterList";
import DSLFilterField from "#SRC/js/components/DSLFilterField";
import FilterBar from "#SRC/js/components/FilterBar";
import FilterHeadline from "#SRC/js/components/FilterHeadline";
import ResourceBarChart from "#SRC/js/components/charts/ResourceBarChart";

import FilterByService
  from "../../../../../services/src/js/components/FilterByService";

import NodesHealthDSLSection from "../../components/dsl/NodesHealthDSLSection";

import NodesHealthFilter from "../../filters/NodesHealthFilter";

const SERVICE_FILTERS = new DSLFilterList([new NodesHealthFilter()]);

const METHODS_TO_BIND = ["onResetFilter"];

class HostsPageContent extends React.Component {
  constructor() {
    super(...arguments);
    this.shouldComponentUpdate = PureRender.shouldComponentUpdate.bind(this);

    this.state = {
      expression: "",
      filterExpression: new DSLExpression("")
    };

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

  getFilterBar() {
    // const { filters, onFilterExpressionChange } = this.props;

    const filters = SERVICE_FILTERS;
    const filterExpression = this.state.filterExpression;

    return (
      <div className="column-12">
        <DSLFilterField
          filters={filters}
          formSections={[NodesHealthDSLSection]}
          expression={filterExpression}
          onChange={function(event) {
            this.props.onFilterChange(event);
            this.setState({
              expression: event.value,
              filterExpression: new DSLExpression(event.value)
            });
          }.bind(this)}
        />
      </div>
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
      nodeCount,
      onResourceSelectionChange,
      refreshRate,
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
          {this.getFilterBar()}
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
  hosts: React.PropTypes.object.isRequired,
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
