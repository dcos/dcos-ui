import React from "react";

import ConfigurationMapValue
  from "../../../../../src/js/components/ConfigurationMapValue";
import ValidatorUtil from "../../../../../src/js/utils/ValidatorUtil";

/**
 * Render a JSON object as a <ConfigurationMapValue>, within the
 * appropriate formatting.
 */
class ConfigurationMapJSONValue extends React.Component {
  render() {
    const { defaultValue, value } = this.props;

    // Bail early with default if empty
    if (ValidatorUtil.isEmpty(value)) {
      return <ConfigurationMapValue>{defaultValue}</ConfigurationMapValue>;
    }

    return (
      <ConfigurationMapValue>
        <pre>
          {JSON.stringify(value, null, 2)}
        </pre>
      </ConfigurationMapValue>
    );
  }
}

ConfigurationMapJSONValue.defaultProps = {
  defaultValue: <em>Not Configured</em>,
  value: false
};

ConfigurationMapJSONValue.propTypes = {
  defaultValue: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.node
  ]),
  value: React.PropTypes.any
};

module.exports = ConfigurationMapJSONValue;
