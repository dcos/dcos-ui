import React from 'react';

import EventTypes from '../constants/EventTypes';
import FilterHeadline from './FilterHeadline';
import KillPodInstanceModal from './modals/KillPodInstanceModal';
import MesosStateStore from '../stores/MesosStateStore';
import Pod from '../structs/Pod';
import PodInstancesTable from './PodInstancesTable';
import PodInstanceStatus from '../constants/PodInstanceStatus';
import PodUtil from '../utils/PodUtil';
import PodViewFilter from './PodViewFilter';

const METHODS_TO_BIND = [
  'handleCloseKillDialog',
  'handleFilterChange',
  'handleFilterReset',
  'handleKillClick',
  'handleKillAndScaleClick',
  'handleMesosStateChange',
  'handleSelectionChange'
];

class PodInstancesTabView extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      filter: {
        text: '',
        status: 'active'
      },
      selectedItems: [],
      killDialogOpen: false,
      killDialogAction: 'kill'
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
          onClick={this.handleKillClick}>
          Kill
        </div>
      </div>
    );
  }

  componentWillMount() {
    MesosStateStore.addChangeListener(
      EventTypes.MESOS_STATE_CHANGE,
      this.handleMesosStateChange
    );
  }

  componentWillUnmount() {
    MesosStateStore.removeChangeListener(
      EventTypes.MESOS_STATE_CHANGE,
      this.handleMesosStateChange
    );
  }

  handleCloseKillDialog() {
    this.setState({
      killDialogOpen: false
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
      killDialogAction: 'kill',
      killDialogOpen: true
    });
  }

  handleKillAndScaleClick() {
    this.setState({
      killDialogAction: 'killAndScale',
      killDialogOpen: true
    });
  }

  handleSelectionChange(selectedItems) {
    this.setState({selectedItems});
  }

  handleMesosStateChange() {
    this.forceUpdate();
  }

  render() {
    var {pod} = this.props;
    var {filter, killDialogOpen, killDialogAction, selectedItems} = this.state;
    let historicalInstances = MesosStateStore.getPodHistoricalInstances(pod);
    let allItems = PodUtil.mergeHistoricalInstanceList(
      pod.getInstanceList(), historicalInstances);
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
          isFiltering={filter.text || (filter.status !== 'all')}
          name="Instance"
          onReset={this.handleFilterReset}
          totalLength={allItems.getItems().length}
          />
        <PodViewFilter
          filter={filter}
          items={filteredTextItems.getItems()}
          onFilterChange={this.handleFilterChange}
          statusChoices={['all', 'active', 'completed']}
          statusMapper={this.getInstanceFilterStatus}>
          {this.getKillButtons()}
        </PodViewFilter>
        <PodInstancesTable
          filterText={filter.text}
          instances={filteredItems}
          onSelectionChange={this.handleSelectionChange}
          pod={this.props.pod} />
        <KillPodInstanceModal
          action={killDialogAction}
          onClose={this.handleCloseKillDialog}
          open={killDialogOpen}
          pod={pod}
          selectedItems={selectedItems} />
      </div>
    );
  }
}

PodInstancesTabView.contextTypes = {
  router: React.PropTypes.func
};

PodInstancesTabView.propTypes = {
  pod: React.PropTypes.instanceOf(Pod)
};

module.exports = PodInstancesTabView;
