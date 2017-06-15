const ServiceErrorPathMapping = [
  {
    match: /^id$/,
    name: "The service ID"
  },
  {
    match: /^instances$/,
    name: "The number of instances"
  },
  {
    match: /^cpus$/,
    name: "The number of CPUs"
  },
  {
    match: /^env\.\*$/,
    name: "An environment variable"
  }
];

module.exports = ServiceErrorPathMapping;
