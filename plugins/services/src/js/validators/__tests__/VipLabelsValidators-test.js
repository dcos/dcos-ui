import VipLabelsValidators from "../VipLabelsValidators";

describe("VipLabelsValidators", () => {
  describe("#mustContainPort", () => {
    describe("with a Single container app", () => {
      it("returns no errors if portDefinitions is empty", () => {
        const spec = { portDefinitions: [] };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([]);
      });

      it("returns no errors if portMappings is empty", () => {
        const spec = { container: { portMappings: [] } };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([]);
      });

      it("returns no errors if Label for VIP is correct", () => {
        const spec = {
          portDefinitions: [{ labels: { VIP_0: "endpoint-name:1000" } }]
        };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([]);
      });

      it("returns no errors if Label for VIP is correct", () => {
        const spec = {
          container: {
            portMappings: [{ labels: { VIP_0: "0.0.0.0:1000" } }]
          }
        };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([]);
      });

      it("returns an error if Label for VIP contains no port", () => {
        const spec = {
          portDefinitions: [{ labels: { VIP_0: "endpoint-name" } }]
        };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([
          {
            message:
              "Label for VIP must be in the following format: <ip-addres|name>:<port>",
            path: ["portDefinitions", 0, "labels", "VIP_0"]
          }
        ]);
      });

      it("returns an error if Label for VIP contains non-integer port", () => {
        const spec = {
          container: {
            portMappings: [{ labels: { VIP_0: "0.0.0.0:port" } }]
          }
        };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([
          {
            message:
              "Label for VIP must be in the following format: <ip-addres|name>:<port>",
            path: ["container", "portMappings", 0, "labels", "VIP_0"]
          }
        ]);
      });

      it("returns an error if Label for VIP contains an integer port that exceeds the max", () => {
        const spec = {
          container: {
            portMappings: [{ labels: { VIP_0: "0.0.0.0:10000000" } }]
          }
        };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([
          {
            message: "Port should be an integer less than or equal to 65535",
            path: ["container", "portMappings", 0, "labels", "VIP_0"]
          }
        ]);
      });

      it("validates multiple ports", () => {
        const spec = {
          container: {
            portMappings: [
              { labels: { VIP_0: "0.0.0.0:port" } },
              { labels: { VIP_1: "0.0.0.0:65000" } },
              { labels: { VIP_2: "0.0.0.0:9090" } },
              { labels: { VIP_3: ":9090" } }
            ]
          }
        };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([
          {
            message:
              "Label for VIP must be in the following format: <ip-addres|name>:<port>",
            path: ["container", "portMappings", 0, "labels", "VIP_0"]
          },
          {
            message:
              "Label for VIP must be in the following format: <ip-addres|name>:<port>",
            path: ["container", "portMappings", 3, "labels", "VIP_3"]
          }
        ]);
      });
    });

    describe("with a Multi container app", () => {
      it("returns no errors if endpoints is empty", () => {
        const spec = { containers: [{ endpoints: [] }] };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([]);
      });

      it("returns no errors if Label for VIP is correct", () => {
        const spec = {
          containers: [
            {
              endpoints: [{ labels: { VIP_0: "0.0.0.0:9090" } }]
            }
          ]
        };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([]);
      });

      it("returns an error if Label for VIP contains no address", () => {
        const spec = {
          containers: [
            {
              endpoints: [{ labels: { VIP_0: ":9090" } }]
            }
          ]
        };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([
          {
            message:
              "Label for VIP must be in the following format: <ip-addres|name>:<port>",
            path: ["containers", 0, "endpoints", 0, "labels", "VIP_0"]
          }
        ]);
      });
    });
  });
});
