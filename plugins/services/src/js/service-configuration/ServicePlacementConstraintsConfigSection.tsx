import PropTypes from "prop-types";
import * as React from "react";
import { MountService } from "foundation-ui";
import { Trans } from "@lingui/macro";

import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";

import ConfigurationMapTable from "../components/ConfigurationMapTable";
import PlacementConstraintsUtil from "../utils/PlacementConstraintsUtil";

export default class ServicePlacementConstraintsConfigSection extends React.Component {
  static defaultProps = {
    appConfig: {}
  };
  static propTypes = {
    appConfig: PropTypes.object,
    onEditClick: PropTypes.func
  };
  getColumns() {
    return [
      {
        heading() {
          return <Trans render="span">Operator</Trans>;
        },
        prop: "operator"
      },
      {
        heading() {
          return <Trans render="span">Field Name</Trans>;
        },
        prop: "fieldName"
      },
      {
        heading() {
          return <Trans render="span">Value</Trans>;
        },
        prop: "value"
      }
    ];
  }

  getConstraints() {
    const constraints = this.props.appConfig.constraints || [];

    return constraints.map(([fieldName, operator, value]) => {
      if (PlacementConstraintsUtil.requiresEmptyValue(operator)) {
        value = <Trans render="em">Not Applicable</Trans>;
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
        <Trans render={<ConfigurationMapHeading level={1} />}>Placement</Trans>
        <ConfigurationMapSection>
          <MountService.Mount
            type="CreateService:ServiceConfigDisplay:App:PlacementConstraints"
            appConfig={this.props.appConfig}
            onEditClick={onEditClick}
          >
            <ConfigurationMapTable
              columns={this.getColumns()}
              data={constraints}
              onEditClick={onEditClick}
              tabViewID="services"
            />
          </MountService.Mount>
        </ConfigurationMapSection>
      </div>
    );
  }
}
