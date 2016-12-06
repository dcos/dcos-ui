import mixin from 'reactjs-mixin';
import {Hooks} from 'PluginSDK';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import UsersStore from '../../stores/UsersStore';
import Loader from '../../components/Loader';
import OrganizationTab from './OrganizationTab';
import RequestErrorMsg from '../../components/RequestErrorMsg';

const METHODS_TO_BIND = [
  'onUsersStoreSuccess',
  'onUsersStoreError'
];

class UsersTab extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = Hooks.applyFilter('usersTabStoreListeners', [
      {name: 'users', events: ['success', 'error'], suppressUpdate: true}
    ]);

    this.state = {
      usersStoreError: false,
      usersStoreSuccess: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount();
    UsersStore.fetchUsers();
  }

  onUsersChange() {
    UsersStore.fetchUsers();
  }

  onUsersStoreSuccess() {
    this.setState({
      usersStoreError: false,
      usersStoreSuccess: true
    });
  }

  onUsersStoreError() {
    this.setState({
      usersStoreError: true,
      usersStoreSuccess: false
    });
  }

  handleSearchStringChange(searchString) {
    this.setState({searchString});
  }

  getLoadingScreen() {
    return <Loader />;
  }

  getContents() {
    // We want to always render the portals (side panel and modal),
    // so only this part is showing loading and error screen.
    if (this.state.usersStoreError) {
      return (
        <RequestErrorMsg />
      );
    }

    if (!this.state.usersStoreSuccess) {
      return this.getLoadingScreen();
    }

    let items = UsersStore.getUsers().getItems();

    return Hooks.applyFilter('usersTabContent',
      <OrganizationTab
        key="organization-tab"
        items={items}
        itemID="uid"
        itemName="user" />,
        this
    );
  }

  render() {
    return this.getContents();
  }
}

UsersTab.propTypes = {
  params: React.PropTypes.object
};

UsersTab.routeConfig = {
  label: 'Users',
  matches: /^\/organization\/users/
};

module.exports = UsersTab;
