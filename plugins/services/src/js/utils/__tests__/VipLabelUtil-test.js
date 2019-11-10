const VipLabelUtil = require("../VipLabelUtil");

const appID = "/some-app";
const vipLabel = "VIP_0";
const vipPort = 7070;

describe("VipLabelUtil", () => {
  describe("#generateVipLabel", () => {
    describe("when port is not load balanced", () => {
      describe("when there is a vip label", () => {
        it("deletes vip label from labels", () => {
          var portDefinition = {
            loadBalanced: false,
            labels: {
              [vipLabel]: "viplabel:9090"
            }
          };
          var result = VipLabelUtil.generateVipLabel(
            appID,
            portDefinition,
            vipLabel,
            vipPort
          );

          expect(result).toEqual({});
        });
      });

      describe("when there is no vip labels", () => {
        it("returns labels unchanged", () => {
          var portDefinition = {
            loadBalanced: false,
            labels: {
              otherLabel: "value"
            }
          };
          var result = VipLabelUtil.generateVipLabel(
            appID,
            portDefinition,
            vipLabel,
            vipPort
          );

          expect(result).toEqual({ otherLabel: "value" });
        });
      });
    });

    describe("when port is load balanced", () => {
      describe("when no vip has been given", () => {
        it("generates VIP", () => {
          var portDefinition = {
            loadBalanced: true,
            vip: undefined
          };
          var result = VipLabelUtil.generateVipLabel(
            appID,
            portDefinition,
            vipLabel,
            vipPort
          );

          expect(result).toEqual({ VIP_0: "/some-app:7070" });
        });
      });

      describe("when vip has been given", () => {
        it("generates VIP with new port value", () => {
          var portDefinition = {
            loadBalanced: true,
            vip: "service-address:9091"
          };
          var result = VipLabelUtil.generateVipLabel(
            appID,
            portDefinition,
            vipLabel,
            vipPort
          );

          expect(result).toEqual({ VIP_0: "service-address:7070" });
        });
      });
    });
  });

  describe("#findVip", () => {
    it("returns the first occurance with VIP prefix", () => {
      expect(
        VipLabelUtil.findVip({
          other: "not_vip",
          VIP1: "vip",
          VIP2: "vip"
        })
      ).toEqual(["VIP1", "vip"]);
    });

    it("returns the first occurance with vip prefix", () => {
      expect(
        VipLabelUtil.findVip({
          other: "not_vip",
          vip1: "vip1",
          vip2: "vip2"
        })
      ).toEqual(["vip1", "vip1"]);
    });

    it("ignores mixed case variants", () => {
      expect(
        VipLabelUtil.findVip({
          Vip: "not_vip",
          vIP: "vip1",
          viP: "vip2"
        })
      ).toEqual(undefined);
    });

    it("does not crash when labels is null", () => {
      expect(VipLabelUtil.findVip(null)).toEqual(undefined);
    });
  });

  describe("#defaultVip", () => {
    it("constructs the value", () => {
      expect(VipLabelUtil.defaultVip(1)).toEqual("VIP_1");
    });
  });
});
