let SidebarActions;

module.exports = {
  actions: [
    'closeSidebar',
    'pluginsConfigured'
  ],

  filters: [
    'hasCapability'
  ],

  initialize(SDK) {
    SidebarActions = require('../events/SidebarActions');

    this.actions.forEach(action => {
      SDK.Hooks.addAction(action, this[action].bind(this));
    });
    this.filters.forEach(filter => {
      SDK.Hooks.addFilter(filter, this[filter].bind(this));
    });

    this.SDK = SDK;
  },

  closeSidebar() {
    SidebarActions.close();
  },

  hasCapability() {
    // Users have access to everything by default
    return true;
  },

  pluginsConfigured() {
    // Filter the Application's configuration
    this.SDK.Hooks.applyFilter('applicationConfiguration', this.SDK.config);
  }
};
