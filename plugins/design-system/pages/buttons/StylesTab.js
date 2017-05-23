import React, { Component } from "react";

class StylesTab extends Component {
  render() {
    return (
      <div className="container">
        <p>
          Ideally we don't hard code values here otherwise they will be out of date very quickly.
        </p>
        <p>
          Documenting how we do hover/active/focus styles and colors would be useful.
        </p>
        <h2>Color</h2>
        <h2>Type</h2>
        <h2>Spacing</h2>
      </div>
    );
  }
}

module.exports = StylesTab;
