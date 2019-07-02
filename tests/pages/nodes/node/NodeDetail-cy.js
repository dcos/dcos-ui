require("../../../_support/utils/ServicesUtil");

describe("Nodes Detail Page", function() {
  beforeEach(function() {
    cy.configureCluster({
      mesos: "1-task-healthy",
      nodeHealth: true
    });
  });

  context("Navigate to node detail page", function() {
    it("navigates to node detail page", function() {
      cy.visitUrl({ url: "/nodes", identify: true });
      var nodeName;
      cy.get(
        ".BottomLeftGrid_ScrollWrapper .ReactVirtualized__Grid__innerScrollContainer a"
      )
        .eq(0)
        .should(function($row) {
          nodeName = $row[0].textContent;
        })
        .click({ force: true });

      cy.hash().should("match", /nodes\/[a-zA-Z0-9-]+/);

      cy.get(".page-header").should(function($title) {
        expect($title).to.contain(nodeName);
      });
    });

    it("shows error in node detail page when node is invalid [10a]", function() {
      cy.visitUrl({ url: "/nodes/INVALID_NODE", identify: true });

      cy.hash().should("match", /nodes\/INVALID_NODE/);
      cy.get(".page-body-content h3").should(function($title) {
        expect($title).to.contain("Error finding node");
      });
    });
  });

  context("Node Details", function() {
    it("shows node status", function() {
      cy.visitUrl({
        url: `/nodes/20151002-000353-1695027628-5050-1177-S0/details`,
        identify: true
      });

      cy.get("h1.configuration-map-heading").should(function($h1) {
        // Should have found 2 elements
        expect($h1).to.have.length(2);

        // First should be Status
        expect($h1.eq(0)).to.contain("Status");

        // Second should be Resources
        expect($h1.eq(1)).to.contain("Resources");
      });

      cy.root()
        .configurationSection("Status")
        .configurationMapValue("Status")
        .contains("Draining");
    });
  });
});
