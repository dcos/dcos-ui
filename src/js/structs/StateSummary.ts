import MesosSummaryUtil from "../utils/MesosSummaryUtil";
import ServicesList from "../../../plugins/services/src/js/structs/ServicesList";
import NodesList from "./NodesList";

export default class StateSummary {
  constructor(options = {}) {
    const snapshot = options.snapshot || {
      frameworks: [],
      slaves: [],
      cluster: "",
      hostname: "",
    };
    // Only place where we normalize server data
    // we may be able to remove this, but it needs testing
    snapshot.slaves = snapshot.slaves || [];
    this.snapshot = snapshot;

    // We may only want to get the active slaves...
    const slaves = this.snapshot.slaves;

    this.metadata = {
      date: options.date || Date.now(),
      successfulSnapshot:
        options.successful != null ? options.successful : true,

      slaveUsedResources: MesosSummaryUtil.sumResources(
        slaves.map((slave) => slave.used_resources)
      ),
      slaveTotalResources: MesosSummaryUtil.sumResources(
        slaves.map((slave) => slave.resources)
      ),
    };
  }

  getSnapshotDate() {
    return this.metadata.date;
  }

  getClusterName() {
    return this.snapshot.cluster;
  }

  getActiveSlaves() {
    return this.snapshot.slaves.filter((slave) => slave.active === true);
  }

  getServiceList() {
    return new ServicesList({ items: this.snapshot.frameworks });
  }

  getNodesList() {
    return new NodesList({ items: this.snapshot.slaves });
  }

  getSlaveTotalResources() {
    return this.metadata.slaveTotalResources;
  }

  getSlaveUsedResources() {
    return this.metadata.slaveUsedResources;
  }

  isSnapshotSuccessful() {
    return this.metadata.successfulSnapshot;
  }
}
