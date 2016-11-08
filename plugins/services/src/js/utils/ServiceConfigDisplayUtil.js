import classNames from 'classnames';
import React from 'react';

import DateUtil from '../../../../../src/js/utils/DateUtil';
import Util from '../../../../../src/js/utils/Util';

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

  getDisplayValue(value) {
    // Return the emdash character.
    if (value == null || value === '') {
      return String.fromCharCode(8212);
    }

    // Display nested objects nicely if the render didn't already cover it.
    if (Util.isObject(value)) {
      return (
        <pre className="flush transparent wrap">
          {JSON.stringify(value)}
        </pre>
      );
    }

    return value;
  },

  renderMillisecondsFromSeconds(prop, row) {
    let value = row[prop];

    if (value != null) {
      value = DateUtil.getDuration(value);
    }

    return ServiceConfigDisplayUtil.getDisplayValue(value);
  }
};

module.exports = ServiceConfigDisplayUtil;
