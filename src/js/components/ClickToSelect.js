import React from "react";

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

ClickToSelect.propTypes = {
  children: React.PropTypes.any
};

module.exports = ClickToSelect;
