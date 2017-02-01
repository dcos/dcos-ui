import classNames from 'classnames';
import React from 'react';

import FormGroupHeadingContent from './FormGroupHeadingContent';

function getChildren(children, required) {
  if (!required) {
    return children;
  }

  // We add the required field indicator after the first child.
  return React.Children.toArray(children).reduce(
    function (accumulator, child, index) {
      accumulator.push(child);

      if (index === 0) {
        accumulator.push(
          <FormGroupHeadingContent
            className="text-danger"
            key={`${index}-asterisk`}>
            *
          </FormGroupHeadingContent>
        );
      }

      return accumulator;
    },
    []
  );
}

function FormGroupHeading({className, children, required}) {
  const classes = classNames('form-group-heading', className);

  return (
    <div className={classes}>
      {getChildren(children, required)}
    </div>
  );
}

FormGroupHeading.defaultProps = {
  required: false
};

FormGroupHeading.propTypes = {
  children: React.PropTypes.node.isRequired,
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  required: React.PropTypes.bool
};

module.exports = FormGroupHeading;
