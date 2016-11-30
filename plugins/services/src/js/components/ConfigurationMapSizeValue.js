import React from 'react';

import ConfigurationMapValue from '../../../../../src/js/components/ConfigurationMapValue';
import Units from '../../../../../src/js/utils/Units';

/**
 * Render a size value as a <ConfigurationMapValue>, with it's values being
 * appended a Mebibyte suffix.
 *
 * Practically, this is a component wrapper around the Units.filesize function,
 * and you can file-tune it through it's properties.
 */
class ConfigurationMapSizeValue extends React.Component {
  render() {
    let {decimals, multiplier, scale, threshold, units, value} = this.props;
    return (
      <ConfigurationMapValue>
        {Units.filesize(
          value * scale,
          decimals, threshold, multiplier, units
        )}
      </ConfigurationMapValue>
    );
  }
};

ConfigurationMapSizeValue.defaultProps = {
  decimals: 2,
  multiplier: 1024,
  scale: 1024 * 1024,
  threshold: 800,
  units: ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'],
  value: 0
};

ConfigurationMapSizeValue.propTypes = {
  decimals: React.PropTypes.number,
  multiplier: React.PropTypes.number,
  scale: React.PropTypes.number,
  threshold: React.PropTypes.number,
  units: React.PropTypes.array,
  value: React.PropTypes.number
};

module.exports = ConfigurationMapSizeValue;
