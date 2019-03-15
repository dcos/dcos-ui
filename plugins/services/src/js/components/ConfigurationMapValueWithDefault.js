import PropTypes from "prop-types";
import React from "react";

import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import ValidatorUtil from "#SRC/js/utils/ValidatorUtil.js";
import EmptyStates from "#SRC/js/constants/EmptyStates";

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

    return <ConfigurationMapValue>{value}</ConfigurationMapValue>;
  }
}

ConfigurationMapValueWithDefault.defaultProps = {
  value: undefined,
  defaultValue: <em>{EmptyStates.CONFIG_VALUE}</em>
};

ConfigurationMapValueWithDefault.propTypes = {
  value: PropTypes.any,
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
};

export default ConfigurationMapValueWithDefault;
