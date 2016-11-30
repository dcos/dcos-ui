import React from 'react';

import BooleanValue from '../components/ConfigurationMapBooleanValue';
import ConfigurationMapTable from '../components/ConfigurationMapTable';
import Heading from '../../../../../src/js/components/ConfigurationMapHeading';

const BOOLEAN_OPTIONS = {
  truthy : 'TRUE',
  falsy  : 'FALSE'
};

module.exports = ({artifacts}) => {
  if (!artifacts || !artifacts.length) {
    return <noscript />;
  }

  return (
    <div>
      <Heading level={3}>Container Artifacts</Heading>

      <ConfigurationMapTable
        className="table table-simple table-break-word flush-bottom"
        columnDefaults={{
          hideIfEmpty: true
        }}
        columns={[
          {
            heading: 'Artifact URI',
            prop: 'uri'
          },
          {
            heading: 'Executable',
            prop: 'executable',
            render(prop, row) {
              return (
                <BooleanValue
                  options={BOOLEAN_OPTIONS}
                  value={row[prop]} />
              );
            }
          },
          {
            heading: 'Extract',
            prop: 'extract',
            render(prop, row) {
              return (
                <BooleanValue
                  options={BOOLEAN_OPTIONS}
                  value={row[prop]} />
              );
            }
          },
          {
            heading: 'Cache',
            prop: 'cache',
            render(prop, row) {
              return (
                <BooleanValue
                  options={BOOLEAN_OPTIONS}
                  value={row[prop]} />
              );
            }
          },
          {
            heading: 'Destination Path',
            prop: 'destPath'
          }
        ]}
        data={artifacts} />
    </div>
  );
};
