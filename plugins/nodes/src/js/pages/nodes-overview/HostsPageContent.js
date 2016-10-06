import PureRenderMixin from 'react-addons-pure-render-mixin';
import React from 'react';
import {RouteHandler} from 'react-router';

import FilterBar from '../../../../../../src/js/components/FilterBar';
import FilterButtons from '../../../../../../src/js/components/FilterButtons';
import FilterByService from '../../../../../services/src/js/components/FilterByService';
import FilterHeadline from '../../../../../../src/js/components/FilterHeadline';
import ResourceBarChart from '../../../../../../src/js/components/charts/ResourceBarChart';

const HEALTH_FILTER_BUTTONS = ['all', 'healthy', 'unhealthy'];

const METHODS_TO_BIND = ['onResetFilter'];

class HostsPageContent extends React.Component {

  constructor() {
    super(...arguments);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate;

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  onResetFilter() {
    this.props.onResetFilter(...arguments);

    if (this.serviceFilter !== null && this.serviceFilter.dropdown !== null) {
      this.serviceFilter.setDropdownValue('default');
    }
  }

  render() {
    const {
      nodeCount,
      totalHostsResources,
      totalResources,
      refreshRate,
      selectedResource,
      onResourceSelectionChange,
      filteredNodeCount,
      isFiltering,
      totalNodeCount,
      filterInputText,
      filterButtonContent,
      onFilterChange,
      filterItemList,
      selectedFilter,
      byServiceFilter,
      handleFilterChange,
      services,
      viewTypeRadioButtons,
      hosts
    } = this.props;
    return (
      <div>
        <ResourceBarChart
          itemCount={nodeCount}
          resources={totalHostsResources}
          totalResources={totalResources}
          refreshRate={refreshRate}
          resourceType="Nodes"
          selectedResource={selectedResource}
          onResourceSelectionChange={onResourceSelectionChange} />
        <FilterHeadline
          currentLength={filteredNodeCount}
          isFiltering={isFiltering}
          name="Node"
          onReset={this.onResetFilter}
          totalLength={totalNodeCount} />
        <FilterBar rightAlignLastNChildren={1}>
          {filterInputText}
          <FilterButtons
            renderButtonContent={filterButtonContent}
            filters={HEALTH_FILTER_BUTTONS}
            filterByKey="title"
            onFilterChange={onFilterChange}
            itemList={filterItemList}
            selectedFilter={selectedFilter} />
          <div className="form-group flush-bottom">
            <FilterByService
              byServiceFilter={byServiceFilter}
              handleFilterChange={handleFilterChange}
              ref={(ref) => this.serviceFilter = ref}
              services={services}
              totalHostsCount={totalNodeCount} />
          </div>
          {viewTypeRadioButtons}
        </FilterBar>
        <RouteHandler
          selectedResource={selectedResource}
          hosts={hosts}
          services={services} />
      </div>
    );
  }
}

HostsPageContent.propTypes = {
  nodeCount: React.PropTypes.number.isRequired,
  totalHostsResources: React.PropTypes.object.isRequired,
  totalResources: React.PropTypes.object.isRequired,
  refreshRate: React.PropTypes.number.isRequired,
  selectedResource: React.PropTypes.string.isRequired,
  onResourceSelectionChange: React.PropTypes.func.isRequired,
  filteredNodeCount: React.PropTypes.number.isRequired,
  isFiltering: React.PropTypes.bool,
  onResetFilter: React.PropTypes.func.isRequired,
  totalNodeCount: React.PropTypes.number.isRequired,
  filterInputText: React.PropTypes.node,
  filterButtonContent: React.PropTypes.func,
  onFilterChange: React.PropTypes.func,
  filterItemList: React.PropTypes.array.isRequired,
  selectedFilter: React.PropTypes.string,
  byServiceFilter: React.PropTypes.string,
  handleFilterChange: React.PropTypes.func.isRequired,
  services: React.PropTypes.array.isRequired,
  viewTypeRadioButtons: React.PropTypes.node.isRequired,
  hosts: React.PropTypes.array.isRequired
};

module.exports = HostsPageContent;
