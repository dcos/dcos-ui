import { Trans } from "@lingui/macro";
import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
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
          <Trans
            id={label}
            render={
              <button
                className={classes}
                disabled={disabled}
                key={index}
                onClick={clickHandler}
              />
            }
          />
        );
      }
    );
  }

  render() {
    const { className, type } = this.props;

    const classes = classNames(
      `modal-full-screen-actions modal-full-screen-actions-${type} flush-vertical`,
      className
    );

    return <div className={classes}>{this.getActions()}</div>;
  }
}

const classProps = PropTypes.oneOfType([
  PropTypes.array,
  PropTypes.object,
  PropTypes.string
]);

FullScreenModalHeaderActions.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      className: classProps,
      clickHandler: PropTypes.func,
      label: PropTypes.node
    })
  ),
  className: classProps,
  type: PropTypes.oneOf(["primary", "secondary"]).isRequired
};

module.exports = FullScreenModalHeaderActions;
