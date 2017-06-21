jest.dontMock("../VipLabelUtil");

const VipLabelUtil = require("../VipLabelUtil");

const appID = "/some-app";
const vipLabel = "VIP_0";
const vipPort = 7070;

describe("VipLabelUtil", function() {
  describe("#generateVipLabel", function() {
    describe("when port is not load balanced", function() {
      describe("when there is a vip label", function() {
        it("deletes vip label from labels", function() {
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

      describe("when there is no vip labels", function() {
        it("returns labels unchanged", function() {
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

    describe("when port is load balanced", function() {
      describe("when no vip has been given", function() {
        it("generates VIP", function() {
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

      describe("when vip has been given", function() {
        it("generates VIP", function() {
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

          expect(result).toEqual({ VIP_0: "service-address:9091" });
        });
      });
    });
  });
});
