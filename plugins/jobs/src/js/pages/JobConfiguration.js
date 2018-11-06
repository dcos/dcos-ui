import { Trans } from "@lingui/macro";
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
    <ConfigurationMapHeading>
      <Trans>General</Trans>
    </ConfigurationMapHeading>
    <ConfigurationMapRow>
      <ConfigurationMapLabel>
        <Trans>ID</Trans>
      </ConfigurationMapLabel>
      <ConfigurationMapValue>{id}</ConfigurationMapValue>
    </ConfigurationMapRow>
    <ConfigurationMapRow>
      <ConfigurationMapLabel>
        <Trans>Description</Trans>
      </ConfigurationMapLabel>
      <ConfigurationMapValue>{description}</ConfigurationMapValue>
    </ConfigurationMapRow>
    <ConfigurationMapRow>
      <ConfigurationMapLabel>
        <Trans>CPUs</Trans>
      </ConfigurationMapLabel>
      <ConfigurationMapValue>{cpus}</ConfigurationMapValue>
    </ConfigurationMapRow>
    <ConfigurationMapRow>
      <ConfigurationMapLabel>
        <Trans>Memory (MiB)</Trans>
      </ConfigurationMapLabel>
      <ConfigurationMapValue>{mem}</ConfigurationMapValue>
    </ConfigurationMapRow>
    <ConfigurationMapRow>
      <ConfigurationMapLabel>
        <Trans>Disk Space (Mib)</Trans>
      </ConfigurationMapLabel>
      <ConfigurationMapValue>{disk}</ConfigurationMapValue>
    </ConfigurationMapRow>
    <ConfigurationMapRow>
      <ConfigurationMapLabel>
        <Trans>Command</Trans>
      </ConfigurationMapLabel>
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
    <ConfigurationMapHeading>
      <Trans>Schedule</Trans>
    </ConfigurationMapHeading>
    <ConfigurationMapRow>
      <ConfigurationMapLabel>
        <Trans>ID</Trans>
      </ConfigurationMapLabel>
      <ConfigurationMapValue>{id}</ConfigurationMapValue>
    </ConfigurationMapRow>
    <ConfigurationMapRow>
      <ConfigurationMapLabel>
        <Trans>Enabled</Trans>
      </ConfigurationMapLabel>
      <ConfigurationMapValue>{enabled}</ConfigurationMapValue>
    </ConfigurationMapRow>
    <ConfigurationMapRow>
      <ConfigurationMapLabel>
        <Trans>CRON Schedule</Trans>
      </ConfigurationMapLabel>
      <ConfigurationMapValue>{cron}</ConfigurationMapValue>
    </ConfigurationMapRow>
    <ConfigurationMapRow>
      <ConfigurationMapLabel>
        <Trans>Time Zone</Trans>
      </ConfigurationMapLabel>
      <ConfigurationMapValue>{timezone}</ConfigurationMapValue>
    </ConfigurationMapRow>
    <ConfigurationMapRow>
      <ConfigurationMapLabel>
        <Trans>Starting Deadline</Trans>
      </ConfigurationMapLabel>
      <ConfigurationMapValue>{startingDeadlineSeconds}</ConfigurationMapValue>
    </ConfigurationMapRow>
  </ConfigurationMapSection>
);

const DockerContainerSection = ({ image }) => (
  <ConfigurationMapSection>
    <ConfigurationMapHeading>
      <Trans>Docker Container</Trans>
    </ConfigurationMapHeading>
    <ConfigurationMapRow>
      <ConfigurationMapLabel>
        <Trans>Image</Trans>
      </ConfigurationMapLabel>
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
    headline={<Trans render="span">Labels</Trans>}
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
