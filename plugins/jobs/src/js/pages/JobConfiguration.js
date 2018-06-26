import PropTypes from "prop-types";
import React from "react";

import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import HashMapDisplay from "#SRC/js/components/HashMapDisplay";

export default class JobConfiguration extends React.Component {
  static getSchedule(job) {
    const lastSchedule = job.getSchedules()[0];

    if (!!lastSchedule && !!lastSchedule.cron) {
      return lastSchedule.cron;
    }

    return "No schedule available.";
  }

  getGeneralSection(job) {
    return (
      <ConfigurationMapSection>
        <ConfigurationMapHeading>General</ConfigurationMapHeading>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>ID</ConfigurationMapLabel>
          <ConfigurationMapValue>{job.id}</ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Description</ConfigurationMapLabel>
          <ConfigurationMapValue>{job.description}</ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>CPUs</ConfigurationMapLabel>
          <ConfigurationMapValue>{job.cpus}</ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Memory (MiB)</ConfigurationMapLabel>
          <ConfigurationMapValue>{job.mem}</ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Disk Space (Mib)</ConfigurationMapLabel>
          <ConfigurationMapValue>{job.disk}</ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Command</ConfigurationMapLabel>
          <ConfigurationMapValue>
            <pre className="flush transparent wrap">{job.command}</pre>
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      </ConfigurationMapSection>
    );
  }

  getScheduleSection(job) {
    const [schedule] = job.schedules.nodes;
    if (schedule == null) {
      return null;
    }

    return (
      <ConfigurationMapSection>
        <ConfigurationMapHeading>Schedule</ConfigurationMapHeading>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>ID</ConfigurationMapLabel>
          <ConfigurationMapValue>{schedule.id}</ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Enabled</ConfigurationMapLabel>
          <ConfigurationMapValue>{schedule.enabled}</ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>CRON Schedule</ConfigurationMapLabel>
          <ConfigurationMapValue>{schedule.cron}</ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Time Zone</ConfigurationMapLabel>
          <ConfigurationMapValue>{schedule.timezone}</ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Starting Deadline</ConfigurationMapLabel>
          <ConfigurationMapValue>
            {schedule.startingDeadlineSeconds}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      </ConfigurationMapSection>
    );
  }

  getDockerContainerSection(job) {
    const docker = job.docker;
    if (docker == null || !docker.image) {
      return null;
    }

    return (
      <ConfigurationMapSection>
        <ConfigurationMapHeading>Docker Container</ConfigurationMapHeading>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Image</ConfigurationMapLabel>
          <ConfigurationMapValue>{docker.image}</ConfigurationMapValue>
        </ConfigurationMapRow>
      </ConfigurationMapSection>
    );
  }

  getLabelSection(job) {
    return (
      <HashMapDisplay
        hash={job.labels.reduce(
          (memo, { key, value }) => ({ ...memo, [key]: value }),
          {}
        )}
        headline="Labels"
      />
    );
  }

  render() {
    const { job } = this.props;

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
  job: PropTypes.object.isRequired
};
