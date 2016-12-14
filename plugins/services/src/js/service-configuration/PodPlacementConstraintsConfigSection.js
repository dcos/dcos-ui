import React from 'react';

import {findNestedPropertyInObject} from '../../../../../src/js/utils/Util';
import ConfigurationMapTable from '../components/ConfigurationMapTable.js';
import ConfigurationMapHeading from '../../../../../src/js/components/ConfigurationMapHeading';
import ConfigurationMapSection from '../../../../../src/js/components/ConfigurationMapSection';

class PodPlacementConstraintsConfigSection extends React.Component {
  getColumns() {
    return [
      {
        heading: 'Label',
        prop: 'fieldName'
      },
      {
        heading: 'Operator',
        prop: 'operator'
      },
      {
        heading: 'Value',
        prop: 'value',
        hideIfempty: true
      }
    ];
  }

  render() {
    let constraints = findNestedPropertyInObject(
      this.props.appConfig,
      'scheduling.placement.constraints'
    );

    // Since we are stateless component we will need to return something for react
    // so we are using the `<noscript>` tag as placeholder.
    if (!constraints || !constraints.length) {
      return <noscript />;
    }

    return (
      <div>
        <ConfigurationMapHeading level={3}>
          Placement Constraints
        </ConfigurationMapHeading>
        <ConfigurationMapSection>
          <ConfigurationMapTable
            className="table table-simple table-align-top table-break-word table-fixed-layout flush-bottom"
            columns={this.getColumns()}
            columnDefaults={{
              hideIfempty: true,
              placeholder: <span>&mdash;</span>
            }}
            data={constraints} />
        </ConfigurationMapSection>
      </div>
    );
  }
};

PodPlacementConstraintsConfigSection.defaultProps = {
  appConfig: {}
};

PodPlacementConstraintsConfigSection.propTypes = {
  appConfig: React.PropTypes.object
};

module.exports = PodPlacementConstraintsConfigSection;
