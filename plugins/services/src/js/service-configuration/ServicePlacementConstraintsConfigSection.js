import React from "react";

import ConfigurationMapTable from "../components/ConfigurationMapTable";
import ConfigurationMapHeading
  from "../../../../../src/js/components/ConfigurationMapHeading";
import ConfigurationMapSection
  from "../../../../../src/js/components/ConfigurationMapSection";
import PlacementConstraintsUtil from "../utils/PlacementConstraintsUtil";

class ServicePlacementConstraintsConfigSection extends React.Component {
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
    const constraints = this.props.appConfig.constraints || [];

    return constraints.map(function([fieldName, operator, value]) {
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

ServicePlacementConstraintsConfigSection.defaultProps = {
  appConfig: {}
};

ServicePlacementConstraintsConfigSection.propTypes = {
  appConfig: React.PropTypes.object,
  onEditClick: React.PropTypes.func
};

module.exports = ServicePlacementConstraintsConfigSection;
