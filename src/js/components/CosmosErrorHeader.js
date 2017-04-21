import React from "react";

const CosmosErrorHeader = function(props) {
  return (
    <h3 className="text-align-center flush-top">
      {props.children}
    </h3>
  );
};

CosmosErrorHeader.propTypes = {
  children: React.PropTypes.node
};

module.exports = CosmosErrorHeader;
