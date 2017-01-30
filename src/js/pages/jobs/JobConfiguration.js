import React from 'react';

import ConfigurationMap from '../../components/ConfigurationMap';
import HashMapDisplay from '../../components/HashMapDisplay';
import Job from '../../structs/Job';

class JobConfiguration extends React.Component {

  getSchedule(job) {
    const lastSchedule = job.getSchedules()[0];

    if (!!lastSchedule && !!lastSchedule.cron) {
      return lastSchedule.cron;
    }

    return 'No schedule available.';
  }

  getGeneralSection(job) {
    const headerValueMapping = {
      'ID': job.getId(),
      'Description': job.getDescription(),
      'CPUs': job.getCpus(),
      'Memory (MiB)': job.getMem(),
      'Disk Space (Mib)': job.getDisk(),
      'Command': job.getCommand()
    };

    return (
      <HashMapDisplay
        hash={headerValueMapping}
        headline="General" />
    );
  }

  getScheduleSection(job) {
    const [schedule] = job.getSchedules();
    if (schedule == null) {
      return null;
    }

    const headerValueMapping = {
      'ID': schedule.id,
      'Enabled': schedule.enabled,
      'CRON Schedule': schedule.cron,
      'Time Zone': schedule.timezone,
      'Starting Deadline': schedule.startingDeadlineSeconds
    };

    return (
      <HashMapDisplay
        hash={headerValueMapping}
        headline="Schedule" />
    );
  }

  getDockerContainerSection(job) {
    const docker = job.getDocker();
    if (docker == null || !docker.image) {
      return null;
    }

    const headerValueMapping = {
      'Image': docker.image
    };

    return (
      <HashMapDisplay
        hash={headerValueMapping}
        headline="Docker Container" />
    );
  }

  getLabelSection(job) {
    return (
      <HashMapDisplay
        hash={job.getLabels()}
        headline="Labels" />
    );
  }

  render() {
    const {job} = this.props;

    return (
      <div className="container">
        <ConfigurationMap>
          {this.getGeneralSection(job)}
          {this.getScheduleSection(job)}
          {this.getDockerContainerSection(job)}
          {this.getLabelSection(job)}
        </ConfigurationMap>
      </div>
    );
  }
}

JobConfiguration.propTypes = {
  job: React.PropTypes.instanceOf(Job).isRequired
};

module.exports = JobConfiguration;
