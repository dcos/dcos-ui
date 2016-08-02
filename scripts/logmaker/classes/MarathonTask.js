class MarathonTask {
  constructor(name, usedResources) {
    this.id = '/' + name;
    this.cmd = null;
    this.args = null;
    this.user = null;
    this.env = {};
    this.instances = 1;
    this.cpus = usedResources.cpus;
    this.mem = usedResources.mem;
    this.disk = usedResources.disk;
    this.executor = '';
    this.constraints = [];
    this.uris = [];
    this.fetch = [];
    this.storeUrls = [];
    this.ports = [];
    this.portDefinition = [];
    this.requirePorts = false;
    this.backoffSeconds = 1;
    this.backoffFactor = 1.15;
    this.maxLaunchDelaySeconds = 3600;
    this.container = {};
    this.healthChecks = [];
    this.readinessChecks = [];
    this.dependencies = [];
    this.upgradeStrategy = {};
    this.labels = {};
    this.acceptedResourcesRoles = ['*'];
    this.ipAddress = null;
    this.version = 'current date';
    this.residency = null;
    this.versionInfo = {};
    this.tasksStaged = 0;
    this.tasksRunning = 1;
    this.tasksHealthy = 1;
    this.tasksUnhealthy = 0;
    this.deployments = [];
  }
}

module.exports = MarathonTask;
