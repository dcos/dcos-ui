import classNames from "classnames/dedupe";
import React from "react";
import { Tooltip } from "reactjs-components";

const METHODS_TO_BIND = ["handleClick"];

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

  getErrorBadge() {
    const { showErrorBadge, count, description, onClickBadge } = this.props;

    if (!showErrorBadge) {
      return null;
    }

    return (
      <Tooltip
        content={description}
        interactive={true}
        maxWidth={300}
        wrapText={true}
      >
        <span
          className="badge badge-danger badge-rounded"
          onClick={onClickBadge}
        >
          {count}
        </span>
      </Tooltip>
    );
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
      id,
      showErrorBadge
    } = this.props;
    const classes = classNames(
      "menu-tabbed-item",
      {
        active: active || activeTab === id
      },
      className
    );
    const labelClasses = classNames(
      "menu-tabbed-item-label",
      { "menu-tabbed-item-label-with-badge": showErrorBadge },
      labelClassName
    );

    return (
      <div className={classes}>
        <span className={labelClasses} onClick={this.handleClick}>
          {label}
          {this.getErrorBadge()}
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

TabButton.propTypes = {
  active: React.PropTypes.bool,
  children: React.PropTypes.node,
  className: classProps,
  id: React.PropTypes.string.isRequired,
  label: React.PropTypes.node,
  labelClassName: classProps,
  showErrorBadge: React.PropTypes.bool,
  count: React.PropTypes.number,
  description: React.PropTypes.string,
  onClickBadge: React.PropTypes.func
};

module.exports = TabButton;
