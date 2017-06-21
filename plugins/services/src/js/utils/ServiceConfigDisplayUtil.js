import classNames from "classnames";
import React from "react";

import { isObject } from "../../../../../src/js/utils/Util";
import Icon from "../../../../../src/js/components/Icon";

const ServiceConfigDisplayUtil = {
  getColumnClassNameFn(classes) {
    return (prop, sortBy) => {
      return classNames(classes, {
        active: prop === sortBy.prop
      });
    };
  },

  getColumnHeadingFn(defaultHeading) {
    return (prop, order, sortBy) => {
      const caretClassNames = classNames("caret", {
        [`caret--${order}`]: order != null && sortBy.prop === prop,
        "caret--visible": sortBy.prop === prop
      });

      return (
        <span>
          {defaultHeading || prop}
          <span className={caretClassNames} />
        </span>
      );
    };
  },

  getContainerNameWithIcon(container) {
    return (
      <span>
        <Icon id="container" size="mini" color="purple" />
        <span>&nbsp;{container.name}</span>
      </span>
    );
  },

  getDisplayValue(value, isDisabled = false) {
    if (!isDisabled && (value == null || value === "")) {
      return <em>Not Configured</em>;
    }
    if (isDisabled && (value == null || value === "")) {
      return <em>Not Supported</em>;
    }

    // Display nested objects nicely if the render didn't already cover it.
    if (isObject(value) && !React.isValidElement(value)) {
      return (
        <pre className="flush transparent wrap">
          {JSON.stringify(value)}
        </pre>
      );
    }

    return value;
  },

  getSharedIconWithLabel() {
    return (
      <span>
        <Icon id="container" size="mini" color="purple" />
        <em>&nbsp;Shared</em>
      </span>
    );
  }
};

module.exports = ServiceConfigDisplayUtil;
