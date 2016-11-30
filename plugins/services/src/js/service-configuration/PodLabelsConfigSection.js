import React from 'react';

import Heading from '../../../../../src/js/components/ConfigurationMapHeading';
import Section from '../../../../../src/js/components/ConfigurationMapSection';
import ConfigurationMapTable from '../components/ConfigurationMapTable';
import ServiceConfigDisplayUtil from '../utils/ServiceConfigDisplayUtil';

module.exports = ({appConfig}) => {
  let labels = Object.keys(appConfig.labels || {}).reduce((memo, key) => {
    memo.push({
      key: <code>{key}</code>,
      value: appConfig.labels[key],
      container: ServiceConfigDisplayUtil.getSharedIconWithLabel()
    });
    return memo;
  }, []);

  labels = (appConfig.containers || []).reduce((memo, container) => {
    return Object.keys(container.labels || {}).reduce((cvMemo, key) => {
      cvMemo.push({
        key: <code>{key}</code>,
        value: container.labels[key],
        container: ServiceConfigDisplayUtil.getContainerNameWithIcon(container)
      });
      return cvMemo;
    }, memo);
  }, labels);

  if (!labels.length) {
    return null;
  }

  return (
    <div>
      <Heading level={1}>Labels</Heading>
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
          data={labels} />

      </Section>
    </div>
  );
};
