import React from "react";

import ConfigurationMapValue
  from "../../../../../src/js/components/ConfigurationMapValue";
import ValidatorUtil from "../../../../../src/js/utils/ValidatorUtil";
import Units from "../../../../../src/js/utils/Units";

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
  defaultValue: <em>Not Configured</em>,
  multiplier: 1024,
  scale: 1024 * 1024,
  threshold: 800,
  units: ["B", "KiB", "MiB", "GiB", "TiB", "PiB"],
  value: 0
};

ConfigurationMapSizeValue.propTypes = {
  decimals: React.PropTypes.number,
  defaultValue: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.node
  ]),
  multiplier: React.PropTypes.number,
  scale: React.PropTypes.number,
  threshold: React.PropTypes.number,
  units: React.PropTypes.array,
  value: React.PropTypes.number
};

module.exports = ConfigurationMapSizeValue;
