import React from 'react';

import ConfigurationMapTable from '../components/ConfigurationMapTable';
import Heading from '../../../../../src/js/components/ConfigurationMapHeading';
import Section from '../../../../../src/js/components/ConfigurationMapSection';
import ServiceConfigDisplayUtil from '../utils/ServiceConfigDisplayUtil';

module.exports = ({appConfig}) => {
  let {environment={}, containers=[]} = appConfig;

  let combinedEnv = Object.keys(environment).reduce((memo, key) => {
    memo.push({
      key: <code>{key}</code>,
      value: environment[key],
      container: ServiceConfigDisplayUtil.getSharedIconWithLabel()
    });

    return memo;
  }, []);

  combinedEnv = containers.reduce((memo, container) => {
    let {environment={}} = container;
    
    return Object.keys(environment).reduce((cvMemo, key) => {
      cvMemo.push({
        key: <code>{key}</code>,
        value: environment[key],
        container: ServiceConfigDisplayUtil.getContainerNameWithIcon(container)
      });

      return cvMemo;
    }, memo);
  }, combinedEnv);

  if (!combinedEnv.length) {
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
          data={combinedEnv} />

      </Section>
    </div>
  );
};
