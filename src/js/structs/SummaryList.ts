import List from "./List";
import MesosSummaryUtil from "../utils/MesosSummaryUtil";
import StateSummary from "./StateSummary";

export default class SummaryList extends List {
  constructor(options = {}) {
    super(...arguments);
    this.maxLength = options.maxLength || null;
  }

  add(...args) {
    super.add(...args);

    if (this.maxLength && this.list.length > this.maxLength) {
      this.list.shift();
    }
  }

  addSnapshot(snapshot, date, successful) {
    this.add(new StateSummary({ snapshot, date, successful }));
  }

  getActiveNodesByState() {
    return this.getItems()
      .map(state => ({
        date: state.getSnapshotDate(),
        slavesCount: state.isSnapshotSuccessful()
          ? state.getActiveSlaves().length
          : null
      }))
      .sort((a, b) => a.date - b.date);
  }

  lastSuccessful() {
    // finds last StateSummary with successful snapshot
    return (
      this.getItems()
        .reverse()
        .find(r => r.isSnapshotSuccessful()) ||
      new StateSummary({ successful: false })
    );
  }

  getResourceStatesForNodeIDs(ids) {
    const stateResources = this.getItems().map(state => {
      let resources = null,
        totalResources = null;

      if (state.isSnapshotSuccessful()) {
        resources = state
          .getNodesList()
          .filter({ ids })
          .sumUsedResources();
        totalResources = state
          .getNodesList()
          .filter({ ids })
          .sumResources();
      }

      return {
        date: state.getSnapshotDate(),
        resources,
        totalResources
      };
    });

    return MesosSummaryUtil.stateResourcesToResourceStates(stateResources);
  }

  getClusterName() {
    const lastState = this.lastSuccessful();

    return lastState ? lastState.getClusterName() : null;
  }
}
