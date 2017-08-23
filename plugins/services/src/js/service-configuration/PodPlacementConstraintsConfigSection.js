/* @flow */
import React from "react";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import ConfigurationMapHeading
  from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapSection
  from "#SRC/js/components/ConfigurationMapSection";

import ConfigurationMapTable from "../components/ConfigurationMapTable";
import PlacementConstraintsUtil from "../utils/PlacementConstraintsUtil";

type Props = {
  appConfig?: Object,
  onEditClick?: Function,
};

class PodPlacementConstraintsConfigSection extends React.Component {

  getColumns() {
    return [
      {
        heading: "Field Name",
        prop: "fieldName"
      },
      {
        heading: "Operator",
        prop: "operator"
      },
      {
        heading: "Value",
        prop: "value"
      }
    ];
  }

  getConstraints() {
    const constraints = findNestedPropertyInObject(
      this.props.appConfig,
      "scheduling.placement.constraints"
    ) || [];

    return constraints.map(function({ fieldName, operator, value }) {
      if (PlacementConstraintsUtil.requiresEmptyValue(operator)) {
        value = <em>Not Applicable</em>;
      }

      return { fieldName, operator, value };
    });
  }

  render() {
    const { onEditClick } = this.props;
    const constraints = this.getConstraints();
    // Since we are stateless component we will need to return something for react
    // so we are using the `<noscript>` tag as placeholder.
    if (!constraints.length) {
      return <noscript />;
    }

    return (
      <div>
        <ConfigurationMapHeading level={3}>
          Placement Constraints
        </ConfigurationMapHeading>
        <ConfigurationMapSection>
          <ConfigurationMapTable
            columns={this.getColumns()}
            data={constraints}
            onEditClick={onEditClick}
            tabViewID="services"
          />
        </ConfigurationMapSection>
      </div>
    );
  }
}

PodPlacementConstraintsConfigSection.defaultProps = {
  appConfig: {}
};

module.exports = PodPlacementConstraintsConfigSection;
