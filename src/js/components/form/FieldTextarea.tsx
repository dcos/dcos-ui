import classNames from "classnames/dedupe";
import * as React from "react";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export default ({ className, ...props }: Props) => (
  <textarea className={classNames("form-control", className)} {...props} />
);
