import MesosSummaryUtil from '../utils/MesosSummaryUtil';
import ServicesList from './ServicesList';
import NodesList from './NodesList';

module.exports = class StateSummary {
  constructor(options = {}) {
    this.snapshot = {
      frameworks: [],
      slaves: [],
      cluster: '',
      hostname: ''
    };

    this.metadata = {
      date: undefined,
      successfulSnapshot: true,
      serviceUsedResources: {cpus: 0, mem: 0, disk: 0},
      slaveUsedResources: {cpus: 0, mem: 0, disk: 0},
      slaveTotalResources: {cpus: 0, mem: 0, disk: 0}
    };
    let snapshot = options.snapshot || this.snapshot;
    // Only place where we normalize server data
    // we may be able to remove this, but it needs testing
    snapshot.slaves = snapshot.slaves || [];
    this.snapshot = snapshot;

    if (options.successful != null) {
      this.metadata.successfulSnapshot = options.successful;
    }
    this.metadata.date = options.date || Date.now();

    let slaves = this.snapshot.slaves || [];
    // Store computed data – this is something we may not need to store
    this.metadata.slaveTotalResources = MesosSummaryUtil.sumResources(
      // We may only want to get the active slaves...
      slaves.map(function (slave) {
        return slave.resources || null;
      })
    );
    this.metadata.slaveUsedResources = MesosSummaryUtil.sumResources(
      // We may only want to get the active slaves...
      slaves.map(function (slave) {
        return slave.used_resources || null;
      })
    );

    let frameworks = this.snapshot.frameworks || [];
    this.metadata.serviceUsedResources = MesosSummaryUtil.sumResources(
      frameworks.map(function (framework) {
        return framework.used_resources || null;
      })
    );
  }

  getSnapshotDate() {
    return this.metadata.date;
  }

  getClusterName() {
    return this.snapshot.cluster;
  }

  getActiveSlaves() {
    return this.snapshot.slaves.filter(function (slave) {
      return slave.active;
    });
  }

  getServiceList() {
    return new ServicesList({items: this.snapshot.frameworks});
  }

  getNodesList() {
    return new NodesList({items: this.snapshot.slaves});
  }

  getSlaveTotalResources() {
    return this.metadata.slaveTotalResources;
  }

  getSlaveUsedResources() {
    return this.metadata.slaveUsedResources;
  }

  getServiceUsedResources() {
    return this.metadata.serviceUsedResources;
  }

  isSnapshotSuccessful() {
    return this.metadata.successfulSnapshot;
  }
};
