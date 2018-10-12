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
    match: /^cpus$/,
    name: i18nMark("CPUs")
  },
  {
    match: /^mem$/,
    name: i18nMark("Memory")
  },
  {
    match: /^env\.\*$/,
    name: i18nMark("Environment variables")
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
  }
];

module.exports = ServiceErrorPathMapping;
