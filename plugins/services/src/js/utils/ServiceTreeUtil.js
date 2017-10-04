import ServiceTree from "../structs/ServiceTree";

const ServiceTreeUtil = {
  isGroupWithServices(service) {
    if (service instanceof ServiceTree && service.getListCount() > 0) {
      return true;
    }

    return false;
  }
};

module.exports = ServiceTreeUtil;
