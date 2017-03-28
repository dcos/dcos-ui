import React from 'react';

import {
  getSharedIconWithLabel,
  getContainerNameWithIcon
} from '../utils/ServiceConfigDisplayUtil';
import ConfigurationMapTable from '../components/ConfigurationMapTable';
import ConfigurationMapHeading from '../../../../../src/js/components/ConfigurationMapHeading';
import ConfigurationMapSection from '../../../../../src/js/components/ConfigurationMapSection';

const columns = [
  {
    heading: 'Key',
    prop: 'key'
  },
  {
    heading: 'Value',
    prop: 'value'
  },
  {
    heading: 'Container',
    prop: 'container'
  }
];

const PodEnvironmentVariablesConfigSection = ({appConfig, onEditClick}) => {
  const {env = {}, containers = []} = appConfig;

  if (!env || !containers) {
    return <noscript />;
  }

  let combinedEnv = Object.keys(env).reduce((memo, key) => {
    memo.push({
      key: <code>{key}</code>,
      value: env[key],
      container: getSharedIconWithLabel()
    });

    return memo;
  }, []);

  combinedEnv = containers.reduce((memo, container) => {
    const {env = {}} = container;

    return Object.keys(env).reduce((cvMemo, key) => {
      cvMemo.push({
        key: <code>{key}</code>,
        value: env[key],
        container: getContainerNameWithIcon(container)
      });

      return cvMemo;
    }, memo);
  }, combinedEnv);

  if (!combinedEnv.length) {
    return <noscript />;
  }

  return (
    <div>
      <ConfigurationMapHeading level={1}>
        Environment Variables
      </ConfigurationMapHeading>
      <ConfigurationMapSection key="pod-general-section">
        <ConfigurationMapTable
          columnDefaults={{hideIfEmpty: true}}
          columns={columns}
          data={combinedEnv}
          onEditClick={onEditClick}
          tabViewID="multienvironment" />
      </ConfigurationMapSection>
    </div>
  );
};

PodEnvironmentVariablesConfigSection.propTypes = {
  onEditClick: React.PropTypes.func
};

module.exports = PodEnvironmentVariablesConfigSection;
