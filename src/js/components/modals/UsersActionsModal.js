/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import ActionsModal from './ActionsModal';
import UserStore from '../../stores/UserStore';

class UsersActionsModal extends ActionsModal {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {
        name: 'user',
        events: ['deleteError', 'deleteSuccess'],
        suppressUpdate: true
      }
    ];

  }

  onUserStoreDeleteError(requestError) {
    this.onActionError(requestError);
  }

  onUserStoreDeleteSuccess() {
    this.onActionSuccess();
  }

  handleButtonConfirm() {
    let {itemID, selectedItems} = this.props;
    let itemsByID = selectedItems.map(function (item) {
      return item[itemID];
    });

    itemsByID.forEach(function (userID) {
      UserStore.deleteUser(userID);
    });

    this.setState({pendingRequest: true, requestErrors: []});
  }
}

UsersActionsModal.propTypes = {
  action: React.PropTypes.string.isRequired,
  actionText: React.PropTypes.object.isRequired,
  itemID: React.PropTypes.string.isRequired,
  onClose: React.PropTypes.func.isRequired,
  selectedItems: React.PropTypes.array.isRequired
};

module.exports = UsersActionsModal;
