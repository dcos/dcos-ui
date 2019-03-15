import ServiceSpec from "./ServiceSpec";

export default class ApplicationSpec extends ServiceSpec {
  getAcceptedResourceRoles() {
    return this.get("acceptedResourceRoles");
  }

  getArguments() {
    return this.get("args");
  }

  getCommand() {
    return this.get("cmd");
  }

  getContainerSettings() {
    return this.get("container");
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

  getEnvironmentVariables() {
    return this.get("env");
  }

  getExecutor() {
    return this.get("executor");
  }

  getFetch() {
    return this.get("fetch");
  }

  getHealthChecks() {
    const healthChecks = this.get("healthChecks") || [];

    // "Clone" health checks to ensure that no one is accidentally altering the
    // properties.
    return healthChecks.map(function(healthCheck) {
      return Object.assign({}, healthCheck);
    });
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

  getMem() {
    return this.get("mem");
  }

  getPortDefinitions() {
    return this.get("portDefinitions");
  }

  getResidency() {
    return this.get("residency");
  }

  /**
   * @override
   */
  getResources() {
    return {
      cpus: this.get("cpus") || 0,
      mem: this.get("mem") || 0,
      gpus: this.get("gpus") || 0,
      disk: this.get("disk") || 0
    };
  }

  getUpdateStrategy() {
    return this.get("updateStrategy");
  }

  getUser() {
    return this.get("user");
  }
}
