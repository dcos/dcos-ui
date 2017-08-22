import React, { Component } from "react";

class Panels extends Component {
  render() {
    return (
      <div>
        <h3 className="flush-top">Primary Button</h3>
        <p>Here's a primary button</p>
        <button className="button button-primary">Button</button>
      </div>
    );
  }
}

module.exports = Panels;
