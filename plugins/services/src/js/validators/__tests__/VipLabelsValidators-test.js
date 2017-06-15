jest.unmock("../VipLabelsValidators");
const VipLabelsValidators = require("../VipLabelsValidators");

describe("VipLabelsValidators", function() {
  describe("#mustContainPort", function() {
    describe("with a Single container app", function() {
      it("returns no errors if portDefinitions is empty", function() {
        const spec = { portDefinitions: [] };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([]);
      });

      it("returns no errors if portMappings is empty", function() {
        const spec = { container: { docker: { portMappings: [] } } };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([]);
      });

      it("returns no errors if VIP label is correct", function() {
        const spec = {
          portDefinitions: [{ labels: { VIP_0: "endpoint-name:1000" } }]
        };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([]);
      });

      it("returns no errors if VIP label is correct", function() {
        const spec = {
          container: {
            docker: {
              portMappings: [{ labels: { VIP_0: "0.0.0.0:1000" } }]
            }
          }
        };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([]);
      });

      it("returns an error if VIP label contains no port", function() {
        const spec = {
          portDefinitions: [{ labels: { VIP_0: "endpoint-name" } }]
        };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([
          {
            message: "VIP label must be in the following format: <ip-addres|name>:<port>",
            path: ["portDefinitions", 0, "labels", "VIP_0"]
          }
        ]);
      });

      it("returns an error if VIP label contains non-integer port", function() {
        const spec = {
          container: {
            docker: {
              portMappings: [{ labels: { VIP_0: "0.0.0.0:port" } }]
            }
          }
        };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([
          {
            message: "VIP label must be in the following format: <ip-addres|name>:<port>",
            path: ["container", "docker", "portMappings", 0, "labels", "VIP_0"]
          }
        ]);
      });

      it("returns an error if VIP label contains an integer port that exceeds the max", function() {
        const spec = {
          container: {
            docker: {
              portMappings: [{ labels: { VIP_0: "0.0.0.0:10000000" } }]
            }
          }
        };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([
          {
            message: "Port should be an integrer less than or equal to 65535",
            path: ["container", "docker", "portMappings", 0, "labels", "VIP_0"]
          }
        ]);
      });

      it("validates multiple ports", function() {
        const spec = {
          container: {
            docker: {
              portMappings: [
                { labels: { VIP_0: "0.0.0.0:port" } },
                { labels: { VIP_1: "0.0.0.0:65000" } },
                { labels: { VIP_2: "0.0.0.0:9090" } },
                { labels: { VIP_3: ":9090" } }
              ]
            }
          }
        };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([
          {
            message: "VIP label must be in the following format: <ip-addres|name>:<port>",
            path: ["container", "docker", "portMappings", 0, "labels", "VIP_0"]
          },
          {
            message: "VIP label must be in the following format: <ip-addres|name>:<port>",
            path: ["container", "docker", "portMappings", 3, "labels", "VIP_3"]
          }
        ]);
      });
    });

    describe("with a Multi container app", function() {
      it("returns no errors if endpoints is empty", function() {
        const spec = { containers: [{ endpoints: [] }] };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([]);
      });

      it("returns no errors if VIP label is correct", function() {
        const spec = {
          containers: [
            {
              endpoints: [{ labels: { VIP_0: "0.0.0.0:9090" } }]
            }
          ]
        };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([]);
      });

      it("returns an error if VIP label contains no address", function() {
        const spec = {
          containers: [
            {
              endpoints: [{ labels: { VIP_0: ":9090" } }]
            }
          ]
        };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([
          {
            message: "VIP label must be in the following format: <ip-addres|name>:<port>",
            path: ["containers", 0, "endpoints", 0, "labels", "VIP_0"]
          }
        ]);
      });
    });
  });
});
