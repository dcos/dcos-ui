import classNames from 'classnames/dedupe';
import React from 'react';

class FullScreenModalHeaderActions extends React.Component {
  getActions() {
    let {actions} = this.props;

    if (!actions || actions.length === 0) {
      return null;
    }

    return actions.map(({className, clickHandler, label, node}, index) => {
      if (node) {
        return node;
      }

      let classes = classNames('button', className);

      return (
        <button className={classes} key={index} onClick={clickHandler}>
          {label}
        </button>
      );
    });
  }

  render() {
    let {className, type} = this.props;

    let classes = classNames(
      `modal-full-screen-actions modal-full-screen-actions-${type} button-collection flush-vertical`,
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

FullScreenModalHeaderActions.propTypes = {
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

module.exports = FullScreenModalHeaderActions;
