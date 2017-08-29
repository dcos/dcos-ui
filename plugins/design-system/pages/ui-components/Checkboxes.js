import React, { Component } from "react";
import ComponentPage from "../ComponentPage";

class Checkboxes extends Component {
  render() {
    const { title, pathName } = this.props.route.options;

    return (
      <ComponentPage title={title} pathName={pathName}>
        <div>
          <h3 className="flush-top">Primary Button</h3>
          <p>Here's a primary button</p>
          <button className="button button-primary">Button</button>
        </div>
      </ComponentPage>
    );
  }
}

module.exports = Checkboxes;
