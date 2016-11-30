import React from 'react';

import ConfigurationMapValue from '../../../../../src/js/components/ConfigurationMapValue';

/**
 * Render a boolean value as a <ConfigurationMapValue>, with it's values being
 * selected from an `options` array.
 */
class ConfigurationMapBooleanValue extends React.Component {
  render() {
    return (
      <ConfigurationMapValue>
        {this.props.value ? this.props.options[0] : this.props.options[1]}
      </ConfigurationMapValue>
    );
  }
};

ConfigurationMapBooleanValue.defaultProps = {
  options: ['Enabled', 'Disabled'],
  value: false
};

ConfigurationMapBooleanValue.propTypes = {
  options: React.PropTypes.array,
  value: React.PropTypes.any
};

module.exports = ConfigurationMapBooleanValue;
