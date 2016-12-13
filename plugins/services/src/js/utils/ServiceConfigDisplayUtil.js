import classNames from 'classnames';
import React from 'react';

import {getDuration} from '../../../../../src/js/utils/DateUtil';
import {isObject} from '../../../../../src/js/utils/Util';
import defaultServiceImage from '../../img/icon-service-default-small.png';
import Image from '../../../../../src/js/components/Image';

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
        <Image fallbackSrc={defaultServiceImage}
          src={defaultServiceImage} width={24} height={24}
          style={{verticalAlign: 'middle'}} />
        <span>&nbsp;{container.name}</span>
      </span>
    );
  },

  getDisplayValue(value, isDisabled = false) {
    if (!isDisabled && (value == null || value === '')) {
      return <i>Not Configured</i>;
    }
    if (isDisabled && (value == null || value === '')) {
      return <i>Not Supported</i>;
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
        <Image fallbackSrc={defaultServiceImage}
          src={defaultServiceImage} width={24} height={24}
          style={{verticalAlign: 'middle'}} />
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
