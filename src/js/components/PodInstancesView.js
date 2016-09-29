import React from 'react';

import FilterHeadline from './FilterHeadline';
import KillPodInstanceModal from './modals/KillPodInstanceModal';
import Pod from '../structs/Pod';
import PodInstancesTable from './PodInstancesTable';
import PodInstanceStatus from '../constants/PodInstanceStatus';
import PodUtil from '../utils/PodUtil';
import PodViewFilter from './PodViewFilter';

const METHODS_TO_BIND = [
  'handleCloseKillDialog',
  'handleFilterChange',
  'handleFilterReset',
  'handleSelectionChange',
  'handleKillClick',
  'handleKillAndScaleClick'
];

class PodInstancesView extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      filter: {
        text: '',
        status: 'active'
      },
      selectedItems: [],
      activeKillDialogAction: ''
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

  getKillButtons() {
    if (!this.state.selectedItems.length) {
      return null;
    }

    return (
      <div className="button-collection flush-bottom">
        <div
          className="button button-stroke button-danger"
          onClick={this.handleKillAndScaleClick}>
          Kill and Scale
        </div>
        <div
          className="button button-stroke button-danger"
          onClick={this.handleKillClick}>
          Kill
        </div>
      </div>
    );
  }

  handleCloseKillDialog() {
    this.setState({
      activeKillDialogAction: ''
    });
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

  handleKillClick() {
    this.setState({
      activeKillDialogAction: 'kill'
    });
  }

  handleKillAndScaleClick() {
    this.setState({
      activeKillDialogAction: 'killAndScale'
    });
  }

  handleSelectionChange(selectedItems) {
    this.setState({selectedItems});
  }

  render() {
    var {pod} = this.props;
    var {activeKillDialogAction, filter, selectedItems} = this.state;
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
          name="Pod"
          onReset={this.handleFilterReset}
          totalLength={allItems.getItems().length}
          />
        <PodViewFilter
          filter={filter}
          inverseStyle={true}
          items={filteredTextItems.getItems()}
          onFilterChange={this.handleFilterChange}
          statusChoices={['all', 'active', 'completed']}
          statusMapper={this.getInstanceFilterStatus}>
          {this.getKillButtons()}
        </PodViewFilter>
        <PodInstancesTable
          filterText={filter.text}
          instances={filteredItems}
          inverseStyle={true}
          onSelectionChange={this.handleSelectionChange}
          pod={this.props.pod} />
        <KillPodInstanceModal
          action={activeKillDialogAction}
          onClose={this.handleCloseKillDialog}
          open={!!activeKillDialogAction}
          pod={pod}
          selectedItems={selectedItems} />
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
