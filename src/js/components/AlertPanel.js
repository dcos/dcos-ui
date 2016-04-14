var classNames = require('classnames');
var React = require('react');
var ReactDOM = require('react-dom');

var InternalStorageMixin = require('../mixins/InternalStorageMixin');
var DOMUtils = require('../utils/DOMUtils');
var Panel = require('./Panel');

var AlertPanel = React.createClass({

  displayName: 'AlertPanel',

  mixins: [InternalStorageMixin],

  propTypes: {
    title: React.PropTypes.string,
    iconClassName: React.PropTypes.string
  },

  componentWillMount: function () {
    this.internalStorage_set({height: 0});
  },

  componentDidMount: function () {
    var panel = ReactDOM.findDOMNode(this.refs.panel);
    var width = DOMUtils.getComputedWidth(panel);
    this.internalStorage_set({height: width});
    this.forceUpdate();
  },

  getTitle: function () {
    let classes = classNames({
      inverse: true,
      'flush-top': !this.props.iconClassName
    });

    return (
      <h3 className={classes}>
        {this.props.title}
      </h3>
    );
  },

  getIcon: function () {
    let classes = this.props.iconClassName;
    if (!classes) {
      return null;
    }

    return (
      <i className={classes}></i>
    );
  },

  render: function () {
    var data = this.internalStorage_get();
    var classes = {
      'container container-fluid container-pod': true
    };
    if (this.props.className) {
      classes[this.props.className] = true;
    }

    var classSet = classNames(classes);

    return (
      <div className={classSet}>
        <div className="column-small-offset-2 column-small-8 column-medium-offset-3 column-medium-6 column-large-offset-4 column-large-4">
          <Panel ref="panel"
            style={{height: data.height}}
            className="panel panel-inverse vertical-center horizontal-center text-align-center flush alert-panel"
            footer={this.props.footer}
            footerClass="panel-footer flush"
            heading={this.getIcon()}
            headingClass="panel-header no-border flush">
            {this.getTitle()}
            {this.props.children}
          </Panel>
        </div>
      </div>
    );
  }
});

module.exports = AlertPanel;
