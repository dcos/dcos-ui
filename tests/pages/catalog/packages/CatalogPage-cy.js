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

  context("Filters", function() {
    beforeEach(function() {
      cy.visitUrl({ url: "/catalog/packages", logIn: true });
    });

    it("Shows the filter input", function() {
      cy.get(".filter-input-text").should("exist");
    });

    it("Shows the filter badges", function() {
      cy.get(".button-outline").should("have.length", 3);
      cy.get(".button-outline")
        .eq(0)
        .contains("All")
        .should("exist");
      cy.get(".button-outline")
        .eq(1)
        .contains("Certified")
        .should("exist");
      cy.get(".button-outline")
        .eq(2)
        .contains("Community")
        .should("exist");
      cy.get(".button-outline")
        .eq(0)
        .contains("97")
        .should("exist");
      cy.get(".button-outline")
        .eq(1)
        .contains("9")
        .should("exist");
      cy.get(".button-outline")
        .eq(2)
        .contains("88")
        .should("exist");
    });

    it("Displays only certified packages by default", function() {
      cy.get(".active").should("have.length", 1);
      cy.get(".active")
        .contains("Certified")
        .should("exist");
    });

    it("Displays only certified packages when we filter by certified", function() {
      cy.get("h1")
        .contains("Certified")
        .should("exist");
      cy.get("h1")
        .contains("Community")
        .should("not.exist");
    });

    it("Displays only community packages when we filter by community", function() {
      cy.get(".button-outline")
        .contains("Community")
        .click();
      cy.get("h1")
        .contains("Certified")
        .should("not.exist");
      cy.get("h1")
        .contains("Community")
        .should("exist");
    });

    it("Displays all packages when we filter by all", function() {
      cy.get(".button-outline")
        .contains("All")
        .click();
      cy.get("h1")
        .contains("Certified")
        .should("exist");
      cy.get("h1")
        .contains("Community")
        .should("exist");
    });

    it("Correctly updates the number badges when we filter using the input", function() {
      cy.get(".filter-input-text").type("kafka");
      cy.get(".button-outline")
        .eq(0)
        .contains("8")
        .should("exist");
      cy.get(".button-outline")
        .eq(1)
        .contains("1")
        .should("exist");
      cy.get(".button-outline")
        .eq(2)
        .contains("7")
        .should("exist");
    });

    it("Shows a message if no package are found", function() {
      cy.get(".filter-input-text").type("kafak");
      cy.get(".clearfix")
        .contains('No results were found for your search: "kafak" (view all)')
        .should("exist");
    });

    it("Resets the filter when we click view all", function() {
      cy.get(".filter-input-text").type("kafak");
      cy.get(".clickable")
        .contains("view all")
        .click();
      cy.get(".button-outline")
        .eq(0)
        .contains("97")
        .should("exist");
      cy.get(".button-outline")
        .eq(1)
        .contains("9")
        .should("exist");
      cy.get(".button-outline")
        .eq(2)
        .contains("88")
        .should("exist");
    });
  });
});
