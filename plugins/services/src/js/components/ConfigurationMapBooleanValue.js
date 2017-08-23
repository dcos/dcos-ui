/* @flow */
import React from "react";

import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import ValidatorUtil from "#SRC/js/utils/ValidatorUtil";

type Props = {
  defaultValue?: string | number | string | React.Element | Array<any>,
  options?: {
    truthy?: any,
    falsy?: any,
  },
  value?: any,
};

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

module.exports = ConfigurationMapBooleanValue;
