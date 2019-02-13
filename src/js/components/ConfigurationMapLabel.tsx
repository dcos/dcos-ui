import classNames from "classnames";
import * as React from "react";

interface ConfigurationMapLabelProps {
  keepTextCase?: boolean;
}

const ConfigurationMapLabel: React.FunctionComponent<
  ConfigurationMapLabelProps
> = props => {
  const labelClasses = classNames("configuration-map-label", {
    "configuration-map-label-no-text-transform": props.keepTextCase
  });

  return <div className={labelClasses}>{props.children}</div>;
};

export default ConfigurationMapLabel;
