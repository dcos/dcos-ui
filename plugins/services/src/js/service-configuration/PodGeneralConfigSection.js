import React from 'react';

import ConfigurationMapHeading from '../../../../../src/js/components/ConfigurationMapHeading';
import ConfigurationMapLabel from '../../../../../src/js/components/ConfigurationMapLabel';
import ConfigurationMapRow from '../../../../../src/js/components/ConfigurationMapRow';
import ConfigurationMapSection from '../../../../../src/js/components/ConfigurationMapSection';
import ConfigurationMapValue from '../../../../../src/js/components/ConfigurationMapValue';
import ConfigurationMapValueWithDefault from '../components/ConfigurationMapValueWithDefault';
import DurationValue from '../components/ConfigurationMapDurationValue';
import Units from '../../../../../src/js/utils/Units';
import {findNestedPropertyInObject} from '../../../../../src/js/utils/Util';

/**
 * Summarize the resources of every container, including the containers and
 * their values in a comma-separated list after the value.
 *
 * @param {String} resource - The name of the resource in the field
 * @param {Object} appConfig - The application configuration
 * @returns {Node|String} Returns the contents to be rendererd
 */
function getContainerResourceSummary(resource, {containers = []}) {
  let summary = containers.reduce((memo, {name, resources = {}}) => {
    let value = resources[resource];
    if (value) {
      memo.value += value;
      memo.parts.push(
        `${Units.formatResource(resource, value)} ${name}`
      );
    }
    memo.value += resources[resource] || 0;

    return memo;
  }, {value: 0, parts: []});

  if (!summary.value) {
    return <em>Not Supported</em>;
  }

  return `${Units.formatResource(resource, summary.value)} `+
   `(${summary.parts.join(', ')})`;
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
  if (appConfig.scaling && appConfig.scaling.kind === 'fixed') {
    let expr = `${appConfig.scaling.instances}`;
    if (appConfig.scaling.maxInstances) {
      expr += ` (Max ${appConfig.scaling.maxInstances})`;
    }

    return expr;
  }

  return null;
}

module.exports = ({appConfig}) => {
  let fields = {
    instances: getInstances(appConfig),
    backoff: findNestedPropertyInObject(appConfig,
      'scheduling.backoff.backoff'),
    backoffFactor: findNestedPropertyInObject(appConfig,
      'scheduling.backoff.backoffFactor'),
    maxLaunchDelay: findNestedPropertyInObject(appConfig,
      'scheduling.backoff.maxLaunchDelay'),
    minimumHealthCapacity: findNestedPropertyInObject(appConfig,
      'scheduling.upgrade.minimumHealthCapacity'),
    maximumOverCapacity: findNestedPropertyInObject(appConfig,
      'scheduling.upgrade.maximumOverCapacity')
  };

  return (
    <div>
      <ConfigurationMapHeading level={1}>General</ConfigurationMapHeading>
      <ConfigurationMapSection key="pod-general-section">
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Service ID</ConfigurationMapLabel>
          <ConfigurationMapValue value={appConfig.id} />
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Instances</ConfigurationMapLabel>
          <ConfigurationMapValueWithDefault value={fields.instances} />
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>CPU</ConfigurationMapLabel>
          <ConfigurationMapValue>
            {getContainerResourceSummary('cpus', appConfig)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Memory</ConfigurationMapLabel>
          <ConfigurationMapValue>
            {getContainerResourceSummary('mem', appConfig)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Disk</ConfigurationMapLabel>
          <ConfigurationMapValue>
            {getContainerResourceSummary('disk', appConfig)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>GPU</ConfigurationMapLabel>
          <ConfigurationMapValue>
            {getContainerResourceSummary('gpu', appConfig)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        {fields.backoff && (
          <ConfigurationMapRow>
            <ConfigurationMapLabel>Backoff</ConfigurationMapLabel>
            <DurationValue
              units="sec"
              value={fields.backoff} />
          </ConfigurationMapRow>
        )}
        {fields.backoffFactor && (
          <ConfigurationMapRow>
            <ConfigurationMapLabel>Backoff Factor</ConfigurationMapLabel>
            <ConfigurationMapValue value={fields.backoffFactor} />
          </ConfigurationMapRow>
        )}
        {fields.maxLaunchDelay && (
          <ConfigurationMapRow>
            <ConfigurationMapLabel>
              Backoff Max Launch Delay
            </ConfigurationMapLabel>
            <DurationValue
              units="sec"
              value={fields.maxLaunchDelay} />
          </ConfigurationMapRow>
        )}
        {fields.minimumHealthCapacity && (
          <ConfigurationMapRow>
            <ConfigurationMapLabel>
              Upgrade Min Health Capacity
            </ConfigurationMapLabel>
            <ConfigurationMapValue value={fields.minimumHealthCapacity} />
          </ConfigurationMapRow>
        )}
        {fields.maximumOverCapacity && (
          <ConfigurationMapRow>
            <ConfigurationMapLabel>
              Upgrade Max Overcapacity
            </ConfigurationMapLabel>
            <ConfigurationMapValue value={fields.maximumOverCapacity} />
          </ConfigurationMapRow>
        )}
      </ConfigurationMapSection>
    </div>
  );
};
