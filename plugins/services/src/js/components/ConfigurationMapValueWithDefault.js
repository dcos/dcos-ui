/* @flow */
import React from "react";

import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import ValidatorUtil from "#SRC/js/utils/ValidatorUtil.js";

type Props = {
  value?: any,
  defaultValue?: string | number | string | React.Element | Array<any>,
};

/**
 * Render a defaultValue value if the value is empty or falsy.
 */
class ConfigurationMapValueWithDefault extends React.Component {

  render() {
    const { defaultValue, value } = this.props;

    // Bail early with default if empty
    if (ValidatorUtil.isEmpty(value)) {
      return <ConfigurationMapValue>{defaultValue}</ConfigurationMapValue>;
    }

    return (
      <ConfigurationMapValue>
        {value}
      </ConfigurationMapValue>
    );
  }
}

ConfigurationMapValueWithDefault.defaultProps = {
  value: undefined,
  defaultValue: <em>Not Configured</em>
};

module.exports = ConfigurationMapValueWithDefault;
