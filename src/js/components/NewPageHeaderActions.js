import classNames from 'classnames/dedupe';
import React from 'react';

class PageHeaderActions extends React.Component {
  render() {
    let {props: {actions}} = this;

    let actionElements = actions.map(function (action, index) {
      if (action.node) {
        return action.node;
      }

      let classes = classNames('button button-rounded', action.className);

      return (
        <button className={classes} key={index} onClick={action.clickHandler}>
          {action.label}
        </button>
      );
    });

    return (
      <div className="page-header-actions button-collection flush-bottom">
        {actionElements}
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
  actions: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      className: classProps,
      clickHandler: React.PropTypes.func,
      label: React.PropTypes.node
    })
  )
};

module.exports = PageHeaderActions;
