import React, { Component } from "react";

import EditFrameworkConfiguration
  from "#PLUGINS/services/src/js/pages/EditFrameworkConfiguration";
import CreateServiceModal
  from "#PLUGINS/services/src/js/components/modals/CreateServiceModal";
import Framework from "#PLUGINS/services/src/js/structs/Framework";
import DCOSStore from "#SRC/js/stores/DCOSStore";
import { Hooks } from "PluginSDK";

class EditServiceModal extends Component {
  render() {
    const { id = "/" } = this.props.params;
    const serviceID = decodeURIComponent(id);
    const service = DCOSStore.serviceTree.findItemById(serviceID);

    // when API migrated: https://jira.mesosphere.com/browse/DCOS-19824
    // also re-add "Edit Action" tests in ServiceActions-cy
    if (
      service instanceof Framework &&
      Hooks.applyFilter("hasCosmosServiceUpdateAPI", false)
    ) {
      return <EditFrameworkConfiguration {...this.props} />;
    }

    return <CreateServiceModal {...this.props} />;
  }
}

export default EditServiceModal;
