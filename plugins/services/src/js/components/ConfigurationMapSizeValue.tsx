import PropTypes from "prop-types";
import * as React from "react";

import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import * as ValidatorUtil from "#SRC/js/utils/ValidatorUtil";
import Units from "#SRC/js/utils/Units";
import { EmptyStates } from "#SRC/js/constants/EmptyStates";

const ConfigurationMapSizeValue = (props) => {
  const {
    decimals,
    defaultValue,
    multiplier,
    scale,
    threshold,
    units,
    value,
  } = props;

  // Bail early with default if empty
  if (ValidatorUtil.isEmpty(value)) {
    return <ConfigurationMapValue>{defaultValue}</ConfigurationMapValue>;
  }

  return (
    <ConfigurationMapValue>
      {Units.filesize(value * scale, decimals, threshold, multiplier, units)}
    </ConfigurationMapValue>
  );
};

ConfigurationMapSizeValue.defaultProps = {
  decimals: 2,
  defaultValue: <em>{EmptyStates.CONFIG_VALUE}</em>,
  multiplier: 1024,
  scale: 1024 * 1024,
  threshold: 800,
  units: ["B", "KiB", "MiB", "GiB", "TiB", "PiB"],
  value: 0,
};

ConfigurationMapSizeValue.propTypes = {
  decimals: PropTypes.number,
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  multiplier: PropTypes.number,
  scale: PropTypes.number,
  threshold: PropTypes.number,
  units: PropTypes.array,
  value: PropTypes.number,
};

export default ConfigurationMapSizeValue;
