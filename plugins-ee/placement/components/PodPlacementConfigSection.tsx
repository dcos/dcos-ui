import { Trans } from "@lingui/macro";
import * as React from "react";
import PropTypes from "prop-types";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";

import PlacementConstraintsUtil from "#PLUGINS/services/src/js/utils/PlacementConstraintsUtil";

import { isRegionConstraint, isZoneConstraint } from "../utils/PlacementUtil";
import AdvancedConstraintsSection from "./AdvancedConstraintsSection";
import RegionConstraintsSection from "./RegionConstraintsSection";
import ZoneConstraintsSection from "./ZoneConstraintsSection";

class PodPlacementConstraintsConfigSection extends React.Component {
  getConstraints() {
    return (
      findNestedPropertyInObject(
        this.props.appConfig,
        "scheduling.placement.constraints"
      ) || []
    );
  }

  getRegion(constraints) {
    const region = constraints.find(({ fieldName, operator }) =>
      isRegionConstraint(fieldName, operator)
    );

    return region && region.value;
  }

  getZone(constraints) {
    const zone = constraints.find(({ fieldName, operator }) =>
      isRegionConstraint(fieldName, operator)
    );

    return zone && zone.value;
  }

  getAdvancedConstraints(constraints) {
    return constraints
      .filter(
        ({ fieldName, operator }) =>
          !isRegionConstraint(fieldName, operator) &&
          !isZoneConstraint(fieldName, operator)
      )
      .map(({ fieldName, operator, value }) => {
        if (PlacementConstraintsUtil.requiresEmptyValue(operator)) {
          value = <Trans render="em">Not Applicable</Trans>;
        }

        return { fieldName, operator, value };
      });
  }

  render() {
    const { onEditClick } = this.props;
    const constraints = this.getConstraints();

    if (!constraints.length) {
      return <noscript />;
    }

    const region = this.getRegion(constraints);
    const zone = this.getZone(constraints);
    const advancedConstraints = this.getAdvancedConstraints(constraints);
    const showAdvancedTitle = Boolean(
      advancedConstraints.length > 0 && (region || zone)
    );

    return (
      <div>
        <ConfigurationMapSection>
          <RegionConstraintsSection region={region} onEditClick={onEditClick} />
          <ZoneConstraintsSection zone={zone} onEditClick={onEditClick} />
        </ConfigurationMapSection>
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

PodPlacementConstraintsConfigSection.defaultProps = {
  appConfig: {}
};

PodPlacementConstraintsConfigSection.propTypes = {
  appConfig: PropTypes.object,
  onEditClick: PropTypes.func
};

export default PodPlacementConstraintsConfigSection;
