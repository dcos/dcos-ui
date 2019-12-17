import { i18nMark } from "@lingui/react";

const ServiceErrorPathMapping = [
  {
    match: /^id$/,
    name: i18nMark("Service ID")
  },
  {
    match: /^instances$/,
    name: i18nMark("Instances")
  },
  {
    match: /^container.docker.image$/,
    name: i18nMark("Container Image")
  },
  {
    match: /^cpus$/,
    name: i18nMark("CPUs")
  },
  {
    match: /^mem$/,
    name: i18nMark("Memory")
  },
  {
    match: /^disk$/,
    name: i18nMark("Disk")
  },
  {
    match: /^gpus$/,
    name: i18nMark("GPUs")
  },
  {
    match: /^env\.\*$/,
    name: i18nMark("Environment variables")
  },

  //
  // Placement
  //
  {
    match: /^constraints.[0-9]+\.value$/,
    name: i18nMark("Placement advanced constraints values")
  },

  //
  // Volumes
  //
  {
    match: /^container\.volumes\.[0-9]+\.containerPath$/,
    name: i18nMark("Volume container path")
  },
  {
    match: /^container\.volumes\.[0-9]+\..*size$/,
    name: i18nMark("Volume size")
  },
  {
    match: /^container\.volumes\.[0-9]+\.hostPath$/,
    name: i18nMark("Volume host path")
  },
  {
    match: /^container\.volumes\.[0-9]+\.mode$/,
    name: i18nMark("Volume mode")
  },
  {
    // this appears in multiple places, for example Local Persistent Volume > Size and Host Volume > Host path
    match: /^container\.volumes\.[0-9]+\.persistent$/,
    name: i18nMark("Volume properties")
  },
  // containers.0.volumeMounts.0.name

  //
  // Networking (Host)
  //
  {
    match: /^portDefinitions\.[0-9]+\.name$/,
    name: i18nMark("Service endpoint names")
  },
  {
    match: /^portDefinitions\.[0-9]+\.port$/,
    name: i18nMark("Service endpoint host ports")
  },
  {
    match: /^portDefinitions\.[0-9]+\.labels\.VIP_/,
    name: i18nMark("Service endpoint host ports")
  },
  {
    match: /^containers\.[0-9]+\.endpoints\.[0-9]+\.name_/,
    name: i18nMark("Service endpoint names")
  },

  //
  // Networking (Bridge)
  //
  {
    match: /^container\.docker\.portMappings\.[0-9]+\.name/,
    name: i18nMark("Service endpoint names")
  },
  {
    match: /^container\.docker\.portMappings\.[0-9]+\.containerPort/,
    name: i18nMark("Service endpoint container ports")
  },
  {
    match: /^container\.docker\.portMappings\.[0-9]+\.hostPort/,
    name: i18nMark("Service endpoint host ports")
  },
  {
    match: /^container\.portMappings\.[0-9]+\.name/,
    name: i18nMark("Service endpoint names")
  },
  {
    match: /^container\.portMappings\.[0-9]+\.containerPort/,
    name: i18nMark("Service endpoint container ports")
  },
  {
    match: /^container\.portMappings\.[0-9]+\.hostPort/,
    name: i18nMark("Service endpoint host ports")
  },
  {
    match: /^container\.portMappings\.[0-9]+\.labels\.VIP_[0-9]+/,
    name: i18nMark("Service endpoint host ports")
  },
  //
  // Health checks
  //
  {
    match: /^healthChecks\.[0-9]+\.gracePeriodSeconds/,
    name: i18nMark("Health check grace periods")
  },
  {
    match: /^healthChecks\.[0-9]+\.intervalSeconds/,
    name: i18nMark("Health check intervals")
  },
  {
    match: /^healthChecks\.[0-9]+\.timeoutSeconds/,
    name: i18nMark("Health check timeouts")
  },
  {
    match: /^healthChecks\.[0-9]+\.maxConsecutiveFailures/,
    name: i18nMark("Health check max failures")
  },

  //
  // Environment variables
  //
  {
    match: /^labels./,
    name: i18nMark("Environment variable label")
  },

  //
  // Secrets
  //
  {
    match: /^secrets\.secret[0-9]+/,
    name: i18nMark("Secrets")
  },

  //
  // Multi-container
  //
  {
    match: /^scaling\.instances/,
    name: i18nMark("Instances")
  },
  {
    match: /^containers$/, // must be exact match
    name: i18nMark("Containers")
  },
  {
    match: /^containers\.[0-9]+\.resources\.cpus/,
    name: i18nMark("Container CPUs")
  },
  {
    match: /^containers\.[0-9]+\.resources\.mem/,
    name: i18nMark("Container Memory")
  },
  {
    match: /^containers\.[0-9]+\.name/,
    name: i18nMark("Container names")
  },
  {
    match: /^containers\.[0-9]+\.endpoints\.[0-9]+\.name/,
    name: i18nMark("Service endpoint names")
  },
  {
    match: /^containers\.[0-9]+\.endpoints\.[0-9]+\.hostPort/,
    name: i18nMark("Service endpoint host ports")
  },
  {
    match: /^containers\.[0-9]+\.endpoints\.[0-9]+\.protocol/,
    name: i18nMark("Service endpoint protocol")
  },
  {
    match: /^containers\.[0-9]+\.endpoints\.[0-9]+\.hostPort/,
    name: i18nMark("Service endpoint host ports")
  },
  {
    match: /^containers\.[0-9]+\.endpoints\.[0-9]+\.labels\.VIP_[0-9]+/,
    name: i18nMark("Service endpoint host ports")
  },
  {
    match: /^containers\.[0-9]+\.endpoints\.[0-9]+\.containerPort/,
    name: i18nMark("Service endpoint container ports")
  },
  {
    match: /^containers\.[0-9]+\.volumeMounts\.[0-9]+\.name/,
    name: i18nMark("Volumes name")
  },
  {
    match: /^containers\.[0-9]+\.volumeMounts\.[0-9]+\.mountPath/,
    name: i18nMark("Volumes mount path")
  },
  {
    match: /^volumes\.[0-9]+\.name/,
    name: i18nMark("Volumes name")
  },
  {
    match: /^volumes\.[0-9]+\.persistent$/,
    name: i18nMark("Volumes name")
  },
  {
    match: /^volumes\.[0-9]+\.persistent\.size/,
    name: i18nMark("Volumes size")
  },
  {
    match: /^containers\.[0-9]+\.healthCheck\.gracePeriodSeconds/,
    name: i18nMark("Health check grace periods")
  },
  {
    match: /^containers\.[0-9]+\.healthCheck\.intervalSeconds/,
    name: i18nMark("Health check intervals")
  },
  {
    match: /^containers\.[0-9]+\.healthCheck\.timeoutSeconds/,
    name: i18nMark("Health check timeouts")
  },
  {
    match: /^containers\.[0-9]+\.healthCheck\.maxConsecutiveFailures/,
    name: i18nMark("Health check max failures")
  },
  {
    match: /^containers\.[0-9]+\.healthCheck\.http\.endpoint/,
    name: i18nMark("Health check service endpoint")
  },
  {
    match: /^environment\./,
    name: i18nMark("Environment variables")
  }
];

export default ServiceErrorPathMapping;
