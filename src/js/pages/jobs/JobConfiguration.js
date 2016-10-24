import React from 'react';

import DescriptionList from '../../components/DescriptionList';
import Job from '../../structs/Job';

class JobConfiguration extends React.Component {

  getSchedule(job) {
    let lastSchedule = job.getSchedules()[0];

    if (!!lastSchedule && !!lastSchedule.cron) {
      return lastSchedule.cron;
    }

    return 'No schedule available.';
  }

  getGenralSection(job) {
    let headerValueMapping = {
      'ID': job.getId(),
      'Description': job.getDescription(),
      'CPUs': job.getCpus(),
      'Memory (MiB)': job.getMem(),
      'Disk Space (Mib)': job.getDisk(),
      'Command': job.getCommand()
    };

    return (
      <DescriptionList
        hash={headerValueMapping}
        headline="General" />
    );
  }

  getScheduleSection(job) {
    let [schedule] = job.getSchedules();
    if (schedule == null) {
      return null;
    }

    let headerValueMapping = {
      'ID': schedule.id,
      'Enabled': schedule.enabled,
      'CRON Schedule': schedule.cron,
      'Time Zone': schedule.timezone,
      'Starting Deadline': schedule.startingDeadlineSeconds
    };

    return (
      <DescriptionList
        hash={headerValueMapping}
        headline="Schedule" />
    );
  }

  getDockerContainerSection(job) {
    let docker = job.getDocker();
    if (docker == null) {
      return null;
    }

    let headerValueMapping = {
      'Image': docker.image
    };

    return (
      <DescriptionList
        hash={headerValueMapping}
        headline="Docker Container" />
    );
  }

  getLabelSection(job) {
    return (
      <DescriptionList
        hash={job.getLabels()}
        headline="Labels" />
    );
  }

  render() {
    let {job} = this.props;

    return (
      <div>
        <h4>Configuration</h4>
        {this.getGenralSection(job)}
        {this.getScheduleSection(job)}
        {this.getDockerContainerSection(job)}
        {this.getLabelSection(job)}
      </div>
    );
  }
}

JobConfiguration.propTypes = {
  job: React.PropTypes.instanceOf(Job).isRequired
};

module.exports = JobConfiguration;
