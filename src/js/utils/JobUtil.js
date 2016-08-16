import Job from '../structs/Job';

// TODO: DCOS-7747 Move this method as well as `createFormModelFromSchema` into
// the SchemaUtil and refactor it accordingly.
const getMatchingProperties = function (job, item) {

  return Object.keys(item).reduce(function (memo, subItem) {

    if (item[subItem].type === 'group') {
      Object.keys(item[subItem].properties).forEach(function (key) {
        memo[key] = item[subItem].properties[key].default;

        if (item[subItem].properties[key].getter &&
          !!item[subItem].properties[key].getter(job)) {
          memo[key] = item[subItem].properties[key].getter(job);
        }
      });

      return memo;
    }

    if (item[subItem].type === 'object') {
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
  createJobFromFormModel(formModel) {
    if (formModel == null) {
      return new Job();
    }

    let spec = {};
    let {
      general = {
        id: null
      },
      labels = {},
      docker,
      schedule
    } = formModel;

    spec.id = general.id;
    spec.description = general.description;

    if (Array.isArray(labels.items)) {
      spec.labels = labels.items.reduce(function (memo, {key, value}) {
        memo[key] = value || null;

        return memo;
      }, {});
    }

    spec.run = {
      cmd: general.cmd,
      cpus: general.cpus,
      mem: general.mem,
      disk: general.disk,
      docker
    };

    spec.schedules = [schedule];

    return new Job(spec);
  },

  createFormModelFromSchema(schema, job = new Job()) {
    return getMatchingProperties(job, schema.properties);
  },

  createJobSpecFromJob(job) {
    let spec = {};

    spec.id = job.getId() || null;
    spec.description = job.getDescription();

    spec.run = {
      cmd: job.getCommand(),
      cpus: job.getCpus(),
      mem: job.getMem(),
      disk: job.getDisk()
    };

    let labels = job.getLabels();
    if (Object.keys(labels).length > 0) {
      spec.labels = labels;
    }

    let docker = job.getDocker();
    if (docker.image) {
      Object.assign(spec.run, {docker});
    }

    let [schedule = {}] = job.getSchedules();

    if (schedule.id != null || schedule.cron != null) {
      if (schedule.concurrencyPolicy == null) {
        schedule.concurrencyPolicy = 'ALLOW';
      }
      spec.schedules = [schedule];
    }

    return spec;
  }
};

module.exports = JobUtil;
