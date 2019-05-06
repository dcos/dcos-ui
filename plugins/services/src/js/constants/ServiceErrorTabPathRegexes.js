const ServiceErrorTabPathRegexes = {
  services: [
    /^id$/,
    /^instances$/,
    /^cpus$/,
    /^mem$/,
    /^disk$/,
    /^gpus$/,
    /^container\.docker\.image$/,
    /^args$/,
    /^cmd$/
  ],
  volumes: [
    /^volumes\..*/,
    /^container\.volumes\..*/,
    /^containers\.[0-9]+\.volumeMounts\..*/
  ],
  placement: [/^constraints.*/],
  networking: [
    /^portDefinitions\..*/,
    /^container\.portMappings\..*/,
    /^container\.docker\.portMappings\..*/,
    /^containers\.[0-9]+\.endpoints\..*/
  ],
  healthChecks: [/^healthChecks\..*/, /^containers\.[0-9]+\.healthCheck\..*/],
  environment: [/^labels\..*/, /^env\..*/],
  secrets: [/^secrets\..*/],
  containers: [
    /^containers\.[0-9]+\.name$/,
    /^containers\.[0-9]+\.resources$/,
    /^containers\.[0-9]+\.resources\..*/
  ]
};

export default ServiceErrorTabPathRegexes;
