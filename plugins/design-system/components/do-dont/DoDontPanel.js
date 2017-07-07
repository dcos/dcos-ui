import classNames from "classnames/dedupe";
import React, { Component } from "react";

class DoDontPanel extends Component {
  render() {
    const { className, children } = this.props;
    const classes = classNames("row", className);

    const columnClasses = "column-12 column-small-6";

    return (
      <div className={classes}>
        {React.Children.toArray(children).map(function(child) {
          return (
            <div className={columnClasses}>
              {child}
            </div>
          );
        })}
      </div>
    );
  }
}

DoDontPanel.propTypes = {
  children: React.PropTypes.node.isRequired,
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ])
};

module.exports = DoDontPanel;
