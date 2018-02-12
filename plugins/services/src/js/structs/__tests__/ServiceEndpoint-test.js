const ServiceEndpoint = require("../ServiceEndpoint");

describe("ServiceEndpoint", function() {
  beforeEach(function() {
    this.endpointJSON = new ServiceEndpoint({
      serviceId: "/elastic",
      contentType: "application/json",
      endpointName: "master-http",
      endpointData: {
        address: ["address1", "address2"],
        dns: ["dns1", "dns2"],
        vip: "vip1"
      }
    });
    this.endpointFile = new ServiceEndpoint({
      serviceId: "/hdfs",
      contentType: "text/plain",
      endpointName: "core-site.xml",
      endpointData: "<endpoint1>master.elastic.l4lb.thisdcos.directory:9200</endpoint1>"
    });
  });
  describe("#getName", function() {
    it("returns correct endpoint name", function() {
      expect(this.endpointJSON.getName()).toEqual("master-http");
      expect(this.endpointFile.getName()).toEqual("core-site.xml");
    });
  });

  describe("#getVip", function() {
    it("returns correct vip", function() {
      expect(this.endpointJSON.getVip()).toEqual("vip1");
    });
  });

  describe("#getAddress", function() {
    it("returns correct address", function() {
      expect(this.endpointJSON.getAddress()).toEqual("address1,address2");
    });
  });

  describe("#getDns", function() {
    it("returns correct dns", function() {
      expect(this.endpointJSON.getDns()).toEqual("dns1,dns2");
    });
  });

  describe("#isJSON", function() {
    it("returns true for the JSON type", function() {
      expect(this.endpointJSON.isJSON()).toEqual(true);
    });
    it("returns false for the File type", function() {
      expect(this.endpointFile.isJSON()).toEqual(false);
    });
  });
});
