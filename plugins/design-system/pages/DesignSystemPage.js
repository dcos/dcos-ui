import React, { Component } from "react";

const SDK = require("../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class DesignSystemPage extends Component {
  render() {
    return <Page>{this.props.children}</Page>;
  }
}

module.exports = DesignSystemPage;
