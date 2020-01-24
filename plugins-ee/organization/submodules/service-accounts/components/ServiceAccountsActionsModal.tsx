import { Trans } from "@lingui/macro";

import * as React from "react";

import AccountActionsModal from "../../../components/AccountActionsModal";
import getACLServiceAccountsStore from "../../service-accounts/stores/ACLServiceAccountsStore";

const ACLServiceAccountsStore = getACLServiceAccountsStore();

class ServiceAccountsActionsModal extends AccountActionsModal {
  constructor(...args) {
    super(...args);

    this.store_listeners = this.store_listeners.concat([
      // prettier-ignore
      {name: "aclServiceAccounts", events: ["deleteError", "deleteSuccess"], suppressUpdate: true}
    ]);
  }

  onAclServiceAccountsStoreDeleteSuccess(...args) {
    this.onActionSuccess(...args);
  }

  onAclServiceAccountsStoreDeleteError(...args) {
    this.onActionError(...args);
  }

  deleteAccount(serviceAccountID) {
    ACLServiceAccountsStore.delete(serviceAccountID);
  }

  getActionsModalContents() {
    const { itemType } = this.props;
    const { requestErrors, validationError } = this.state;

    return (
      <div>
        <p>{this.getActionsModalContentsText()}</p>
        {this.getWarning()}
        {this.getDropdown(itemType)}
        {this.getErrorMessage(validationError)}
        {this.getRequestErrorMessage(requestErrors)}
      </div>
    );
  }

  getWarning() {
    const { action, selectedItems } = this.props;

    if (action !== "delete") {
      return null;
    }

    const hasEssentialItem = selectedItems.find(item =>
      item.uid.startsWith("dcos_")
    );

    if (hasEssentialItem) {
      return (
        <Trans render="p" className="text-danger">
          This action is irreversible and may break your cluster.
        </Trans>
      );
    }
  }
}

export default ServiceAccountsActionsModal;
