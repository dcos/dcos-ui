import PropTypes from "prop-types";
import React from "react";

import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import HashMapDisplay from "#SRC/js/components/HashMapDisplay";

const GeneralSection = ({ id, description, cpus, mem, disk, command }) => (
  <ConfigurationMapSection>
    <ConfigurationMapHeading>General</ConfigurationMapHeading>
    <ConfigurationMapRow>
      <ConfigurationMapLabel>ID</ConfigurationMapLabel>
      <ConfigurationMapValue>{id}</ConfigurationMapValue>
    </ConfigurationMapRow>
    <ConfigurationMapRow>
      <ConfigurationMapLabel>Description</ConfigurationMapLabel>
      <ConfigurationMapValue>{description}</ConfigurationMapValue>
    </ConfigurationMapRow>
    <ConfigurationMapRow>
      <ConfigurationMapLabel>CPUs</ConfigurationMapLabel>
      <ConfigurationMapValue>{cpus}</ConfigurationMapValue>
    </ConfigurationMapRow>
    <ConfigurationMapRow>
      <ConfigurationMapLabel>Memory (MiB)</ConfigurationMapLabel>
      <ConfigurationMapValue>{mem}</ConfigurationMapValue>
    </ConfigurationMapRow>
    <ConfigurationMapRow>
      <ConfigurationMapLabel>Disk Space (Mib)</ConfigurationMapLabel>
      <ConfigurationMapValue>{disk}</ConfigurationMapValue>
    </ConfigurationMapRow>
    <ConfigurationMapRow>
      <ConfigurationMapLabel>Command</ConfigurationMapLabel>
      <ConfigurationMapValue>
        <pre className="flush transparent wrap">{command}</pre>
      </ConfigurationMapValue>
    </ConfigurationMapRow>
  </ConfigurationMapSection>
);

const ScheduleSection = ({
  id,
  enabled,
  cron,
  timezone,
  startingDeadlineSeconds
}) => (
  <ConfigurationMapSection>
    <ConfigurationMapHeading>Schedule</ConfigurationMapHeading>
    <ConfigurationMapRow>
      <ConfigurationMapLabel>ID</ConfigurationMapLabel>
      <ConfigurationMapValue>{id}</ConfigurationMapValue>
    </ConfigurationMapRow>
    <ConfigurationMapRow>
      <ConfigurationMapLabel>Enabled</ConfigurationMapLabel>
      <ConfigurationMapValue>{enabled}</ConfigurationMapValue>
    </ConfigurationMapRow>
    <ConfigurationMapRow>
      <ConfigurationMapLabel>CRON Schedule</ConfigurationMapLabel>
      <ConfigurationMapValue>{cron}</ConfigurationMapValue>
    </ConfigurationMapRow>
    <ConfigurationMapRow>
      <ConfigurationMapLabel>Time Zone</ConfigurationMapLabel>
      <ConfigurationMapValue>{timezone}</ConfigurationMapValue>
    </ConfigurationMapRow>
    <ConfigurationMapRow>
      <ConfigurationMapLabel>Starting Deadline</ConfigurationMapLabel>
      <ConfigurationMapValue>{startingDeadlineSeconds}</ConfigurationMapValue>
    </ConfigurationMapRow>
  </ConfigurationMapSection>
);

const DockerContainerSection = ({ image }) => (
  <ConfigurationMapSection>
    <ConfigurationMapHeading>Docker Container</ConfigurationMapHeading>
    <ConfigurationMapRow>
      <ConfigurationMapLabel>Image</ConfigurationMapLabel>
      <ConfigurationMapValue>{image}</ConfigurationMapValue>
    </ConfigurationMapRow>
  </ConfigurationMapSection>
);

const LabelsSection = ({ labels }) => (
  <HashMapDisplay
    hash={labels.reduce(
      (memo, { key, value }) => ({ ...memo, [key]: value }),
      {}
    )}
    headline="Labels"
  />
);

export default function JobConfiguration({ job }) {
  const [schedule] = job.schedules.nodes;

  return (
    <div className="container">
      <ConfigurationMap>
        <GeneralSection {...job} />
        {schedule ? <ScheduleSection {...schedule} /> : null}
        {job.docker && job.docker.image ? (
          <DockerContainerSection {...job.docker} />
        ) : null}
        <LabelsSection labels={job.labels} />
      </ConfigurationMap>
    </div>
  );
}

JobConfiguration.propTypes = {
  job: PropTypes.object.isRequired
};
