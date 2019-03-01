import classNames from "classnames";
import React from "react";
import { Trans } from "@lingui/macro";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  iconSizeXs,
  purple
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import { isObject } from "#SRC/js/utils/Util";
import EmptyStates from "#SRC/js/constants/EmptyStates";

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
          {defaultHeading ? <Trans render="span" id={defaultHeading} /> : prop}
          <span className={caretClassNames} />
        </span>
      );
    };
  },

  getContainerNameWithIcon(container) {
    return (
      <span>
        <Icon shape={SystemIcons.Container} size={iconSizeXs} color={purple} />
        <span>&nbsp;{container.name}</span>
      </span>
    );
  },

  getDisplayValue(value) {
    if (value == null || value === "") {
      return <em>{EmptyStates.CONFIG_VALUE}</em>;
    }

    // Display nested objects nicely if the render didn't already cover it.
    if (isObject(value) && !React.isValidElement(value)) {
      return (
        <pre className="flush transparent wrap">{JSON.stringify(value)}</pre>
      );
    }

    return value;
  },

  getSharedIconWithLabel() {
    return (
      <span>
        <Icon shape={SystemIcons.Container} size={iconSizeXs} color={purple} />
        <em>&nbsp;Shared</em>
      </span>
    );
  }
};

module.exports = ServiceConfigDisplayUtil;
