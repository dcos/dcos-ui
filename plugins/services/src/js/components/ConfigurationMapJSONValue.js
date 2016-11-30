import React from 'react';

import ConfigurationMapValue from '../../../../../src/js/components/ConfigurationMapValue';

/**
 * Render a JSON object as a <ConfigurationMapValue>, within the
 * appropriate formatting.
 */
class ConfigurationMapJSONValue extends React.Component {
  render() {
    return (
      <ConfigurationMapValue>
        <pre>
          {JSON.stringify(this.props.value, null, 2)}
        </pre>
      </ConfigurationMapValue>
    );
  }
};

ConfigurationMapJSONValue.defaultProps = {
  value: false
};

ConfigurationMapJSONValue.propTypes = {
  value: React.PropTypes.any
};

module.exports = ConfigurationMapJSONValue;
