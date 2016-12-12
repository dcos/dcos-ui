import classNames from 'classnames';
import React from 'react';

import {getDuration} from '../../../../../src/js/utils/DateUtil';
import {isObject} from '../../../../../src/js/utils/Util';
import Icon from '../../../../../src/js/components/Icon';

const ServiceConfigDisplayUtil = {
  getColumnClassNameFn(classes) {
    return (prop, sortBy) => {
      return classNames(classes, {
        'active': prop === sortBy.prop
      });
    };
  },

  getColumnHeadingFn(defaultHeading) {
    return (prop, order, sortBy) => {
      let caretClassNames = classNames('caret', {
        [`caret--${order}`]: order != null && sortBy.prop === prop,
        'caret--visible': sortBy.prop === prop
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

  getDisplayValue(value) {
    // Return the emdash character.
    if (value == null || value === '') {
      return String.fromCharCode(8212);
    }

    // Display nested objects nicely if the render didn't already cover it.
    if (isObject(value)) {
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
  },

  renderMillisecondsFromSeconds(prop, row) {
    let value = row[prop];

    if (value != null) {
      value = getDuration(value);
    }

    return ServiceConfigDisplayUtil.getDisplayValue(value);
  }
};

module.exports = ServiceConfigDisplayUtil;
