import Job from "../structs/Job";

// TODO: DCOS-7747 Move this method as well as `createFormModelFromSchema` into
// the SchemaUtil and refactor it accordingly.
const getMatchingProperties = function(job, item) {
  return Object.keys(item).reduce(function(memo, subItem) {
    if (item[subItem].type === "group") {
      Object.keys(item[subItem].properties).forEach(function(key) {
        memo[key] = item[subItem].properties[key].default;

        if (
          item[subItem].properties[key].getter &&
          !!item[subItem].properties[key].getter(job)
        ) {
          memo[key] = item[subItem].properties[key].getter(job);
        }
      });

      return memo;
    }

    if (item[subItem].type === "object") {
      memo[subItem] = getMatchingProperties(job, item[subItem].properties);

      return memo;
    }

    memo[subItem] = item[subItem].default;

    if (item[subItem].getter) {
      memo[subItem] = item[subItem].getter(job);
    }

    return memo;
  }, {});
};

const JobUtil = {
  createJobFromFormModel(formModel, spec = {}) {
    if (formModel == null) {
      return new Job();
    }

    const {
      general = {
        id: null
      },
      labels = {},
      docker,
      schedule
    } = formModel;

    spec.id = general.id;
    spec.description = general.description;

    if (labels != null && labels.items != null) {
      spec.labels = labels.items.reduce(function(memo, { key, value }) {
        if (key == null) {
          return memo;
        }

        // The 'undefined' value is not rendered by the JSON.stringify,
        // so make sure empty environment variables are not left unrendered
        memo[key] = value || "";

        return memo;
      }, {});
    }

    spec.run = Object.assign(spec.run || {}, {
      cmd: general.cmd,
      cpus: general.cpus,
      mem: general.mem,
      disk: general.disk
    });

    if (docker && docker.image) {
      Object.assign(spec.run, { docker });
    }

    // Reset schedules
    spec.schedules = [];

    // Only transfer schedule if checkbox is set, and create job with reasonable
    // defaults
    if (!schedule || schedule.runOnSchedule) {
      const {
        id = "default",
        enabled = true,
        cron,
        timezone,
        concurrencyPolicy = "ALLOW",
        startingDeadlineSeconds
      } = schedule || {};

      spec.schedules.push({
        id,
        enabled,
        cron,
        timezone,
        concurrencyPolicy,
        startingDeadlineSeconds
      });
    }

    return new Job(spec);
  },

  createFormModelFromSchema(schema, job = new Job()) {
    return getMatchingProperties(job, schema.properties);
  },

  createJobSpecFromJob(job) {
    const spec = JSON.parse(JSON.stringify(job));

    spec.id = job.getId() || null;
    spec.description = job.getDescription();

    spec.run = Object.assign(spec.run || {}, {
      cmd: job.getCommand(),
      cpus: job.getCpus(),
      mem: job.getMem(),
      disk: job.getDisk()
    });

    const labels = job.getLabels();
    if (Object.keys(labels).length > 0) {
      spec.labels = labels;
    }

    const docker = job.getDocker();
    if (docker.image) {
      Object.assign(spec.run, { docker });
    }

    const [schedule] = job.getSchedules();
    if (schedule) {
      const {
        id = "default",
        enabled = true,
        cron,
        timezone,
        concurrencyPolicy = "ALLOW",
        startingDeadlineSeconds
      } = schedule;
      // Transfer schedule as with reasonable defaults
      spec.schedules = [
        {
          id,
          enabled,
          cron,
          timezone,
          concurrencyPolicy,
          startingDeadlineSeconds
        }
      ];
    } else {
      spec.schedules = [];
    }

    return spec;
  }
};

module.exports = JobUtil;
