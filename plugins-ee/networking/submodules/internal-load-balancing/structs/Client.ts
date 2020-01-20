import Item from "#SRC/js/structs/Item";

export default class Client extends Item {
  getApplicationReachability() {
    return this.get("application_reachability");
  }

  getFailLastMinute() {
    return Number(this.get("fail_last_minute"));
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

  getIP() {
    return this.get("ip");
  }

  getMachineReachability() {
    return this.get("machine_reachability");
  }

  getP99Latency() {
    return Number(Number(this.get("p99_latency_ms")).toFixed(2));
  }

  getSuccessLastMinute() {
    return Number(this.get("success_last_minute"));
  }
}
