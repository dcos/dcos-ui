// Cannot import here because of Circular reference.
// PluginSDK imports this module, which imports HistoryStore
// and HistoryStore imports PluginSDK via GetSetMixin.
let HistoryStore;
let SidebarActions;

module.exports = {
  actions: [
    'closeSidebar',
    'goBack',
    'pluginsConfigured'
  ],

  filters: [
    'hasCapability',
    'getHistoryAt'
  ],

  initialize(SDK) {
    HistoryStore = require('../stores/HistoryStore');
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

  goBack(router) {
    HistoryStore.goBack(router);
  },

  getHistoryAt(index) {
    return HistoryStore.getHistoryAt(index);
  },

  pluginsConfigured() {
    // Filter the Application's configuration
    this.SDK.Hooks.applyFilter('applicationConfiguration', this.SDK.config);
  }
};
