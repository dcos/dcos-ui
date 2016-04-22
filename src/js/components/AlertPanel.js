var classNames = require('classnames');
var React = require('react');

var Panel = require('./Panel');

var AlertPanel = React.createClass({

  displayName: 'AlertPanel',

  propTypes: {
    title: React.PropTypes.string,
    iconClassName: React.PropTypes.string
  },

  getTitle: function () {
    return (
      <h3 className="inverse flush-top">
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
    var classes = {
      'container container-fluid container-pod': true
    };
    if (this.props.className) {
      classes[this.props.className] = true;
    }

    var classSet = classNames(classes);

    return (
      <div className={classSet}>
        <Panel ref="panel"
          className="panel panel-inverse vertical-center horizontal-center
            text-align-center flush-bottom alert-panel"
          footer={this.props.footer}
          footerClass="panel-footer flush-top"
          heading={this.getIcon()}
          headingClass="panel-header no-border flush-bottom">
          {this.getTitle()}
          {this.props.children}
        </Panel>
      </div>
    );
  }
});

module.exports = AlertPanel;
