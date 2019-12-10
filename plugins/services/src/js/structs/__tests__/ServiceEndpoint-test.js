import ServiceEndpoint from "../ServiceEndpoint";

let thisEndpointJSON, thisEndpointFile;

describe("ServiceEndpoint", () => {
  beforeEach(() => {
    thisEndpointJSON = new ServiceEndpoint({
      serviceId: "/elastic",
      contentType: "application/json",
      endpointName: "master-http",
      endpointData: {
        address: ["address1", "address2"],
        dns: ["dns1", "dns2"],
        vip: "vip1"
      }
    });
    thisEndpointFile = new ServiceEndpoint({
      serviceId: "/hdfs",
      contentType: "text/plain",
      endpointName: "core-site.xml",
      endpointData:
        "<endpoint1>master.elastic.l4lb.thisdcos.directory:9200</endpoint1>"
    });
  });
  describe("#getName", () => {
    it("returns correct endpoint name", () => {
      expect(thisEndpointJSON.getName()).toEqual("master-http");
      expect(thisEndpointFile.getName()).toEqual("core-site.xml");
    });
  });

  describe("#getVip", () => {
    it("returns correct vip", () => {
      expect(thisEndpointJSON.getVip()).toEqual("vip1");
    });
  });

  describe("#getAddress", () => {
    it("returns correct address", () => {
      expect(thisEndpointJSON.getAddress()).toEqual("address1,address2");
    });
  });

  describe("#getDns", () => {
    it("returns correct dns", () => {
      expect(thisEndpointJSON.getDns()).toEqual("dns1,dns2");
    });
  });

  describe("#isJSON", () => {
    it("returns true for the JSON type", () => {
      expect(thisEndpointJSON.isJSON()).toEqual(true);
    });
    it("returns false for the File type", () => {
      expect(thisEndpointFile.isJSON()).toEqual(false);
    });
  });
});
