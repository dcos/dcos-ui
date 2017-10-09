import React, { Component } from "react";

import EditFrameworkConfiguration
  from "#PLUGINS/services/src/js/pages/EditFrameworkConfiguration";
import CreateServiceModal
  from "#PLUGINS/services/src/js/components/modals/CreateServiceModal";
import Framework from "#PLUGINS/services/src/js/structs/Framework";
import DCOSStore from "#SRC/js/stores/DCOSStore";

class EditServiceModal extends Component {
  render() {
    const { id = "/" } = this.props.params;
    const serviceID = decodeURIComponent(id);
    const service = DCOSStore.serviceTree.findItemById(serviceID);

    if (service instanceof Framework) {
      return <EditFrameworkConfiguration {...this.props} />;
    } else {
      return <CreateServiceModal {...this.props} />;
    }
  }
}

export default EditServiceModal;
