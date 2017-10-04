import React, { Component } from "react";

import EditFrameworkConfiguration
  from "#PLUGINS/services/src/js/pages/EditFrameworkConfiguration";
import CreateServiceModal
  from "#PLUGINS/services/src/js/components/modals/CreateServiceModal";
import Framework from "#PLUGINS/services/src/js/structs/Framework";
import DCOSStore from "#SRC/js/stores/DCOSStore";

class EditServiceModal extends Component {
  render() {
    const { params } = this.props;

    const serviceID = decodeURIComponent(params.id || "/");
    const service = DCOSStore.serviceTree.findItemById(serviceID);

    let child = null;
    if (service instanceof Framework) {
      child = <EditFrameworkConfiguration {...this.props} />;
    } else {
      child = <CreateServiceModal {...this.props} />;
    }

    return child;
  }
}

export default EditServiceModal;
