import classNames from 'classnames/dedupe';
var GeminiScrollbar = require('react-gemini-scrollbar');
var React = require('react');
import {StoreMixin} from 'mesosphere-shared-reactjs';

import GeminiUtil from '../utils/GeminiUtil';
var InternalStorageMixin = require('../mixins/InternalStorageMixin');
var SidebarToggle = require('../components/SidebarToggle');

var Page = React.createClass({

  displayName: 'Page',

  mixins: [InternalStorageMixin, StoreMixin],

  propTypes: {
    className: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object,
      React.PropTypes.string
    ]),
    dontScroll: React.PropTypes.bool,
    navigation: React.PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.string
    ]),
    title: React.PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.string
    ])
  },

  componentWillMount: function () {
    this.store_listeners = [
      {
        name: 'sidebar',
        events: ['widthChange']
      }
    ];
  },

  componentDidMount: function () {
    this.internalStorage_set({
      rendered: true
    });
    this.forceUpdate();
  },

  onSidebarStoreWidthChange: function () {
    GeminiUtil.updateWithRef(this.refs.gemini);
  },

  getChildren: function () {
    var data = this.internalStorage_get();
    if (data.rendered === true) {
      return this.props.children;
    }
    return null;
  },

  getNavigation: function (navigation) {
    if (!navigation) {
      return null;
    }

    return (
      <div className="page-header-navigation">
        {navigation}
      </div>
    );
  },

  getPageHeader: function (title, navigation) {
    return (
      <div className="page-header flex-item-shrink-0 fill fill-light">
        <div className="page-header-inner">
          <div className="pod pod-short">
            {this.getTitle(title)}
            {this.getNavigation(navigation, title)}
          </div>
        </div>
      </div>
    );
  },

  getTitle: function (title) {
    if (!title) {
      return null;
    }

    if (React.isValidElement(title)) {
      return title;
    }

    return (
      <div>
        <SidebarToggle />
        <h1 className="page-header-title flush">
          {title}
        </h1>
      </div>
    );
  },

  getContent: function () {
    let {dontScroll} = this.props;
    let contentClassSet = classNames('page-content flex flex-direction-top-to-bottom flex-item-grow-1', {
      '': dontScroll
    });

    let content = this.getChildren();

    return (
      <div className={contentClassSet}>
        <div className="pod">
          {content}
        </div>
      </div>
    );
  },

  render: function () {
    let {className, navigation, dontScroll, title} = this.props;

    let classSet = classNames(
      'page flex flex-direction-top-to-bottom flex-item-grow-1',
      {'': dontScroll},
      className
    );

    return (
      <div className={classSet}>
        {this.getPageHeader(title, navigation)}
        <GeminiScrollbar
          autoshow={true}
          className="page-content-wrapper flex flex-direction-top-to-bottom flex-direction-left-to-right-screen-large flex-item-grow-1 flex-item-shrink-1"
          ref="gemini">
          {this.getContent()}
        </GeminiScrollbar>
      </div>
    );
  }
});

module.exports = Page;
