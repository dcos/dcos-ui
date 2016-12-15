import React from 'react';

const ConfigurationMapEditAction = ({tabViewID, onEditClick}) => {
  if (!onEditClick) {
    return <noscript />;
  }

  return (
    <a
      className="button button-link flush table-display-on-row-hover"
      onClick={onEditClick.bind(null, {tabViewID})}>
      Edit
    </a>
  );
};

module.exports = ConfigurationMapEditAction;
