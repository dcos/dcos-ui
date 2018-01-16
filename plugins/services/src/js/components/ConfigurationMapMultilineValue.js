import PropTypes from "prop-types";
import React from "react";

import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import ValidatorUtil from "#SRC/js/utils/ValidatorUtil";

/**
 * Render a multiline value as a <ConfigurationMapValue>, within the
 * appropriate formatting.
 */
class ConfigurationMapMultilineValue extends React.Component {
  render() {
    const { value, defaultValue } = this.props;

    // Bail early with default if empty
    if (ValidatorUtil.isEmpty(value)) {
      return <ConfigurationMapValue>{defaultValue}</ConfigurationMapValue>;
    }

    return (
      <ConfigurationMapValue>
        <pre className="flush transparent wrap">{value}</pre>
      </ConfigurationMapValue>
    );
  }
}

ConfigurationMapMultilineValue.defaultProps = {
  defaultValue: <em>Not Configured</em>,
  value: ""
};

ConfigurationMapMultilineValue.propTypes = {
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  value: PropTypes.string
};

module.exports = ConfigurationMapMultilineValue;
