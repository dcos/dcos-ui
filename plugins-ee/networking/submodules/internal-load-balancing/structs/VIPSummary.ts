import Item from "#SRC/js/structs/Item";
import Maths from "#SRC/js/utils/Maths";

export default class VIPSummary extends Item {
  getApplicationReachabilityPercent() {
    return Number(this.get("application_reachability_pct") || 0);
  }

  getFailLastMinute() {
    return Number(this.get("fail_last_minute") || 0);
  }

  getFailPercent() {
    const failedLastMinute = this.getFailLastMinute();
    const total = failedLastMinute + this.getSuccessLastMinute();

    if (total === 0) {
      return 0;
    }

    return Maths.round((failedLastMinute / total) * 100, 4);
  }

  getMachineReachabilityPercent() {
    return Number(this.get("machine_reachability_pct") || 0);
  }

  getName() {
    const { name } = this.getVIP();

    if (name) {
      return name;
    }

    return this.getVIPString();
  }

  getP99Latency() {
    return Number(Number(this.get("p99_latency_ms") || 0).toFixed(2));
  }

  getSuccessLastMinute() {
    return Number(this.get("success_last_minute") || 0);
  }

  getVIP() {
    return this.get("vip");
  }

  getVIPString() {
    const { ip, port } = this.getVIP();

    return `${ip}:${port}`;
  }
}
