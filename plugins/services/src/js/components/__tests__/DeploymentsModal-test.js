import Item from "#SRC/js/structs/Item";
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */

const Deployment = require("../../structs/Deployment");
const DeploymentsModal = require("../DeploymentsModal");
const Application = require("../../structs/Application");

describe("DeploymentsModal", function() {
  describe("#getRollbackModalText", function() {
    it("returns a removal message when passed a starting deployment", function() {
      let text = DeploymentsModal.WrappedComponent.prototype.getRollbackModalText(
        new Deployment({
          id: "deployment-id",
          affectedApps: ["app1"],
          affectedServices: [new Application({ name: "app1" })],
          steps: [{ actions: [{ type: "StartApplication" }] }]
        })
      ).props.id;
      text = text.replace(/\s{1,}/g, " ");
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
      ).props.id;
      expect(text).toContain("revert the affected service");
    });
  });

  describe("#renderStatus", function() {
    it("Returns N/A for empty Application", function() {
      const app = new Application({
        deployment: {}
      });

      expect(
        DeploymentsModal.WrappedComponent.prototype.renderStatus(null, app, {})
      ).toEqual("N/A");
    });

    it("Returns null for Item without getStatus function", function() {
      const item = new Item({
        deployment: {}
      });

      expect(
        DeploymentsModal.WrappedComponent.prototype.renderStatus(null, item, {})
      ).toEqual(null);
    });
  });
});
