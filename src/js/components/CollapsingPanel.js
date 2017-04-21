import classNames from "classnames/dedupe";
import React from "react";

import CollapsingPanelContent from "./CollapsingPanelContent";
import CollapsingPanelHeader from "./CollapsingPanelHeader";

const METHODS_TO_BIND = ["handleHeadingClick"];

class CollapsingPanel extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      isExpanded: false
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleHeadingClick() {
    this.setState({ isExpanded: !this.state.isExpanded });
  }

  getChildren() {
    return React.Children.map(this.props.children, child => {
      if (child.type === CollapsingPanelHeader) {
        return React.cloneElement(child, {
          onClick: this.handleHeadingClick,
          isExpanded: this.state.isExpanded
        });
      }

      if (child.type === CollapsingPanelContent && !this.state.isExpanded) {
        return null;
      }

      return child;
    });
  }

  render() {
    const classes = classNames("panel panel-collapsing", this.props.className);

    return (
      <div className={classes}>
        {this.getChildren()}
      </div>
    );
  }
}

CollapsingPanel.propTypes = {
  children: React.PropTypes.node,
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ])
};

module.exports = CollapsingPanel;
