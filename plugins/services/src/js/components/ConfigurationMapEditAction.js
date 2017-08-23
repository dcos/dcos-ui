/* @flow */
import React from "react";

type Props = {
  onEditClick?: Function,
  tabViewID?: string,
};

const ConfigurationMapEditAction = (props: Props) => {
  const { tabViewID, onEditClick } = props;
  if (!onEditClick) {
    return <noscript />;
  }

  return (
    <a
      className="button button-link flush table-display-on-row-hover"
      onClick={onEditClick.bind(null, { tabViewID })}
    >
      Edit
    </a>
  );
};

module.exports = ConfigurationMapEditAction;
