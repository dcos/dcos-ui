const JobErrorTabPathRegexes = {
  general: [
    /^id$/,
    /^run\.ucr\.image\.id$/,
    /^run\.docker\.image$/,
    /^job\.run\..*/,
    /^run\.gpus$/,
    /^run\.cpus$/,
    /^run\.mem$/,
    /^run\.disk$/,
    /^run\.cmd$/
  ],
  container: [/^run\.docker\.parameters.*/, /^run\.args\.[0-9]$/],
  schedule: [
    /^schedules\.[0-9]+\.id$/,
    /^schedules\.[0-9]+\.cron$/,
    /^schedules\.[0-9]+\.timezome$/,
    /^schedules\.[0-9]+\.startingDeadlineSeconds$/
  ],
  environment: [
    /^run\.env\..*\.value\.[0-9]$/,
    /^run\.env\..*\.key$/,
    /^run\.env\.[0-9]$/
  ],
  volumes: [
    /^run\.volumes\.[0-9]+\.containerPath$/,
    /^run\.volumes\.[0-9]+\.hostPath$/,
    /^run\.volumes\.[0-9]+\.mode$/
  ],
  placement: [
    /^run\.placement\.constraints\.[0-9]+\..*/,
    /^run\.placement\.constraints\.[0-9]$/
  ],
  runConfig: [/^labels\.[0-9]$/],
  secrets: [/^run\.secrets\..*/]
};

export default JobErrorTabPathRegexes;
