/* @flow */
import React from "react";

import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import ValidatorUtil from "#SRC/js/utils/ValidatorUtil";

type Props = {
  defaultValue?: string | number | string | React.Element | Array<any>,
  value?: any,
};

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

module.exports = ConfigurationMapJSONValue;
