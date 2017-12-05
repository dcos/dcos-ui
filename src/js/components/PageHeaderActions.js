import classNames from "classnames/dedupe";
import React from "react";
import { Tooltip } from "reactjs-components";

import Icon from "./Icon";
import PageHeaderActionsMenu from "./PageHeaderActionsMenu";

const getDropdownAction = (action, index) => {
  if (React.isValidElement(action)) {
    return action;
  }

  const { className, label, onItemSelect } = action;
  const itemClasses = classNames(className);

  return (
    <span className={itemClasses} onItemSelect={onItemSelect} key={index}>
      {label}
    </span>
  );
};

class PageHeaderActions extends React.Component {
  renderActionsMenu() {
    const { actions, disabledActions } = this.props;

    if (actions.length > 0) {
      const dropdownElements = actions.map(getDropdownAction);

      return (
        <PageHeaderActionsMenu disabledActions={disabledActions}>
          {dropdownElements}
        </PageHeaderActionsMenu>
      );
    }
  }

  renderAddButton() {
    const { addButton, disabledActions } = this.props;

    if (Array.isArray(addButton) && addButton.length > 0) {
      const dropdownElements = addButton.map(getDropdownAction);

      return (
        <PageHeaderActionsMenu iconID="plus" disabledActions={disabledActions}>
          {dropdownElements}
        </PageHeaderActionsMenu>
      );
    }

    if (addButton != null) {
      const { label, onItemSelect, className } = addButton;
      const buttonClasses = classNames(
        "button button-primary-link button-narrow",
        className
      );

      const button = (
        <button className={buttonClasses} onClick={onItemSelect}>
          <Icon id="plus" size="mini" />
        </button>
      );

      if (label != null) {
        return <Tooltip content={label}>{button}</Tooltip>;
      }

      return button;
    }
  }

  renderSupplementalContent() {
    const { supplementalContent } = this.props;

    if (supplementalContent == null) {
      return null;
    }

    return supplementalContent;
  }

  render() {
    return (
      <div className="page-header-actions-inner">
        {this.renderSupplementalContent()}
        <div className="button-collection-flush-bottom">
          {this.renderAddButton()}
          {this.renderActionsMenu()}
        </div>
      </div>
    );
  }
}

PageHeaderActions.defaultProps = {
  actions: [],
  disabledActions: false
};

const classProps = React.PropTypes.oneOfType([
  React.PropTypes.array,
  React.PropTypes.object,
  React.PropTypes.string
]);

const menuActionsProps = React.PropTypes.shape({
  className: classProps,
  onItemSelect: React.PropTypes.func.isRequired,
  label: React.PropTypes.node.isRequired
});

PageHeaderActions.propTypes = {
  addButton: React.PropTypes.oneOfType([
    React.PropTypes.arrayOf(menuActionsProps),
    menuActionsProps
  ]),
  actions: React.PropTypes.arrayOf(
    React.PropTypes.oneOfType([React.PropTypes.node, menuActionsProps])
  ),
  supplementalContent: React.PropTypes.node,
  disabledActions: React.PropTypes.bool
};

module.exports = PageHeaderActions;
