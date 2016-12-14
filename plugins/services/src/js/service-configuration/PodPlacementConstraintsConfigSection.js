import React from 'react';

import {findNestedPropertyInObject} from '../../../../../src/js/utils/Util';
import ConfigurationMapTable from '../components/ConfigurationMapTable.js';
import Heading from '../../../../../src/js/components/ConfigurationMapHeading';
import Section from '../../../../../src/js/components/ConfigurationMapSection';

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
        <Heading level={3}>Placement Constraints</Heading>
        <Section>
          <ConfigurationMapTable
            className="table table-simple table-break-word table-fixed-layout flush-bottom"
            columns={this.getColumns()}
            columnDefaults={{
              hideIfempty: true,
              placeholder: <span>&mdash;</span>
            }}
            data={constraints} />
        </Section>
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
