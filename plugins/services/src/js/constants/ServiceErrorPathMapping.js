const ServiceErrorPathMapping = [
  {
    match: /^id$/,
    name: "Service ID"
  },
  {
    match: /^instances$/,
    name: "Instances"
  },
  {
    match: /^cpus$/,
    name: "CPUs"
  },
  {
    match: /^mem$/,
    name: "Memory"
  },
  {
    match: /^env\.\*$/,
    name: "Environment variables"
  },

  //
  // Volumes
  //
  {
    match: /^container\.volumes\.[0-9]+\.containerPath$/,
    name: "Volume container path"
  },
  {
    match: /^container\.volumes\.[0-9]+\..*size$/,
    name: "Volume size"
  },
  {
    match: /^container\.volumes\.[0-9]+\.hostPath$/,
    name: "Volume host path"
  },
  {
    match: /^container\.volumes\.[0-9]+\.mode$/,
    name: "Volume mode"
  },

  //
  // Networking (Host)
  //
  {
    match: /^portDefinitions\.[0-9]+\.name$/,
    name: "Service endpoint names"
  },
  {
    match: /^portDefinitions\.[0-9]+\.port$/,
    name: "Service endpoint host ports"
  },
  {
    match: /^portDefinitions\.[0-9]+\.labels\.VIP_/,
    name: "Service endpoint host ports"
  },

  //
  // Networking (Bridge)
  //
  {
    match: /^container\.docker\.portMappings\.[0-9]+\.name/,
    name: "Service endpoint names"
  },
  {
    match: /^container\.docker\.portMappings\.[0-9]+\.containerPort/,
    name: "Service endpoint container ports"
  },
  {
    match: /^container\.docker\.portMappings\.[0-9]+\.hostPort/,
    name: "Service endpoint host ports"
  },

  //
  // Health checks
  //
  {
    match: /^healthChecks\.[0-9]+\.gracePeriodSeconds/,
    name: "Health check grace periods"
  },
  {
    match: /^healthChecks\.[0-9]+\.intervalSeconds/,
    name: "Health check intervals"
  },
  {
    match: /^healthChecks\.[0-9]+\.timeoutSeconds/,
    name: "Health check timeouts"
  },
  {
    match: /^healthChecks\.[0-9]+\.maxConsecutiveFailures/,
    name: "Health check max failures"
  }
];

module.exports = ServiceErrorPathMapping;
