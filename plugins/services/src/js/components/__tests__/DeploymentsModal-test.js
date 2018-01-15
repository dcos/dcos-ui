/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */

const Deployment = require("../../structs/Deployment");
const DeploymentsModal = require("../DeploymentsModal");
const Application = require("../../structs/Application");

describe("DeploymentsModal", function() {
  describe("#getRollbackModalText", function() {
    it("returns a removal message when passed a starting deployment", function() {
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

    it("returns a revert message when passed a non-starting deployment", function() {
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
