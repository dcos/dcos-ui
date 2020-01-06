import * as React from "react";
import classNames from "classnames/dedupe";

import { omit } from "../../utils/Util";

export default (
  props: { inputRef?: string } & React.InputHTMLAttributes<HTMLInputElement>
) => {
  const { className, inputRef, type = "text" } = props;
  const classes = classNames("form-control", className);

  const toggleIndicator = ["radio", "checkbox"].includes(type) ? (
    <span className="form-control-toggle-indicator" />
  ) : null;

  return (
    <span>
      <input
        className={classes}
        ref={inputRef}
        {...omit(props, ["className", "inputRef"])}
      />
      {toggleIndicator}
    </span>
  );
};
