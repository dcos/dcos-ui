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
import UserFormModal from '../../components/modals/UserFormModal';

const USERS_CHANGE_EVENTS = [
  'onUserStoreCreateSuccess',
  'onUserStoreDeleteSuccess'
];

const METHODS_TO_BIND = [
  'handleNewUserClick',
  'handleNewUserClose',
  'onUsersStoreSuccess',
  'onUsersStoreError'
];

class UsersTab extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = Hooks.applyFilter('usersTabStoreListeners', [
      {
        name: 'user',
        events: ['createSuccess', 'deleteSuccess'],
        suppressUpdate: true
      },
      {name: 'users', events: ['success', 'error'], suppressUpdate: true}
    ]);

    this.state = {
      openNewUserModal: false,
      usersStoreError: false,
      usersStoreSuccess: false
    };

    Hooks.applyFilter('usersTabChangeEvents', USERS_CHANGE_EVENTS).forEach(
      (event) => {
        this[event] = this.onUsersChange;
      }
    );

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

  handleNewUserClick() {
    this.setState({openNewUserModal: true});
  }

  handleNewUserClose() {
    this.setState({openNewUserModal: false});
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
        itemName="user"
        handleNewItemClick={this.handleNewUserClick} />,
        this
    );
  }

  render() {
    return (
      <div>
        {this.getContents()}
        <UserFormModal
          open={this.state.openNewUserModal}
          onClose={this.handleNewUserClose}/>
      </div>
    );
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
