describe("Universe Page", function() {
  beforeEach(function() {
    cy.configureCluster({
      mesos: "1-task-healthy",
      universePackages: true
    });
  });

  it("goes to Universe page when tab is clicked", function() {
    cy.visitUrl({ url: "/dashboard", logIn: true });

    // Opens up collapsible menu
    cy.get(".sidebar").contains("Universe").click();
    cy.get(".sidebar a[href]").contains("Packages").click();
    cy.hash().should("match", /universe\/packages/);
  });

  it("goes to Packages tab when tab is clicked", function() {
    cy.visitUrl({ url: "/universe/packages", logIn: true });
    cy.hash().should("match", /universe\/packages/);
  });

  it("goes to the Packages Details tab when panel is clicked", function() {
    cy
      .visitUrl({ url: "/universe/packages" })
      .get(".h2")
      .contains("arangodb")
      .click();
    cy.hash().should("match", /universe\/packages\/arangodb/);
  });
});
