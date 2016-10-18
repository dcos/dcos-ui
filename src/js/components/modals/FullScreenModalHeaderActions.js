import classNames from 'classnames/dedupe';
import React from 'react';

class FullScreenModalHeader extends React.Component {
  getActions() {
    let {props: {actions}} = this;

    if (!actions || actions.length === 0) {
      return null;
    }

    return actions.map((action, index) => {
      if (action.node) {
        return action.node;
      }

      let classes = classNames('button', action.className);

      return (
        <button className={classes} key={index} onClick={action.clickHandler}>
          {action.label}
        </button>
      );
    });
  }

  render() {
    let {props: {className, type}} = this;

    let classes = classNames(
      `modal-full-screen-actions modal-full-screen-actions-${type}`,
      className
    );

    return (
      <div className={classes}>
        {this.getActions()}
      </div>
    );
  }
}

const classProps = React.PropTypes.oneOfType([
  React.PropTypes.array,
  React.PropTypes.object,
  React.PropTypes.string
]);

FullScreenModalHeader.propTypes = {
  actions: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      className: classProps,
      clickHandler: React.PropTypes.func,
      label: React.PropTypes.node
    })
  ),
  className: classProps,
  type: React.PropTypes.oneOf(['primary', 'secondary']).isRequired
};

module.exports = FullScreenModalHeader;
