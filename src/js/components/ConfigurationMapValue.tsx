import classNames from "classnames";
import * as React from "react";
interface ConfigurationMapValueProps {
  stacked?: boolean;
  value?: React.ReactElement<any>;
}
const ConfigurationMapValue: React.FunctionComponent<
  ConfigurationMapValueProps
> = props => {
  const classes = classNames("configuration-map-value", {
    "configuration-map-value-stacked": props.stacked
  });

  return <div className={classes}>{props.value || props.children}</div>;
};

export default ConfigurationMapValue;
