import React from 'react';

import FilterHeadline from './FilterHeadline';
import Pod from '../structs/Pod';
import PodInstancesTable from './PodInstancesTable';
import PodInstanceStatus from '../constants/PodInstanceStatus';
import PodUtil from '../utils/PodUtil';
import PodViewFilter from './PodViewFilter';

const METHODS_TO_BIND = [
  'handleFilterChange',
  'handleFilterReset'
];

class PodInstancesView extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      filter: {
        text: '',
        status: 'active'
      }
    };

    METHODS_TO_BIND.forEach(function (method) {
      this[method] = this[method].bind(this);
    }, this);
  }

  getInstanceFilterStatus(instance) {
    let status = instance.getInstanceStatus();
    switch (status) {
      case PodInstanceStatus.STAGED:
        return 'staged';

      case PodInstanceStatus.HEALTHY:
      case PodInstanceStatus.UNHEALTHY:
      case PodInstanceStatus.RUNNING:
        return 'active';

      case PodInstanceStatus.KILLED:
        return 'completed';

      default:
        return '';
    }
  }

  handleFilterChange(filter) {
    this.setState({filter});
  }

  handleFilterReset() {
    this.setState({
      filter: {
        text: '',
        status: 'all'
      }
    });
  }

  render() {
    var {pod} = this.props;
    var {filter} = this.state;
    let allItems = pod.getInstanceList();
    let filteredTextItems = allItems;
    let filteredItems = allItems;

    if (filter.text) {
      filteredTextItems = allItems.filterItems((instance) => {
        return PodUtil.isInstanceOrChildrenMatchingText(instance, filter.text);
      });
      filteredItems = filteredTextItems;
    }

    if (filter.status && (filter.status !== 'all')) {
      filteredItems = filteredTextItems.filterItems((instance) => {
        return this.getInstanceFilterStatus(instance) === filter.status;
      });
    }

    return (
      <div>
        <FilterHeadline
          currentLength={filteredItems.getItems().length}
          inverseStyle={true}
          isFiltering={filter.text || (filter.status !== 'all')}
          name="Instance"
          onReset={this.handleFilterReset}
          totalLength={allItems.getItems().length}
          />
        <PodViewFilter
          filter={filter}
          inverseStyle={true}
          items={filteredTextItems.getItems()}
          onFilterChange={this.handleFilterChange}
          statusChoices={['all', 'active', 'completed']}
          statusMapper={this.getInstanceFilterStatus} />
        <PodInstancesTable
          filterText={filter.text}
          instances={filteredItems}
          inverseStyle={true}
          pod={this.props.pod} />
      </div>
    );
  }
}

PodInstancesView.contextTypes = {
  router: React.PropTypes.func
};

PodInstancesView.propTypes = {
  pod: React.PropTypes.instanceOf(Pod)
};

module.exports = PodInstancesView;
