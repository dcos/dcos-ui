import classNames from 'classnames/dedupe';
import React from 'react';

class FullScreenModalHeaderTitle extends React.Component {
  render() {
    let {children, className} = this.props;
    let classes = classNames(
      'modal-full-screen-header-title h3 flush',
      className
    );

    return (
      <div className={classes}>
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

FullScreenModalHeaderTitle.propTypes = {
  children: React.PropTypes.node.isRequired,
  className: classProps
};

module.exports = FullScreenModalHeaderTitle;
