import { Trans } from "@lingui/macro";
import classNames from "classnames/dedupe";
import * as React from "react";

type Action = {
  className?: string;
  clickHandler?: (e?: any) => void;
  disabled?: boolean;
  label?: string;
  node?: React.ReactNode;
};
class FullScreenModalHeaderActions extends React.Component<{
  actions: Action[];
  className?: string;
  type: "primary" | "secondary";
}> {
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
            <Trans id={label} />
          </button>
        );
      }
    );
  }

  render() {
    const classes = classNames(
      `modal-full-screen-actions modal-full-screen-actions-${this.props.type} flush-vertical`,
      this.props.className
    );

    return <div className={classes}>{this.getActions()}</div>;
  }
}

export default FullScreenModalHeaderActions;
