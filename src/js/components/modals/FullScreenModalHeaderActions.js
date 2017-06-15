import classNames from "classnames/dedupe";
import React from "react";

class FullScreenModalHeaderActions extends React.Component {
  getActions() {
    const { actions } = this.props;

    if (!actions || actions.length === 0) {
      return null;
    }

    return actions.map(
      ({ className, clickHandler, label, node, disabled }, index) => {
        if (node) {
          return node;
        }

        const classes = classNames("button flush-top", className);

        return (
          <button
            className={classes}
            disabled={disabled}
            key={index}
            onClick={clickHandler}
          >
            {label}
          </button>
        );
      }
    );
  }

  render() {
    const { className, type } = this.props;

    const classes = classNames(
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
  type: React.PropTypes.oneOf(["primary", "secondary"]).isRequired
};

module.exports = FullScreenModalHeaderActions;
