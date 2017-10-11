import React from "react";

/**
 * Component to display long dash placeholder
 *
 * @class LongDashPlaceholder
 * @extends {React.Component}
 * @returns {String} unicode dash
 */
class LongDashPlaceholder extends React.Component {
  render() {
    return <span>{"\u2014"}</span>;
  }
}

module.exports = LongDashPlaceholder;
