describe("Catalog Page", function() {
  beforeEach(function() {
    cy.configureCluster({
      mesos: "1-task-healthy",
      universePackages: true
    });
  });

  it("goes to Catalog page when tab is clicked", function() {
    cy.visitUrl({ url: "/dashboard", logIn: true });

    // Opens up collapsible menu
    cy.get(".sidebar")
      .contains("Catalog")
      .click();
    cy.hash().should("match", /catalog\/packages/);
  });

  it("goes to Packages tab when tab is clicked", function() {
    cy.visitUrl({ url: "/catalog/packages", logIn: true });
    cy.hash().should("match", /catalog\/packages/);
  });

  it("goes to the Packages Details tab when panel is clicked", function() {
    cy.visitUrl({ url: "/catalog/packages" })
      .get(".h3")
      .contains("arangodb")
      .click();
    cy.hash().should("match", /catalog\/packages\/arangodb/);
  });
});
