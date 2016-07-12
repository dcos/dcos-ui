var classNames = require('classnames');
var React = require('react');

var Panel = require('./Panel');

var AlertPanel = React.createClass({

  displayName: 'AlertPanel',

  defaultProps: {
    className: '',
    icon: null
  },

  propTypes: {
    title: React.PropTypes.string,
    icon: React.PropTypes.node,
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
    let {icon, iconClassName} = this.props;

    if (!!icon) {
      return icon;
    }

    if (!iconClassName) {
      return null;
    }

    return (
      <i className={iconClassName}></i>
    );
  },

  render: function () {
    let classes = classNames('container container-fluid container-pod',
      'flush-bottom', this.props.className);

    return (
      <div className={classes}>
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
