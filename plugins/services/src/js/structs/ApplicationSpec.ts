import ServiceSpec from "./ServiceSpec";

export default class ApplicationSpec extends ServiceSpec {
  getAcceptedResourceRoles() {
    return this.get("acceptedResourceRoles");
  }

  getCommand() {
    return this.get("cmd");
  }

  getConstraints() {
    return this.get("constraints");
  }

  getCpus() {
    return this.get("cpus");
  }

  getDisk() {
    return this.get("disk");
  }

  getFetch() {
    return this.get("fetch");
  }

  getHealthChecks() {
    const healthChecks = this.get("healthChecks") || [];

    // "Clone" health checks to ensure that no one is accidentally altering the
    // properties.
    return healthChecks.map((healthCheck) => ({
      ...healthCheck,
    }));
  }

  getInstancesCount() {
    return this.get("instances");
  }

  getIpAddress() {
    return this.get("ipAddress");
  }

  getLabels() {
    return this.get("labels");
  }

  /**
   * @override
   */
  getResources() {
    return {
      cpus: this.get("cpus") || 0,
      mem: this.get("mem") || 0,
      gpus: this.get("gpus") || 0,
      disk: this.get("disk") || 0,
    };
  }
}
