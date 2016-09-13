import React from 'react';

import Pod from '../structs/Pod';
import PodInstancesTable from './PodInstancesTable';
import PodViewFilter from './PodViewFilter';

class PodDetailInstancesView extends React.Component {

  constructor() {
    super(...arguments);

    this.setState({
      filter: {
        text: '',
        status: ''
      }
    });

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
        <PodViewFilter
          filter={filter}
          inverseStyle={true}
          items={filteredTextItems.getItems()}
          onFilterChange={this.handleFilterChange}
          statusChoices={['all', 'active', 'completed']}
          statusMapper={this.getInstanceFilterStatus}
          />
        <PodInstancesTable
          filterText={filter.text}
          items={filteredItems}
          inverseStyle={true}
          pod={this.props.pod}
          />
      </div>
    );
  }
}

PodDetailInstancesView.contextTypes = {
  router: React.PropTypes.func
};

PodDetailInstancesView.propTypes = {
  pod: React.PropTypes.instanceOf(Pod)
};

module.exports = PodDetailInstancesView;
