import React from 'react';

import BooleanValue from '../components/ConfigurationMapBooleanValue';
import Heading from '../../../../../src/js/components/ConfigurationMapHeading';
import Label from '../../../../../src/js/components/ConfigurationMapLabel';
import MultilineValue from '../components/ConfigurationMapMultilineValue';
import PodContainerArtifactsConfigSection from './PodContainerArtifactsConfigSection';
import Row from '../../../../../src/js/components/ConfigurationMapRow';
import Section from '../../../../../src/js/components/ConfigurationMapSection';
import SizeValue from '../components/ConfigurationMapSizeValue';
import Value from '../../../../../src/js/components/ConfigurationMapValue';
import ValueWithDefault from '../components/ConfigurationMapValueWithDefault';
import {findNestedPropertyInObject} from '../../../../../src/js/utils/Util';
import {getContainerNameWithIcon} from '../utils/ServiceConfigDisplayUtil';

function getCommand(containerConfig) {
  if (containerConfig.exec && containerConfig.exec.command) {
    if (containerConfig.exec.command.shell) {
      return containerConfig.exec.command.shell;
    } else if (containerConfig.exec.command.argv) {
      return containerConfig.exec.command.argv.join(' ');
    }
  }

  return null;
}

module.exports = ({containerConfig, appConfig}) => {
  let fields = {
    command: getCommand(containerConfig),
    resources: containerConfig.resources || {},
    user: containerConfig.user || appConfig.user
  };

  return (
    <Section key="pod-general-section">

      {/* Heading with Icon */}
      <Heading level={3}>
        {getContainerNameWithIcon(containerConfig)}
      </Heading>

      {/* Container image goes to top */}
      <Row>
        <Label>Container Image</Label>
        <ValueWithDefault
          defaultValue={<span>&mdash;</span>}
          value={findNestedPropertyInObject(appConfig, 'image.id')} />
      </Row>
      <Row>
        <Label>Force pull on launch</Label>
        <BooleanValue
          value={findNestedPropertyInObject(appConfig, 'image.forcePull')} />
      </Row>

      {/* Resources */}
      {!!fields.resources.cpus && (
        <Row>
          <Label>CPUs</Label>
          <Value value={fields.resources.cpus} />
        </Row>
      )}
      {!!fields.resources.mem && (
        <Row>
          <Label>Memory</Label>
          <SizeValue value={fields.resources.mem} />
        </Row>
      )}
      {!!fields.resources.disk && (
        <Row>
          <Label>Disk</Label>
          <SizeValue value={fields.resources.disk} />
        </Row>
      )}
      {!!fields.resources.gpus && (
        <Row>
          <Label>GPUs</Label>
          <Value value={fields.resources.gpus} />
        </Row>
      )}

      {/* Global Properties */}
      {!!fields.user && (
        <Row>
          <Label>Run as User</Label>
          <Value value={fields.user} />
        </Row>
      )}
      {!!fields.command && (
        <Row>
          <Label>Command</Label>
          <MultilineValue value={fields.command} />
        </Row>
      )}

      {/* Container artifacts */}
      <PodContainerArtifactsConfigSection
        artifacts={containerConfig.artifacts} />

    </Section>
  );
};
