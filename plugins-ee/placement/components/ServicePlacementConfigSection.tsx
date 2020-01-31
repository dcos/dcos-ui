import { Trans } from "@lingui/macro";
import * as React from "react";
import PropTypes from "prop-types";

import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";

import PlacementConstraintsUtil from "#PLUGINS/services/src/js/utils/PlacementConstraintsUtil";

import { isRegionConstraint, isZoneConstraint } from "../utils/PlacementUtil";
import AdvancedConstraintsSection from "./AdvancedConstraintsSection";
import RegionConstraintsSection from "./RegionConstraintsSection";
import ZoneConstraintsSection from "./ZoneConstraintsSection";

class ServicePlacementConfigSection extends React.Component {
  static propTypes = {
    appConfig: PropTypes.object,
    onEditClick: PropTypes.func
  };
  getConstraints() {
    return this.props.appConfig.constraints || [];
  }

  getAdvancedConstraints(constraints) {
    return constraints
      .filter(
        ([fieldName, operator]) =>
          !isRegionConstraint(fieldName, operator) &&
          !isZoneConstraint(fieldName, operator)
      )
      .map(([fieldName, operator, value]) => {
        if (PlacementConstraintsUtil.requiresEmptyValue(operator)) {
          value = <Trans render="em">Not Applicable</Trans>;
        }

        return { fieldName, operator, value };
      });
  }

  getRegion(constraints) {
    const region = constraints.find(([fieldName, operator]) =>
      isRegionConstraint(fieldName, operator)
    );

    return region && region[2];
  }

  getZone(constraints) {
    const zone = constraints.find(([fieldName, operator]) =>
      isZoneConstraint(fieldName, operator)
    );

    return zone && zone[2];
  }

  render() {
    const { onEditClick } = this.props;
    const constraints = this.getConstraints();

    if (!constraints.length) {
      return <noscript />;
    }

    const advancedConstraints = this.getAdvancedConstraints(constraints);
    const region = this.getRegion(constraints);
    const zone = this.getZone(constraints);
    const showAdvancedTitle = Boolean(
      advancedConstraints.length > 0 && (region || zone)
    );

    return (
      <div>
        <RegionConstraintsSection region={region} onEditClick={onEditClick} />
        <ZoneConstraintsSection zone={zone} onEditClick={onEditClick} />
        {showAdvancedTitle && (
          <ConfigurationMapHeading level={2}>
            <Trans render="span">Advanced Constraints</Trans>
          </ConfigurationMapHeading>
        )}
        <AdvancedConstraintsSection
          constraints={advancedConstraints}
          onEditClick={onEditClick}
        />
      </div>
    );
  }
}

ServicePlacementConfigSection.defaultProps = {
  appConfig: {}
};

export default ServicePlacementConfigSection;
