import React from "react";

import ConfigurationMapValue
  from "../../../../../src/js/components/ConfigurationMapValue";
import ValidatorUtil from "../../../../../src/js/utils/ValidatorUtil";

/**
 * Render a boolean value as a <ConfigurationMapValue>, with it's values being
 * selected from an `options` array.
 */
class ConfigurationMapBooleanValue extends React.Component {
  render() {
    let { defaultValue, options, value } = this.props;

    // Bail early with default if empty
    if (ValidatorUtil.isEmpty(value)) {
      return <ConfigurationMapValue>{defaultValue}</ConfigurationMapValue>;
    }

    // Pick the appropriate value representation
    if (value) {
      value = options.truthy;
    } else {
      value = options.falsy;
    }

    return (
      <ConfigurationMapValue>
        {value}
      </ConfigurationMapValue>
    );
  }
}

ConfigurationMapBooleanValue.defaultProps = {
  defaultValue: <em>Not Configured</em>,
  options: {
    truthy: "Enabled",
    falsy: "Disabled"
  },
  value: null
};

ConfigurationMapBooleanValue.propTypes = {
  defaultValue: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.node
  ]),
  options: React.PropTypes.shape({
    truthy: React.PropTypes.any,
    falsy: React.PropTypes.any
  }),
  value: React.PropTypes.any
};

module.exports = ConfigurationMapBooleanValue;
