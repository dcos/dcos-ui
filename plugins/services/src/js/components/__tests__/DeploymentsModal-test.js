jest.unmock("moment");
jest.unmock("#SRC/js/components/CollapsingString");
jest.unmock("#SRC/js/components/FluidGeminiScrollbar");
jest.unmock("#SRC/js/components/Page");
jest.unmock("#SRC/js/components/TimeAgo");
jest.unmock("#SRC/js/mixins/InternalStorageMixin");
jest.unmock("../DeploymentsModal");
jest.unmock("../../structs/Deployment");

/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */

const Deployment = require("../../structs/Deployment");
const DeploymentsModal = require("../DeploymentsModal");
const Application = require("../../structs/Application");

describe("DeploymentsModal", function() {
  describe("#getRollbackModalText", function() {
    it("should return a removal message when passed a starting deployment", function() {
      const text = DeploymentsModal.WrappedComponent.prototype
        .getRollbackModalText(
          new Deployment({
            id: "deployment-id",
            affectedApps: ["app1"],
            affectedServices: [new Application({ name: "app1" })],
            steps: [{ actions: [{ type: "StartApplication" }] }]
          })
        )
        .replace(/\s{1,}/g, " ");
      expect(text).toContain("delete the affected service");
    });

    it("should return a revert message when passed a non-starting deployment", function() {
      const text = DeploymentsModal.WrappedComponent.prototype.getRollbackModalText(
        new Deployment({
          id: "deployment-id",
          affectedApps: ["app1"],
          affectedServices: [new Application({ name: "app1" })],
          steps: [{ actions: [{ type: "ScaleApplication" }] }]
        })
      );
      expect(text).toContain("revert the affected service");
    });
  });
});
