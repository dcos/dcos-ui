import PropTypes from "prop-types";
import React from "react";

class ClickToSelect extends React.Component {
  constructor() {
    super();
    this.nodeRef = React.createRef();

    this.selectAll = this.selectAll.bind(this);
  }

  selectAll() {
    global.document.getSelection().selectAllChildren(this.nodeRef.current);
  }

  render() {
    return (
      <span onClick={this.selectAll} ref={this.nodeRef}>
        {this.props.children}
      </span>
    );
  }
}

ClickToSelect.propTypes = {
  children: PropTypes.any
};

module.exports = ClickToSelect;
