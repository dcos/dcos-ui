import classNames from "classnames";
import * as React from "react";
import { Trans } from "@lingui/macro";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  iconSizeXs,
  purple,
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import { isObject } from "#SRC/js/utils/Util";
import { EmptyStates } from "#SRC/js/constants/EmptyStates";

export function getColumnClassNameFn(classes: string) {
  return (prop: string, sortBy: any) => {
    return classNames(classes, {
      active: prop === sortBy.prop,
    });
  };
}

export function getColumnHeadingFn(defaultHeading: string) {
  return (prop: string, order: number | undefined, sortBy: any) => {
    const caretClassNames = classNames("caret", {
      [`caret--${order}`]: order != null && sortBy.prop === prop,
      "caret--visible": sortBy.prop === prop,
    });

    return (
      <span>
        {defaultHeading ? <Trans render="span" id={defaultHeading} /> : prop}
        <span className={caretClassNames} />
      </span>
    );
  };
}

export function getContainerNameWithIcon(container: any) {
  return (
    <span>
      <Icon shape={SystemIcons.Container} size={iconSizeXs} color={purple} />
      <span>&nbsp;{container.name}</span>
    </span>
  );
}

export function getDisplayValue(value: any) {
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
}

export function getSharedIconWithLabel() {
  return (
    <span>
      <Icon shape={SystemIcons.Container} size={iconSizeXs} color={purple} />
      <em>&nbsp;Shared</em>
    </span>
  );
}
