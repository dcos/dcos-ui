import Item from "#SRC/js/structs/Item";
import ClientList from "./ClientList";

export default class BackendConnection extends Item {
  getClients() {
    return new ClientList({ items: this.get("clients") });
  }

  getRequestSuccesses() {
    return this.get("request_success");
  }

  getRequestFailures() {
    return this.get("request_fail");
  }

  getApplicationReachability50() {
    return this.get("application_reachability_50");
  }

  getApplicationReachability75() {
    return this.get("application_reachability_75");
  }

  getApplicationReachability90() {
    return this.get("application_reachability_90");
  }

  getApplicationReachability95() {
    return this.get("application_reachability_95");
  }

  getApplicationReachability99() {
    return this.get("application_reachability_99");
  }

  getMachineReachability50() {
    return this.get("machine_reachability_50");
  }

  getMachineReachability75() {
    return this.get("machine_reachability_75");
  }

  getMachineReachability90() {
    return this.get("machine_reachability_90");
  }

  getMachineReachability95() {
    return this.get("machine_reachability_95");
  }

  getMachineReachability99() {
    return this.get("machine_reachability_99");
  }

  getConnectionLatency50() {
    return this.get("connection_latency_50");
  }

  getConnectionLatency75() {
    return this.get("connection_latency_75");
  }

  getConnectionLatency90() {
    return this.get("connection_latency_90");
  }

  getConnectionLatency95() {
    return this.get("connection_latency_95");
  }

  getConnectionLatency99() {
    return this.get("connection_latency_99");
  }
}
