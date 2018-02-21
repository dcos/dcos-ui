const ServiceEndpoint = require("../ServiceEndpoint");

let thisEndpointJSON, thisEndpointFile;

describe("ServiceEndpoint", function() {
  beforeEach(function() {
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
      endpointData: "<endpoint1>master.elastic.l4lb.thisdcos.directory:9200</endpoint1>"
    });
  });
  describe("#getName", function() {
    it("returns correct endpoint name", function() {
      expect(thisEndpointJSON.getName()).toEqual("master-http");
      expect(thisEndpointFile.getName()).toEqual("core-site.xml");
    });
  });

  describe("#getVip", function() {
    it("returns correct vip", function() {
      expect(thisEndpointJSON.getVip()).toEqual("vip1");
    });
  });

  describe("#getAddress", function() {
    it("returns correct address", function() {
      expect(thisEndpointJSON.getAddress()).toEqual("address1,address2");
    });
  });

  describe("#getDns", function() {
    it("returns correct dns", function() {
      expect(thisEndpointJSON.getDns()).toEqual("dns1,dns2");
    });
  });

  describe("#isJSON", function() {
    it("returns true for the JSON type", function() {
      expect(thisEndpointJSON.isJSON()).toEqual(true);
    });
    it("returns false for the File type", function() {
      expect(thisEndpointFile.isJSON()).toEqual(false);
    });
  });
});
