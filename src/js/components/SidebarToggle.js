var React = require('react');

import EventTypes from '../constants/EventTypes';
var InternalStorageMixin = require('../mixins/InternalStorageMixin');
var SidebarActions = require('../events/SidebarActions');
var SidebarStore = require('../stores/SidebarStore');

function getSidebarState() {
  return {
    isOpen: SidebarStore.get('isOpen')
  };
}

var SidebarToggle = React.createClass({

  displayName: 'SidebarToggle',

  mixins: [InternalStorageMixin],

  componentWillMount: function () {
    this.internalStorage_set(getSidebarState());
  },

  componentDidMount: function () {
    SidebarStore.addChangeListener(
      EventTypes.SIDEBAR_CHANGE,
      this.onSidebarStateChange
    );
  },

  componentWillUnmount: function () {
    SidebarStore.removeChangeListener(
      EventTypes.SIDEBAR_CHANGE,
      this.onSidebarStateChange
    );
  },

  onSidebarStateChange: function () {
    this.internalStorage_set(getSidebarState());
    this.forceUpdate();
  },

  onClick: function (e) {
    var data = this.internalStorage_get();

    e.preventDefault();

    if (data.isOpen) {
      SidebarActions.close();
    } else {
      SidebarActions.open();
    }

  },

  render: function () {
    return (
      <div className="page-navigation-sidebar-toggle" onClick={this.onClick}>
        <span className="page-navigation-sidebar-toggle-icon icon icon-white
          icon-margin-right icon-margin-right-wide icon-small" />
        <span className="page-navigation-sidebar-toggle-label">
          Show/Hide Sidebar
        </span>
      </div>
    );
  }
});

module.exports = SidebarToggle;
