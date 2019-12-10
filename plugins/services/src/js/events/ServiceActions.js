import CosmosPackagesActions from "#SRC/js/events/CosmosPackagesActions";
import MarathonActions from "./MarathonActions";
import Framework from "../structs/Framework";

const ServiceActions = {
  deleteGroup(group, force) {
    const groupId = group.getId();
    MarathonActions.deleteGroup(groupId, force);
  },
  deleteService(service, force) {
    if (service instanceof Framework) {
      CosmosPackagesActions.uninstallPackage(
        service.getPackageName(),
        service.getId()
      );

      return;
    }
    MarathonActions.deleteService(service, force);
  }
};

export default ServiceActions;
