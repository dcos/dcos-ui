import React from 'react';

import ConfigurationMapValue from '../../../../../src/js/components/ConfigurationMapValue';

/**
 * Render a multiline value as a <ConfigurationMapValue>, within the
 * appropriate formatting.
 */
class ConfigurationMapMultilineValue extends React.Component {
  render() {
    return (
      <ConfigurationMapValue>
        <pre>{this.props.value}</pre>
      </ConfigurationMapValue>
    );
  }
};

ConfigurationMapMultilineValue.defaultProps = {
  options: ['Enabled', 'Disabled'],
  value: false
};

ConfigurationMapMultilineValue.propTypes = {
  options: React.PropTypes.array,
  value: React.PropTypes.any
};

module.exports = ConfigurationMapMultilineValue;
