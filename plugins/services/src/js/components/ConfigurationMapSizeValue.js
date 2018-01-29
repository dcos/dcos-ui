import PropTypes from "prop-types";
import React from "react";

import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import ValidatorUtil from "#SRC/js/utils/ValidatorUtil";
import Units from "#SRC/js/utils/Units";
import EmptyStates from "#SRC/js/constants/EmptyStates";

/**
 * Render a size value as a <ConfigurationMapValue>, with it's values being
 * appended a Mebibyte suffix.
 *
 * Practically, this is a component wrapper around the Units.filesize function,
 * and you can file-tune it through it's properties.
 */
class ConfigurationMapSizeValue extends React.Component {
  render() {
    const {
      decimals,
      defaultValue,
      multiplier,
      scale,
      threshold,
      units,
      value
    } = this.props;

    // Bail early with default if empty
    if (ValidatorUtil.isEmpty(value)) {
      return <ConfigurationMapValue>{defaultValue}</ConfigurationMapValue>;
    }

    return (
      <ConfigurationMapValue>
        {Units.filesize(value * scale, decimals, threshold, multiplier, units)}
      </ConfigurationMapValue>
    );
  }
}

ConfigurationMapSizeValue.defaultProps = {
  decimals: 2,
  defaultValue: <em>{EmptyStates.CONFIG_VALUE}</em>,
  multiplier: 1024,
  scale: 1024 * 1024,
  threshold: 800,
  units: ["B", "KiB", "MiB", "GiB", "TiB", "PiB"],
  value: 0
};

ConfigurationMapSizeValue.propTypes = {
  decimals: PropTypes.number,
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  multiplier: PropTypes.number,
  scale: PropTypes.number,
  threshold: PropTypes.number,
  units: PropTypes.array,
  value: PropTypes.number
};

module.exports = ConfigurationMapSizeValue;
