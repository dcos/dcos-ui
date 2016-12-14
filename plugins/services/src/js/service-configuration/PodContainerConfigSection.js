import React from 'react';

import ConfigurationMapBooleanValue from '../components/ConfigurationMapBooleanValue';
import ConfigurationMapHeading from '../../../../../src/js/components/ConfigurationMapHeading';
import ConfigurationMapLabel from '../../../../../src/js/components/ConfigurationMapLabel';
import ConfigurationMapMultilineValue from '../components/ConfigurationMapMultilineValue';
import ConfigurationMapRow from '../../../../../src/js/components/ConfigurationMapRow';
import ConfigurationMapSection from '../../../../../src/js/components/ConfigurationMapSection';
import ConfigurationMapSizeValue from '../components/ConfigurationMapSizeValue';
import ConfigurationMapValue from '../../../../../src/js/components/ConfigurationMapValue';
import ConfigurationMapValueWithDefault from '../components/ConfigurationMapValueWithDefault';
import PodContainerArtifactsConfigSection from './PodContainerArtifactsConfigSection';
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
    resources: appConfig.resources || {},
    user: containerConfig.user || appConfig.user
  };

  return (
    <ConfigurationMapSection key="pod-general-section">

      {/* Heading with Icon */}
      <ConfigurationMapHeading level={3}>
        {getContainerNameWithIcon(containerConfig)}
      </ConfigurationMapHeading>

      {/* Container image goes to top */}
      <ConfigurationMapRow>
        <ConfigurationMapLabel>Container Image</ConfigurationMapLabel>
        <ConfigurationMapValueWithDefault
          defaultValue={<span>&mdash;</span>}
          value={findNestedPropertyInObject(appConfig, 'image.id')} />
      </ConfigurationMapRow>
      <ConfigurationMapRow>
        <ConfigurationMapLabel>Force pull on launch</ConfigurationMapLabel>
        <ConfigurationMapBooleanValue
          value={findNestedPropertyInObject(appConfig, 'image.forcePull')} />
      </ConfigurationMapRow>

      {/* Resources */}
      {fields.resources.cpus && (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>CPUs</ConfigurationMapLabel>
          <ConfigurationMapValue value={fields.resources.cpus} />
        </ConfigurationMapRow>
      )}
      {fields.resources.mem && (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Memory</ConfigurationMapLabel>
          <ConfigurationMapSizeValue value={fields.resources.mem} />
        </ConfigurationMapRow>
      )}
      {fields.resources.disk && (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Disk</ConfigurationMapLabel>
          <ConfigurationMapSizeValue value={fields.resources.disk} />
        </ConfigurationMapRow>
      )}
      {fields.resources.gpus && (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>GPUs</ConfigurationMapLabel>
          <ConfigurationMapValue value={fields.resources.gpus} />
        </ConfigurationMapRow>
      )}

      {/* Global Properties */}
      {fields.user && (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Run as User</ConfigurationMapLabel>
          <ConfigurationMapValue value={fields.user} />
        </ConfigurationMapRow>
      )}
      {fields.command && (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Command</ConfigurationMapLabel>
          <ConfigurationMapMultilineValue value={fields.command} />
        </ConfigurationMapRow>
      )}

      {/* Container artifacts */}
      <PodContainerArtifactsConfigSection
        artifacts={containerConfig.artifacts} />

    </ConfigurationMapSection>
  );
};
