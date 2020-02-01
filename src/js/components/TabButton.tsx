import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import * as React from "react";
import { Tooltip } from "reactjs-components";
import { BadgeButton } from "@dcos/ui-kit";

class TabButton extends React.Component {
  static propTypes = {
    active: PropTypes.bool,
    children: PropTypes.node,
    className: classProps,
    id: PropTypes.string.isRequired,
    label: PropTypes.node,
    labelClassName: classProps,
    showErrorBadge: PropTypes.bool,
    count: PropTypes.number,
    description: PropTypes.node,
    onClickBadge: PropTypes.func
  };
  constructor(...args) {
    super(...args);
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
        <BadgeButton appearance="danger" onClick={onClickBadge}>
          {count}
        </BadgeButton>
      </Tooltip>
    );
  }
  handleClick = event => {
    event.stopPropagation();

    if (this.props.onClick) {
      this.props.onClick(this.props.id);
    }
  };

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

const classProps = PropTypes.oneOfType([
  PropTypes.array,
  PropTypes.object,
  PropTypes.string
]);

export default TabButton;
