import { Trans } from "@lingui/macro";
import * as React from "react";
import PropTypes from "prop-types";

import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";

import ConfigurationMapTable from "#PLUGINS/services/src/js/components/ConfigurationMapTable";

class AdvancedConstraintsSection extends React.Component {
  static defaultProps = {
    constraints: [],
    onEditClick() {},
  };
  static propTypes = {
    constraints: PropTypes.array,
    onEditClick: PropTypes.func,
  };
  getColumns() {
    return [
      {
        heading: <Trans render="span">Operator</Trans>,
        prop: "operator",
      },
      {
        heading: <Trans render="span">Field Name</Trans>,
        prop: "fieldName",
      },
      {
        heading: <Trans render="span">Value</Trans>,
        prop: "value",
      },
    ];
  }

  render() {
    const { constraints, onEditClick } = this.props;

    if (!constraints.length) {
      return <noscript />;
    }

    return (
      <ConfigurationMapSection>
        <ConfigurationMapTable
          columns={this.getColumns()}
          data={constraints}
          onEditClick={onEditClick}
          tabViewID="services"
        />
      </ConfigurationMapSection>
    );
  }
}

export default AdvancedConstraintsSection;
