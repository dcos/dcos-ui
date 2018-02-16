import PropTypes from "prop-types";
import React from "react";

import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import DateUtil from "#SRC/js/utils/DateUtil";
import ValidatorUtil from "#SRC/js/utils/ValidatorUtil";
import EmptyStates from "#SRC/js/constants/EmptyStates";

const MULTIPLICANTS = {
  ms: 1,
  sec: 1000,
  min: 60000,
  h: 3600000,
  d: 86400000
};

/**
 * Render a JSON object as a <ConfigurationMapValue>, within the
 * appropriate formatting.
 */
class ConfigurationMapDurationValue extends React.Component {
  render() {
    const { defaultValue, multiplicants, units, value } = this.props;

    // Bail early with default if empty
    if (ValidatorUtil.isEmpty(value)) {
      return <ConfigurationMapValue>{defaultValue}</ConfigurationMapValue>;
    }

    // Compose value multiplicants
    const valueInMs = value * multiplicants[units];
    const components = DateUtil.msToMultiplicants(valueInMs, multiplicants);

    const hasNoComponents = components.length === 0;
    const hasOnlyUnitComponent =
      components.length === 1 && components[0].split(" ")[1] === units;

    // Check if components are redundant
    if (hasNoComponents || hasOnlyUnitComponent) {
      return (
        <ConfigurationMapValue>
          {value} {units}
        </ConfigurationMapValue>
      );
    }

    // Otherwise show the value and it's components
    return (
      <ConfigurationMapValue>
        {value} {units} ({components.join(", ")})
      </ConfigurationMapValue>
    );
  }
}

ConfigurationMapDurationValue.defaultProps = {
  defaultValue: <em>{EmptyStates.CONFIG_VALUE}</em>,
  multiplicants: MULTIPLICANTS,
  units: "ms",
  value: 0
};

ConfigurationMapDurationValue.propTypes = {
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  multiplicants: PropTypes.object,
  units: PropTypes.oneOf(Object.keys(MULTIPLICANTS)),
  value: PropTypes.number
};

module.exports = ConfigurationMapDurationValue;
