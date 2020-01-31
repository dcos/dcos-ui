import PropTypes from "prop-types";
import * as React from "react";

class ClickToSelect extends React.Component {
  static propTypes = {
    children: PropTypes.any
  };
  constructor() {
    super();
    this.nodeRef = React.createRef();

    this.selectAll = this.selectAll.bind(this);
  }

  selectAll() {
    if (
      !window.document.getSelection ||
      !window.document.getSelection().selectAllChildren
    ) {
      return;
    }
    window.document.getSelection().selectAllChildren(this.nodeRef.current);
  }

  render() {
    return (
      <span onClick={this.selectAll} ref={this.nodeRef}>
        {this.props.children}
      </span>
    );
  }
}

export default ClickToSelect;
