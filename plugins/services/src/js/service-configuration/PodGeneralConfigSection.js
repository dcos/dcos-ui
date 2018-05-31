import PropTypes from "prop-types";
import React from "react";
import { MountService } from "foundation-ui";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import Units from "#SRC/js/utils/Units";
import EmptyStates from "#SRC/js/constants/EmptyStates";

import ConfigurationMapValueWithDefault from "../components/ConfigurationMapValueWithDefault";
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
    return <em>{EmptyStates.CONFIG_VALUE}</em>;
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

  let action;
  if (onEditClick) {
    action = (
      <a
        className="button button-link flush table-display-on-row-hover"
        onClick={onEditClick.bind(null, "services")}
      >
        Edit
      </a>
    );
  }

  return (
    <div>
      <ConfigurationMapHeading level={1}>Service</ConfigurationMapHeading>
      <ConfigurationMapSection key="pod-general-section">
        <MountService.Mount
          type="CreateService:ServiceConfigDisplay:Pod:General"
          appConfig={appConfig}
          onEditClick={onEditClick}
        >
          <ConfigurationMapRow>
            <ConfigurationMapLabel>Service ID</ConfigurationMapLabel>
            <ConfigurationMapValue value={appConfig.id} />
            {action}
          </ConfigurationMapRow>
          <ConfigurationMapRow>
            <ConfigurationMapLabel>Instances</ConfigurationMapLabel>
            <ConfigurationMapValueWithDefault value={fields.instances} />
            {action}
          </ConfigurationMapRow>
          <ConfigurationMapRow>
            <ConfigurationMapLabel>CPU</ConfigurationMapLabel>
            <ConfigurationMapValue>
              {getContainerResourceSummary("cpus", appConfig)}
            </ConfigurationMapValue>
            {action}
          </ConfigurationMapRow>
          <ConfigurationMapRow>
            <ConfigurationMapLabel>Memory</ConfigurationMapLabel>
            <ConfigurationMapValue>
              {getContainerResourceSummary("mem", appConfig)}
            </ConfigurationMapValue>
            {action}
          </ConfigurationMapRow>
          <ConfigurationMapRow>
            <ConfigurationMapLabel>Disk</ConfigurationMapLabel>
            <ConfigurationMapValue>
              {getContainerResourceSummary("disk", appConfig)}
            </ConfigurationMapValue>
            {action}
          </ConfigurationMapRow>
          <ConfigurationMapRow>
            <ConfigurationMapLabel>GPU</ConfigurationMapLabel>
            <ConfigurationMapValue>
              {getContainerResourceSummary("gpu", appConfig)}
            </ConfigurationMapValue>
            {action}
          </ConfigurationMapRow>
          {Boolean(fields.backoff) && (
            <ConfigurationMapRow>
              <ConfigurationMapLabel>Backoff</ConfigurationMapLabel>
              <DurationValue units="sec" value={fields.backoff} />
              {action}
            </ConfigurationMapRow>
          )}
          {Boolean(fields.backoffFactor) && (
            <ConfigurationMapRow>
              <ConfigurationMapLabel>Backoff Factor</ConfigurationMapLabel>
              <ConfigurationMapValue value={fields.backoffFactor} />
              {action}
            </ConfigurationMapRow>
          )}
          {Boolean(fields.maxLaunchDelay) && (
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                Backoff Max Launch Delay
              </ConfigurationMapLabel>
              <DurationValue units="sec" value={fields.maxLaunchDelay} />
              {action}
            </ConfigurationMapRow>
          )}
          {Boolean(fields.minimumHealthCapacity) && (
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                Upgrade Min Health Capacity
              </ConfigurationMapLabel>
              <ConfigurationMapValue value={fields.minimumHealthCapacity} />
              {action}
            </ConfigurationMapRow>
          )}
          {Boolean(fields.maximumOverCapacity) && (
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                Upgrade Max Overcapacity
              </ConfigurationMapLabel>
              <ConfigurationMapValue value={fields.maximumOverCapacity} />
              {action}
            </ConfigurationMapRow>
          )}
        </MountService.Mount>
      </ConfigurationMapSection>
    </div>
  );
};

PodGeneralConfigSection.propTypes = {
  onEditClick: PropTypes.func
};

module.exports = PodGeneralConfigSection;
