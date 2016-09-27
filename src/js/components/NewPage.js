import classNames from 'classnames/dedupe';
import React from 'react';

class Page extends React.Component {
  render() {
    let {props} = this;
    let classes = classNames('page', props.className);

    return (
      <div className={classes}>
        {props.children}
      </div>
    );
  }
}

Page.propTypes = {
  children: React.PropTypes.node,
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ])
};

module.exports = Page;
