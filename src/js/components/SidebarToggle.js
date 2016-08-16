import React from 'react';

import EventTypes from '../constants/EventTypes';
import InternalStorageMixin from '../mixins/InternalStorageMixin';
import SidebarActions from '../events/SidebarActions';
import SidebarStore from '../stores/SidebarStore';

function getSidebarState() {
  return {
    isOpen: SidebarStore.get('isOpen')
  };
}

var SidebarToggle = React.createClass({

  displayName: 'SidebarToggle',

  mixins: [InternalStorageMixin],

  componentWillMount() {
    this.internalStorage_set(getSidebarState());
  },

  componentDidMount() {
    SidebarStore.addChangeListener(
      EventTypes.SIDEBAR_CHANGE,
      this.onSidebarStateChange
    );
  },

  componentWillUnmount() {
    SidebarStore.removeChangeListener(
      EventTypes.SIDEBAR_CHANGE,
      this.onSidebarStateChange
    );
  },

  onSidebarStateChange() {
    this.internalStorage_set(getSidebarState());
    this.forceUpdate();
  },

  onClick(e) {
    var data = this.internalStorage_get();

    e.preventDefault();

    if (data.isOpen) {
      SidebarActions.close();
    } else {
      SidebarActions.open();
    }

  },

  render() {
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
