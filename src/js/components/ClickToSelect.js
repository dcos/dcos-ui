/* @flow */
import React from "react";

type Props = { children?: any };

class ClickToSelect extends React.Component {
  constructor() {
    super();
    this.selectAll = this.selectAll.bind(this);
  }



  selectAll() {
    global.document.getSelection().selectAllChildren(this.refs.node);
  }

  render() {
    return (
      <span onClick={this.selectAll} ref="node">
        {this.props.children}
      </span>
    );
  }
}

module.exports = ClickToSelect;
