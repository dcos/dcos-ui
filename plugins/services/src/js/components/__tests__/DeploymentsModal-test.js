import Item from "#SRC/js/structs/Item";
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */

const DeploymentsModal = require("../DeploymentsModal").WrappedComponent;
const Application = require("../../structs/Application");

describe("DeploymentsModal", function() {
  describe("#renderStatus", function() {
    it("Returns N/A for empty Application", function() {
      const app = new Application({
        deployment: {}
      });

      expect(DeploymentsModal.prototype.renderStatus(null, app, {})).toEqual(
        "N/A"
      );
    });

    it("Returns null for Item without getStatus function", function() {
      const item = new Item({
        deployment: {}
      });

      expect(DeploymentsModal.prototype.renderStatus(null, item, {})).toEqual(
        null
      );
    });
  });
});
