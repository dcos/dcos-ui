import List from './List';
import MesosSummaryUtil from '../utils/MesosSummaryUtil';
import StateSummary from './StateSummary';

module.exports = class SummaryList extends List {
  constructor(options = {}) {
    super(...arguments);
    this.maxLength = options.maxLength || null;
  }

  add() {
    super.add(...arguments);

    if (this.maxLength && this.list.length > this.maxLength) {
      this.list.shift();
    }
  }

  addSnapshot(snapshot, date) {
    this.add(new StateSummary({snapshot, date}));
  }

  getActiveNodesByState() {
    return this.getItems().map(function (state) {
      let slavesCount = null;

      if (state.isSnapshotSuccessful()) {
        slavesCount = state.getActiveSlaves().length;
      }

      return {
        date: state.getSnapshotDate(),
        slavesCount
      };
    });
  }

  lastSuccessful() {
    // finds last StateSummary with successful snapshot
    let stateResources = this.getItems();
    for (let i = stateResources.length - 1; i >= 0; i--) {
      if (stateResources[i].isSnapshotSuccessful()) {
        return stateResources[i];
      }
    }
    return new StateSummary({successful: false});
  }

  getResourceStatesForServiceIDs(ids) {
    let items = this.getItems() || [];
    let stateResources = items.map(function (state) {
      let resources = null, totalResources = null;

      if (state.isSnapshotSuccessful()) {
        resources = state.getServiceList().filter({ids}).sumUsedResources();
        totalResources = state.getSlaveTotalResources();
      }

      return {
        date: state.getSnapshotDate(),
        resources,
        totalResources
      };
    });

    return MesosSummaryUtil.stateResourcesToResourceStates(stateResources);
  }

  getResourceStatesForNodeIDs(ids) {
    let stateResources = this.getItems().map(function (state) {
      let resources = null, totalResources = null;

      if (state.isSnapshotSuccessful()) {
        resources = state.getNodesList().filter({ids}).sumUsedResources();
        totalResources = state.getNodesList().filter({ids}).sumResources();
      }

      return {
        date: state.getSnapshotDate(),
        resources,
        totalResources
      };
    });

    return MesosSummaryUtil.stateResourcesToResourceStates(stateResources);
  }

};
