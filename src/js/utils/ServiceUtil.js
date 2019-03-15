const ServiceUtil = {
  isSDKService(service = {}) {
    if (typeof service.getLabels !== "function") {
      return false;
    }

    const labels = service.getLabels();

    return labels.DCOS_COMMONS_API_VERSION != null;
  },

  isPackage(service = {}) {
    if (typeof service.getLabels !== "function") {
      return false;
    }

    const labels = service.getLabels();

    return labels.DCOS_PACKAGE_NAME != null;
  }
};

export default ServiceUtil;
