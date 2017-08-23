/* @flow */
import classNames from "classnames/dedupe";
import React from "react";

const METHODS_TO_BIND = ["handleClick"];

type Props = {
  active?: boolean,
  children?: number | string | React.Element | Array<any>,
  className?: classProps,
  id: string,
  label?: number | string | React.Element | Array<any>,
  labelClassName?: classProps
};

class TabButton extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }



  getChildren() {
    const { activeTab, children, onClick } = this.props;

    return React.Children.map(children, tabChild => {
      if (tabChild.type === TabButton) {
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
      "menu-tabbed-item",
      {
        active: active || activeTab === id
      },
      className
    );
    const labelClasses = classNames("menu-tabbed-item-label", labelClassName);

    return (
      <div className={classes}>
        <span className={labelClasses} onClick={this.handleClick}>
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

module.exports = TabButton;
