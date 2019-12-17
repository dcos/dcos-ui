import * as React from "react";
import { hashHistory } from "react-router";

import EditFrameworkConfiguration from "#PLUGINS/services/src/js/pages/EditFrameworkConfiguration";
import CreateServiceModal from "#PLUGINS/services/src/js/components/modals/CreateServiceModal";
import ServiceRootGroupModal from "#PLUGINS/services/src/js/components/modals/ServiceRootGroupModal/index";
import DCOSStore from "#SRC/js/stores/DCOSStore";
import FullScreenModal from "#SRC/js/components/modals/FullScreenModal";
import ServiceTree from "#PLUGINS/services/src/js/structs/ServiceTree";

const EditServiceModal = props => {
  const { id = "/" } = props.params;
  const serviceID = decodeURIComponent(id);
  const serviceLoaded = DCOSStore.serviceDataReceived;
  const service = DCOSStore.serviceTree.findItemById(serviceID);

  // Loading, showing an empty modal instead
  if (!serviceLoaded) {
    return <FullScreenModal open={true} />;
  }

  // Service not found
  if (!service) {
    hashHistory.push("/services/404");

    return null;
  }

  if (service instanceof ServiceTree) {
    return <ServiceRootGroupModal id={id} {...props} />;
  }

  if (
    service.getLabels().DCOS_PACKAGE_DEFINITION != null ||
    service.getLabels().DCOS_PACKAGE_METADATA != null
  ) {
    return <EditFrameworkConfiguration {...props} />;
  }

  return <CreateServiceModal {...props} />;
};

export default EditServiceModal;
