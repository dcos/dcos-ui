import classNames from 'classnames/dedupe';
import React from 'react';
import {Tooltip} from 'reactjs-components';

import {findNestedPropertyInObject, omit} from '../../utils/Util';
import Icon from '../Icon';

const FieldLabel = (props) => {
  const {
    children,
    className,
    matchInputHeight,
    required,
    tooltipContent,
    tooltipIconID,
    wordWrap
  } = props;

  let isToggle = false;

  React.Children.forEach(children, (child) => {
    const type = findNestedPropertyInObject(child, 'props.type');
    if (['radio', 'checkbox'].includes(type)) {
      isToggle = true;
    }
  });

  const classes = classNames(
    'form-control-label',
    {'form-control-toggle form-control-toggle-custom': isToggle},
    className
  );
  const contentWrapperClasses = classNames(
    'form-control-label-content-wrapper',
    {'form-control-label-content-wrapper-no-wrap': !wordWrap && !isToggle}
  );

  let childNodes = children;
  let requiredNode;
  let tooltipNode;

  if (required) {
    requiredNode = (
      <span className="form-control-label-content form-control-label-content-secondary text-danger">
        *
      </span>
    );
  }

  if (!isToggle) {
    childNodes = (
      <span className="form-control-label-content form-control-label-content-primary">
        {children}
      </span>
    );
  }

  if (tooltipContent != null) {
    tooltipNode = (
      <Tooltip
        content={tooltipContent}
        interactive={typeof tooltipContent !== 'string'}
        maxWidth={300}
        scrollContainer=".gm-scroll-view"
        wrapperClassName="form-control-label-content form-control-label-content-secondary tooltip-wrapper"
        wrapText={true}>
        <Icon color="grey" id={tooltipIconID} size="mini" />
      </Tooltip>
    );
  }

  const label = (
    <label className={classes}
      {...omit(props, Object.keys(FieldLabel.propTypes))}>
      <span className={contentWrapperClasses}>
        {childNodes}
        {tooltipNode}
        {requiredNode}
      </span>
    </label>
  );

  if (!matchInputHeight) {
    return label;
  }

  return (
    <div className="form-control-input-height">
      {label}
    </div>
  );
};

FieldLabel.defaultProps = {
  tooltipIconID: 'circle-question',
  wordWrap: false
};

FieldLabel.propTypes = {
  children: React.PropTypes.node,
  // Vertically center the element based on the height of input fields
  matchInputHeight: React.PropTypes.bool,
  // Optional boolean to show a required indicator
  required: React.PropTypes.bool,
  tooltipIconID: React.PropTypes.string,
  tooltipContent: React.PropTypes.node,

  // Classes
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  wordWrap: React.PropTypes.bool
};

module.exports = FieldLabel;
