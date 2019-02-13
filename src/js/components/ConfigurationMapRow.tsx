import * as React from "react";

const ConfigurationMapRow: React.FunctionComponent<{}> = props => {
  return (
    <div className="configuration-map-row table-row">{props.children}</div>
  );
};

export default ConfigurationMapRow;
