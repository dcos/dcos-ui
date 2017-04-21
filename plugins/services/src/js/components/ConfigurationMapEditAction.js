import React from "react";

const ConfigurationMapEditAction = ({ tabViewID, onEditClick }) => {
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

ConfigurationMapEditAction.propTypes = {
  onEditClick: React.PropTypes.func,
  tabViewID: React.PropTypes.string
};

module.exports = ConfigurationMapEditAction;
