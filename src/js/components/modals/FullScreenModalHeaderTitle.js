import classNames from 'classnames/dedupe';
import React from 'react';

class FullScreenModalHeader extends React.Component {
  render() {
    let {props: {children, className}} = this;

    let titleClasses = classNames(
      'modal-full-screen-header-title h3 flush',
      className
    );

    return (
      <div className={titleClasses}>
        {children}
      </div>
    );
  }
}

const classProps = React.PropTypes.oneOfType([
  React.PropTypes.array,
  React.PropTypes.object,
  React.PropTypes.string
]);

FullScreenModalHeader.propTypes = {
  children: React.PropTypes.node.isRequired,
  className: classProps
};

module.exports = FullScreenModalHeader;
