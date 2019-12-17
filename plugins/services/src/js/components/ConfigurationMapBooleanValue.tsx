import PropTypes from "prop-types";
import * as React from "react";
import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";

import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import * as ValidatorUtil from "#SRC/js/utils/ValidatorUtil";
import { EmptyStates } from "#SRC/js/constants/EmptyStates";

const ConfigurationMapBooleanValue = props => {
  const { defaultValue, options } = props;
  let { value } = props;

  // Bail early with default if empty
  if (ValidatorUtil.isEmpty(value)) {
    return <ConfigurationMapValue>{defaultValue}</ConfigurationMapValue>;
  }

  // Pick the appropriate value representation
  value = value ? options.truthy : options.falsy;

  return <Trans render={<ConfigurationMapValue />} id={value} />;
};

ConfigurationMapBooleanValue.defaultProps = {
  defaultValue: <em>{EmptyStates.CONFIG_VALUE}</em>,
  options: {
    truthy: i18nMark("Enabled"),
    falsy: i18nMark("Disabled")
  },
  value: null
};

ConfigurationMapBooleanValue.propTypes = {
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  options: PropTypes.shape({
    truthy: PropTypes.any,
    falsy: PropTypes.any
  }),
  value: PropTypes.any
};

export default ConfigurationMapBooleanValue;
