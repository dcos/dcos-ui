import React from 'react';

import ConfigurationMapEditAction from '../components/ConfigurationMapEditAction';
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

const PodContainerConfigSection = ({containerConfig, appConfig, onEditClick}) => {
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
          value={findNestedPropertyInObject(appConfig, 'image.id')} />
        <ConfigurationMapEditAction
          onEditClick={onEditClick}
          tabViewID="services" />
      </ConfigurationMapRow>
      <ConfigurationMapRow>
        <ConfigurationMapLabel>Force pull on launch</ConfigurationMapLabel>
        <ConfigurationMapBooleanValue
          value={findNestedPropertyInObject(appConfig, 'image.forcePull')} />
        <ConfigurationMapEditAction
          onEditClick={onEditClick}
          tabViewID="services" />
      </ConfigurationMapRow>

      {/* Resources */}
      {fields.resources.cpus && (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>CPUs</ConfigurationMapLabel>
          <ConfigurationMapValue value={fields.resources.cpus} />
          <ConfigurationMapEditAction
            onEditClick={onEditClick}
            tabViewID="services" />
        </ConfigurationMapRow>
      )}
      {fields.resources.mem && (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Memory</ConfigurationMapLabel>
          <ConfigurationMapSizeValue value={fields.resources.mem} />
          <ConfigurationMapEditAction
            onEditClick={onEditClick}
            tabViewID="services" />
        </ConfigurationMapRow>
      )}
      {fields.resources.disk && (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Disk</ConfigurationMapLabel>
          <ConfigurationMapSizeValue value={fields.resources.disk} />
          <ConfigurationMapEditAction
            onEditClick={onEditClick}
            tabViewID="services" />
        </ConfigurationMapRow>
      )}
      {fields.resources.gpus && (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>GPUs</ConfigurationMapLabel>
          <ConfigurationMapValue value={fields.resources.gpus} />
          <ConfigurationMapEditAction
            onEditClick={onEditClick}
            tabViewID="services" />
        </ConfigurationMapRow>
      )}

      {/* Global Properties */}
      {fields.user && (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Run as User</ConfigurationMapLabel>
          <ConfigurationMapValue value={fields.user} />
          <ConfigurationMapEditAction
            onEditClick={onEditClick}
            tabViewID="services" />
        </ConfigurationMapRow>
      )}
      {fields.command && (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>Command</ConfigurationMapLabel>
          <ConfigurationMapMultilineValue value={fields.command} />
          <ConfigurationMapEditAction
            onEditClick={onEditClick}
            tabViewID="services" />
        </ConfigurationMapRow>
      )}

      {/* Container artifacts */}
      <PodContainerArtifactsConfigSection
        artifacts={containerConfig.artifacts}
        onEditClick={onEditClick}
        tabViewID="services" />

    </ConfigurationMapSection>
  );
};

PodContainerConfigSection.propTypes = {
  onEditClick: React.PropTypes.func
};

module.exports = PodContainerConfigSection;
