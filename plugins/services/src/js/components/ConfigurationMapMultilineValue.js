import PropTypes from "prop-types";
import React from "react";

import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import ValidatorUtil from "#SRC/js/utils/ValidatorUtil";
import { EmptyStates } from "#SRC/js/constants/EmptyStates";

const ConfigurationMapMultilineValue = props => {
  const { value, defaultValue } = props;

  // Bail early with default if empty
  if (ValidatorUtil.isEmpty(value)) {
    return <ConfigurationMapValue>{defaultValue}</ConfigurationMapValue>;
  }

  return (
    <ConfigurationMapValue>
      <pre className="flush transparent wrap">{value}</pre>
    </ConfigurationMapValue>
  );
};

ConfigurationMapMultilineValue.defaultProps = {
  defaultValue: <em>{EmptyStates.CONFIG_VALUE}</em>,
  value: ""
};

ConfigurationMapMultilineValue.propTypes = {
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  value: PropTypes.string
};

module.exports = ConfigurationMapMultilineValue;
