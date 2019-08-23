describe("Service Detail Page", function() {
  context("Services", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-task-healthy-with-offers",
        nodeHealth: true
      });
    });

    it("shows debug tab when clicked", function() {
      cy.visitUrl({
        url: "/services/detail/%2Fsleep"
      });

      cy.get(".menu-tabbed-item")
        .contains("Debug")
        .click();

      cy.get(".page-body-content")
        .parent()
        .scrollTo("bottom");
      cy.get("h2").contains("Summary"); // contains a summary section
      cy.get("h2")
        .contains("Summary")
        .next()
        .should("have.class", "funnel-graph"); // contains a graph
      cy.get("h2").contains("Details"); // contains a details section
      cy.get(".table").contains("Host"); // contains details table
      cy.get(".table")
        .contains("Host")
        .contains("a")
        .should("not.exist"); // node is undefined, so we have no link

      cy.hash().should("match", /services\/detail\/%2Fsleep\/debug.*/);
    });
  });
});
