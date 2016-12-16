import React from 'react';

import ConfigurationMapBooleanValue from '../components/ConfigurationMapBooleanValue';
import ConfigurationMapTable from '../components/ConfigurationMapTable';
import ConfigurationMapHeading from '../../../../../src/js/components/ConfigurationMapHeading';

const BOOLEAN_OPTIONS = {
  truthy : 'TRUE',
  falsy  : 'FALSE'
};

class PodContainerArtifactsConfigSection extends React.Component {
  getColumns() {
    return [
      {
        heading: 'Artifact URI',
        prop: 'uri'
      },
      {
        heading: 'Executable',
        prop: 'executable',
        render(prop, row) {
          return (
            <ConfigurationMapBooleanValue
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
            <ConfigurationMapBooleanValue
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
            <ConfigurationMapBooleanValue
              options={BOOLEAN_OPTIONS}
              value={row[prop]} />
          );
        }
      },
      {
        heading: 'Destination Path',
        prop: 'destPath'
      }
    ];
  }

  render() {
    const {artifacts} = this.props;

    if (!artifacts || !artifacts.length) {
      return <noscript />;
    }

    return (
      <div>
        <ConfigurationMapHeading level={3}>
          Container Artifacts
        </ConfigurationMapHeading>
        <ConfigurationMapTable
          className="table table-simple table-align-top table-break-word flush-bottom"
          columnDefaults={{hideIfEmpty: true}}
          columns={this.getColumns()}
          data={artifacts} />
      </div>
    );
  }
};

PodContainerArtifactsConfigSection.defaultProps = {
  artifacts: []
};

PodContainerArtifactsConfigSection.propTypes = {
  artifacts: React.PropTypes.array
};

module.exports = PodContainerArtifactsConfigSection;
