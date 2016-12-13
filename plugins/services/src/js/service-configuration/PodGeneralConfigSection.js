import React from 'react';

import {findNestedPropertyInObject} from '../../../../../src/js/utils/Util';
import DurationValue from '../components/ConfigurationMapDurationValue';
import Heading from '../../../../../src/js/components/ConfigurationMapHeading';
import Label from '../../../../../src/js/components/ConfigurationMapLabel';
import Row from '../../../../../src/js/components/ConfigurationMapRow';
import Section from '../../../../../src/js/components/ConfigurationMapSection';
import Units from '../../../../../src/js/utils/Units';
import Value from '../../../../../src/js/components/ConfigurationMapValue';
import ValueWithDefault from '../components/ConfigurationMapValueWithDefault';

/**
 * Summarize the resources of every container, including the containers and
 * their values in a comma-separated list after the value.
 *
 * @param {String} resource - The name of the resource in the field
 * @param {Object} appConfig - The application configuration
 * @returns {Node|String} Returns the contents to be rendererd
 */
function getContainerResourceSummary(resource, {containers=[]}) {
  let summary = containers.reduce((memo, {name, resources={}}) => {
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
      <Heading level={1}>General</Heading>
      <Section key="pod-general-section">
        <Row>
          <Label>Service ID</Label>
          <Value value={appConfig.id} />
        </Row>
        <Row>
          <Label>Instances</Label>
          <ValueWithDefault value={fields.instances} />
        </Row>
        <Row>
          <Label>CPU</Label>
          <Value>{getContainerResourceSummary('cpus', appConfig)}</Value>
        </Row>
        <Row>
          <Label>Memory</Label>
          <Value>{getContainerResourceSummary('mem', appConfig)}</Value>
        </Row>
        <Row>
          <Label>Disk</Label>
          <Value>{getContainerResourceSummary('disk', appConfig)}</Value>
        </Row>
        <Row>
          <Label>GPU</Label>
          <Value>{getContainerResourceSummary('gpu', appConfig)}</Value>
        </Row>
        {(fields.backoff != null && fields.backoff > 0) && (
          <Row>
            <Label>Backoff</Label>
            <DurationValue
              units="sec"
              value={fields.backoff} />
          </Row>
        )}
        {(fields.backoffFactor != null && fields.backoffFactor > 0) && (
          <Row>
            <Label>Backoff Factor</Label>
            <Value value={fields.backoffFactor} />
          </Row>
        )}
        (fields.maxLaunchDelay != null && fields.maxLaunchDelay > 0) && (
          <Row>
            <Label>Backoff Max Launch Delay</Label>
            <DurationValue
              units="sec"
              value={fields.maxLaunchDelay} />
          </Row>
        )}
        {(fields.minimumHealthCapacity != null &&
          fields.minimumHealthCapacity > 0) && (
          <Row>
            <Label>Upgrade Min Health Capacity</Label>
            <Value value={fields.minimumHealthCapacity} />
          </Row>
        )}
        {(fields.maximumOverCapacity != null &&
          fields.maximumOverCapacity > 0) && (
          <Row>
            <Label>Upgrade Max Overcapacity</Label>
            <Value value={fields.maximumOverCapacity} />
          </Row>
        )}
      </Section>
    </div>
  );
};
