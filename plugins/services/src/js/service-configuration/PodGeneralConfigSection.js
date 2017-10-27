import React from "react";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import ConfigurationMapHeading
  from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection
  from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import Units from "#SRC/js/utils/Units";

import ConfigurationMapAction from "../components/ConfigurationMapAction";
import ConfigurationMapValueWithDefault
  from "../components/ConfigurationMapValueWithDefault";
import DurationValue from "../components/ConfigurationMapDurationValue";

/**
 * Summarize the resources of every container, including the containers and
 * their values in a comma-separated list after the value.
 *
 * @param {String} resource - The name of the resource in the field
 * @param {Object} appConfig - The application configuration
 * @returns {Node|String} Returns the contents to be rendered
 */
function getContainerResourceSummary(resource, { containers = [] }) {
  const summary = containers.reduce(
    (memo, { name, resources = {} }) => {
      const value = resources[resource];
      if (value) {
        memo.value += value;
        memo.parts.push(`${Units.formatResource(resource, value)} ${name}`);
      }

      return memo;
    },
    { value: 0, parts: [] }
  );

  if (!summary.value) {
    return <em>Not Supported</em>;
  }

  return (
    `${Units.formatResource(resource, summary.value)} ` +
    `(${summary.parts.join(", ")})`
  );
}

/**
 * Get the number of instances defined in the scaling policy,
 * including additional information if needed (ex. maxInstances)
 *
 * @param {Object} appConfig - The application configuration
 * @returns {String|null} Returns the expression to render or null if unknown
 *                        scaling policy
 */
function getInstances(appConfig) {
  if (appConfig.scaling && appConfig.scaling.kind === "fixed") {
    let expr = `${appConfig.scaling.instances}`;
    if (appConfig.scaling.maxInstances) {
      expr += ` (Max ${appConfig.scaling.maxInstances})`;
    }

    return expr;
  }

  return null;
}

const PodGeneralConfigSection = ({ appConfig, onEditClick }) => {
  const fields = {
    instances: getInstances(appConfig),
    backoff: findNestedPropertyInObject(
      appConfig,
      "scheduling.backoff.backoff"
    ),
    backoffFactor: findNestedPropertyInObject(
      appConfig,
      "scheduling.backoff.backoffFactor"
    ),
    maxLaunchDelay: findNestedPropertyInObject(
      appConfig,
      "scheduling.backoff.maxLaunchDelay"
    ),
    minimumHealthCapacity: findNestedPropertyInObject(
      appConfig,
      "scheduling.upgrade.minimumHealthCapacity"
    ),
    maximumOverCapacity: findNestedPropertyInObject(
      appConfig,
      "scheduling.upgrade.maximumOverCapacity"
    )
  };

  return (
    <div>
      <ConfigurationMapHeading level={1}>General</ConfigurationMapHeading>
      <ConfigurationMapSection key="pod-general-section">
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Service ID</ConfigurationMapLabel>
          <ConfigurationMapValue value={appConfig.id} />
          <ConfigurationMapAction
            onClick={onEditClick.bind(this, "services")}
            isHover={true}
          >
            Edit
          </ConfigurationMapAction>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Instances</ConfigurationMapLabel>
          <ConfigurationMapValueWithDefault value={fields.instances} />
          <ConfigurationMapAction
            onClick={onEditClick.bind(this, "services")}
            isHover={true}
          >
            Edit
          </ConfigurationMapAction>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>CPU</ConfigurationMapLabel>
          <ConfigurationMapValue>
            {getContainerResourceSummary("cpus", appConfig)}
          </ConfigurationMapValue>
          <ConfigurationMapAction
            onClick={onEditClick.bind(this, "services")}
            isHover={true}
          >
            Edit
          </ConfigurationMapAction>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Memory</ConfigurationMapLabel>
          <ConfigurationMapValue>
            {getContainerResourceSummary("mem", appConfig)}
          </ConfigurationMapValue>
          <ConfigurationMapAction
            onClick={onEditClick.bind(this, "services")}
            isHover={true}
          >
            Edit
          </ConfigurationMapAction>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Disk</ConfigurationMapLabel>
          <ConfigurationMapValue>
            {getContainerResourceSummary("disk", appConfig)}
          </ConfigurationMapValue>
          <ConfigurationMapAction
            onClick={onEditClick.bind(this, "services")}
            isHover={true}
          >
            Edit
          </ConfigurationMapAction>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>GPU</ConfigurationMapLabel>
          <ConfigurationMapValue>
            {getContainerResourceSummary("gpu", appConfig)}
          </ConfigurationMapValue>
          <ConfigurationMapAction
            onClick={onEditClick.bind(this, "services")}
            isHover={true}
          >
            Edit
          </ConfigurationMapAction>
        </ConfigurationMapRow>
        {Boolean(fields.backoff) &&
          <ConfigurationMapRow>
            <ConfigurationMapLabel>Backoff</ConfigurationMapLabel>
            <DurationValue units="sec" value={fields.backoff} />
            <ConfigurationMapAction
              onClick={onEditClick.bind(this, "services")}
              isHover={true}
            >
              Edit
            </ConfigurationMapAction>
          </ConfigurationMapRow>}
        {Boolean(fields.backoffFactor) &&
          <ConfigurationMapRow>
            <ConfigurationMapLabel>Backoff Factor</ConfigurationMapLabel>
            <ConfigurationMapValue value={fields.backoffFactor} />
            <ConfigurationMapAction
              onClick={onEditClick.bind(this, "services")}
              isHover={true}
            >
              Edit
            </ConfigurationMapAction>
          </ConfigurationMapRow>}
        {Boolean(fields.maxLaunchDelay) &&
          <ConfigurationMapRow>
            <ConfigurationMapLabel>
              Backoff Max Launch Delay
            </ConfigurationMapLabel>
            <DurationValue units="sec" value={fields.maxLaunchDelay} />
            <ConfigurationMapAction
              onClick={onEditClick.bind(this, "services")}
              isHover={true}
            >
              Edit
            </ConfigurationMapAction>
          </ConfigurationMapRow>}
        {Boolean(fields.minimumHealthCapacity) &&
          <ConfigurationMapRow>
            <ConfigurationMapLabel>
              Upgrade Min Health Capacity
            </ConfigurationMapLabel>
            <ConfigurationMapValue value={fields.minimumHealthCapacity} />
            <ConfigurationMapAction
              onClick={onEditClick.bind(this, "services")}
              isHover={true}
            >
              Edit
            </ConfigurationMapAction>
          </ConfigurationMapRow>}
        {Boolean(fields.maximumOverCapacity) &&
          <ConfigurationMapRow>
            <ConfigurationMapLabel>
              Upgrade Max Overcapacity
            </ConfigurationMapLabel>
            <ConfigurationMapValue value={fields.maximumOverCapacity} />
            <ConfigurationMapAction
              onClick={onEditClick.bind(this, "services")}
              isHover={true}
            >
              Edit
            </ConfigurationMapAction>
          </ConfigurationMapRow>}
      </ConfigurationMapSection>
    </div>
  );
};

PodGeneralConfigSection.propTypes = {
  onEditClick: React.PropTypes.func
};

module.exports = PodGeneralConfigSection;
