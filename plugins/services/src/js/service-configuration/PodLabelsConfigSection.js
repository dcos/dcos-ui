import React from 'react';

import ConfigurationMapTable from '../components/ConfigurationMapTable';
import Heading from '../../../../../src/js/components/ConfigurationMapHeading';
import Section from '../../../../../src/js/components/ConfigurationMapSection';
import ServiceConfigDisplayUtil from '../utils/ServiceConfigDisplayUtil';

module.exports = ({appConfig}) => {
  let {labels={}, containers=[]} = appConfig;

  let combinedLabels = Object.keys(labels).reduce((memo, key) => {
    memo.push({
      key: <code>{key}</code>,
      value: labels[key],
      container: ServiceConfigDisplayUtil.getSharedIconWithLabel()
    });

    return memo;
  }, []);

  combinedLabels = containers.reduce((memo, container) => {
    let {labels={}} = container;
    return Object.keys(labels).reduce((cvMemo, key) => {
      cvMemo.push({
        key: <code>{key}</code>,
        value: labels[key],
        container: ServiceConfigDisplayUtil.getContainerNameWithIcon(container)
      });

      return cvMemo;
    }, memo);
  }, combinedLabels);

  if (!combinedLabels.length) {
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
          data={combinedLabels} />

      </Section>
    </div>
  );
};
