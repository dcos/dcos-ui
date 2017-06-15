describe("Nodes Detail Page", function() {
  beforeEach(function() {
    cy.configureCluster({
      mesos: "1-task-healthy",
      nodeHealth: true
    });
  });

  context("Navigate to node detail page", function() {
    it("navigates to node detail page", function() {
      cy.visitUrl({ url: "/nodes", identify: true, fakeAnalytics: true });
      var nodeName;
      cy
        .get("tr a")
        .eq(0)
        .should(function($row) {
          nodeName = $row[0].textContent;
        })
        .click();

      cy.hash().should("match", /nodes\/[a-zA-Z0-9-]+/);
      cy.get(".page-header").should(function($title) {
        expect($title).to.contain(nodeName);
      });
    });

    it("shows error in node detail page when node is invalid [10a]", function() {
      cy.visitUrl({
        url: "/nodes/INVALID_NODE",
        identify: true,
        fakeAnalytics: true
      });

      cy.hash().should("match", /nodes\/INVALID_NODE/);
      cy.get(".page-body-content h3").should(function($title) {
        expect($title).to.contain("Error finding node");
      });
    });
  });
});
