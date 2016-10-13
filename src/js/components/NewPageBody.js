import classNames from 'classnames/dedupe';
import GeminiScrollbar from 'react-gemini-scrollbar';
import React from 'react';

class PageHeader extends React.Component {
  render() {
    let {props} = this;

    let contentClasses = classNames('pod', props.contentClassName);
    let scrollbarClasses = classNames(
      'page-body gm-scrollbar-container-flex',
      props.scrollbarClassName
    );

    return (
      <GeminiScrollbar className={scrollbarClasses}>
        <div className={contentClasses}>
          {props.children}
        </div>
      </GeminiScrollbar>
    );
  }
}

PageHeader.propTypes = {
  children: React.PropTypes.node,
  contentClassName: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  scrollbarClassName: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ])
};

module.exports = PageHeader;
