import Item from "#SRC/js/structs/Item";

export default class Backend extends Item {
  getApplicationReachabilityPercent() {
    return Number(this.get("application_reachability_pct") || 0);
  }

  getFailLastMinute() {
    return Number(this.get("fail_last_minute") || 0);
  }

  getFailPercent() {
    const success = this.getSuccessLastMinute();
    const fail = this.getFailLastMinute();

    // No execution
    if (success + fail === 0) {
      return 0;
    }

    // Only failures
    if (success === 0) {
      return 100;
    }

    return Math.floor((fail / success) * 100);
  }

  getFrameworkID() {
    const frameworkID = this.get("framework_id");

    if (frameworkID && frameworkID.length) {
      return frameworkID;
    }

    return null;
  }

  getIP() {
    return this.get("ip");
  }

  getMachineReachabilityPercent() {
    return Number(this.get("machine_reachability_pct") || 0);
  }

  getP99Latency() {
    return Number(Number(this.get("p99_latency_ms")).toFixed(2));
  }

  getPort() {
    return Number(this.get("port"));
  }

  getSuccessLastMinute() {
    return Number(this.get("success_last_minute"));
  }

  getTaskID() {
    const taskID = this.get("task_id");

    if (taskID && taskID.length) {
      return taskID;
    }

    return null;
  }
}
