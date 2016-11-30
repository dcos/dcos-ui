import React from 'react';

import Heading from '../../../../../src/js/components/ConfigurationMapHeading';
import Section from '../../../../../src/js/components/ConfigurationMapSection';
import ConfigurationMapTable from '../components/ConfigurationMapTable';
import ServiceConfigDisplayUtil from '../utils/ServiceConfigDisplayUtil';

module.exports = ({appConfig}) => {
  let envVars = Object.keys(appConfig.environment || {}).reduce((memo, key) => {
    memo.push({
      key: <code>{key}</code>,
      value: appConfig.environment[key],
      container: ServiceConfigDisplayUtil.getSharedIconWithLabel()
    });
    return memo;
  }, []);

  envVars = (appConfig.containers || []).reduce((memo, container) => {
    return Object.keys(container.environment || {}).reduce((cvMemo, key) => {
      cvMemo.push({
        key: <code>{key}</code>,
        value: container.environment[key],
        container: ServiceConfigDisplayUtil.getContainerNameWithIcon(container)
      });
      return cvMemo;
    }, memo);
  }, envVars);

  if (!envVars.length) {
    return null;
  }

  return (
    <div>
      <Heading level={1}>Environment Variables</Heading>
      <Section key="pod-general-section">

        <ConfigurationMapTable
          className="table table-simple table-break-word flush-bottom"
          columnDefaults={{
            hideIfEmpty: true
          }}
          columns={[
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
          ]}
          data={envVars} />

      </Section>
    </div>
  );
};
