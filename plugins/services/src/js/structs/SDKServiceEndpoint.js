import Item from "#SRC/js/structs/Item";

class SDKServiceEndpoint extends Item {
  getEndpointName() {
    return this.get("endpointName");
  }
  getEndpointData() {
    return this.get("endpointData");
  }
  getVip() {
    const endpointData = this.get("endpointData");
    if (!endpointData.vip) {
      return null;
    }

    return Array.isArray(endpointData.vip)
      ? endpointData.vip.join(", ")
      : endpointData.vip;
  }
  getAddress() {
    const endpointData = this.get("endpointData");
    if (endpointData && !endpointData.address) {
      return "";
    }

    return Array.isArray(endpointData.address)
      ? endpointData.address.join(", ")
      : endpointData.address;
  }
  getDns() {
    const endpointData = this.get("endpointData");
    if (endpointData && !endpointData.dns) {
      return "";
    }

    return Array.isArray(endpointData.dns)
      ? endpointData.dns.join(", ")
      : endpointData.dns;
  }
  isJSON() {
    return this.get("contentType") === "application/json";
  }
}

module.exports = SDKServiceEndpoint;
