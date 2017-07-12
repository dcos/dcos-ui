import classNames from "classnames/dedupe";
import React, { Component } from "react";

const METHODS_TO_BIND = ["handleClick"];

class CodeExampleTabButton extends Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  getChildren() {
    const { activeTab, children, onClick } = this.props;

    return React.Children.map(children, tabChild => {
      if (tabChild.type === CodeExampleTabButton) {
        return React.cloneElement(tabChild, { activeTab, onClick });
      }

      return tabChild;
    });
  }

  handleClick(event) {
    event.stopPropagation();

    if (this.props.onClick) {
      this.props.onClick(this.props.id);
    }
  }

  render() {
    const {
      active,
      activeTab,
      className,
      label,
      labelClassName,
      id
    } = this.props;
    const classes = classNames(
      "code-example-tabbed-item",
      {
        active: active || activeTab === id
      },
      className
    );
    const labelClasses = classNames(
      "code-example-tabbed-item-label",
      labelClassName
    );

    return (
      <div className={classes} onClick={this.handleClick}>
        <span className={labelClasses}>
          {label}
        </span>
        {this.getChildren()}
      </div>
    );
  }
}

const classProps = React.PropTypes.oneOfType([
  React.PropTypes.array,
  React.PropTypes.object,
  React.PropTypes.string
]);

CodeExampleTabButton.propTypes = {
  active: React.PropTypes.bool,
  children: React.PropTypes.node,
  className: classProps,
  id: React.PropTypes.string.isRequired,
  label: React.PropTypes.node,
  labelClassName: classProps
};

module.exports = CodeExampleTabButton;
