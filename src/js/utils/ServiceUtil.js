const ServiceUtil = {
  isSDKService(service = {}) {
    if (service.getLabels == null) {
      return false;
    }

    const labels = service.getLabels();

    return labels.DCOS_COMMONS_API_VERSION != null;
  }
};

module.exports = ServiceUtil;
