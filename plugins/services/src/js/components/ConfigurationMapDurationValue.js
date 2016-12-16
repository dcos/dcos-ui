import React from 'react';

import ConfigurationMapValue from '../../../../../src/js/components/ConfigurationMapValue';
import DateUtil from '../../../../../src/js/utils/DateUtil';
import ValidatorUtil from '../../../../../src/js/utils/ValidatorUtil';

const MULTIPLICANTS = {
  'ms'  : 1,
  'sec' : 1000,
  'min' : 60000,
  'h'   : 3600000,
  'd'   : 86400000
};

/**
 * Render a JSON object as a <ConfigurationMapValue>, within the
 * appropriate formatting.
 */
class ConfigurationMapDurationValue extends React.Component {
  render() {
    let {defaultValue, multiplicants, units, value} = this.props;

    // Bail early with default if empty
    if (ValidatorUtil.isEmpty(value)) {
      return <ConfigurationMapValue>{defaultValue}</ConfigurationMapValue>;
    }

    // Compose value multiplicants
    let valueInMs = value * multiplicants[units];
    let components = DateUtil.msToMultiplicants(valueInMs, multiplicants);

    // Check if components are redundant
    if ((components.length === 1) && (components[0].split(' ')[1] === units)) {
      return (
        <ConfigurationMapValue>
          {`${value} ${units}`}
        </ConfigurationMapValue>
      );
    }

    // Otherwise show the value and it's components
    return (
      <ConfigurationMapValue>
        {`${value} ${units} (${components.join(', ')})`}
      </ConfigurationMapValue>
    );
  }
};

ConfigurationMapDurationValue.defaultProps = {
  defaultValue: <em>Not Configured</em>,
  multiplicants: MULTIPLICANTS,
  units: 'ms',
  value: 0
};

ConfigurationMapDurationValue.propTypes = {
  defaultValue: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.node
  ]),
  multiplicants: React.PropTypes.object,
  units: React.PropTypes.oneOf(Object.keys(MULTIPLICANTS)),
  value: React.PropTypes.number
};

module.exports = ConfigurationMapDurationValue;
