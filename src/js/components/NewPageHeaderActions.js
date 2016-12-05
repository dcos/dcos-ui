import classNames from 'classnames/dedupe';
import React from 'react';
import {Tooltip} from 'reactjs-components';

import Icon from './Icon';
import PageHeaderActionsMenu from './PageHeaderActionsMenu';

class PageHeaderActions extends React.Component {

  renderActionsMenu() {
    const {actions} = this.props;

    if (actions.length > 0) {
      const dropdownElements = actions.map(function (action, index) {
        if (React.isValidElement(action)) {
          return action;
        }

        return (
          <span onItemSelect={action.onItemSelect} key={index}>
            {action.label}
          </span>
        );
      });

      return (
        <PageHeaderActionsMenu>
          {dropdownElements}
        </PageHeaderActionsMenu>
      );
    }
  }

  renderAddButton() {
    const {addButton} = this.props;
    if (addButton != null) {
      const {label, onItemSelect, className} = addButton;
      const buttonClasses = classNames(
          'button button-link flush-left flush-right',
          className
      );

      const button = (
        <button className={buttonClasses} onClick={onItemSelect}>
          <Icon id="plus" size="mini" />
        </button>
      );

      if (label != null) {
        return (
          <Tooltip content={label}>{button}</Tooltip>
        );
      }

      return button;
    }
  }

  render() {
    return (
      <div className="page-header-actions">
        <div className="button-collection-flush-bottom">
          {this.renderAddButton()}
          {this.renderActionsMenu()}
        </div>
      </div>
    );
  }
}

PageHeaderActions.defaultProps = {
  actions: []
};

const classProps = React.PropTypes.oneOfType([
  React.PropTypes.array,
  React.PropTypes.object,
  React.PropTypes.string
]);

PageHeaderActions.propTypes = {
  addButton: React.PropTypes.shape({
    className: classProps,
    onItemSelect: React.PropTypes.func,
    label: React.PropTypes.node
  }),
  actions: React.PropTypes.arrayOf(
    React.PropTypes.oneOfType([
      React.PropTypes.node,
      React.PropTypes.shape({
        className: classProps,
        onItemSelect: React.PropTypes.func.isRequired,
        label: React.PropTypes.node.isRequired
      })
    ])
  )
};

module.exports = PageHeaderActions;
