describe("Installed Packages Tab", function() {
  beforeEach(function() {
    cy
      .configureCluster({
        mesos: "1-task-healthy",
        universePackages: true
      })
      .visitUrl({ url: "/settings/repositories" });
  });

  it("displays a table of repositories", function() {
    cy.get("table.table > tbody > tr td:first-child").as("itemNames");

    cy
      .get("@itemNames")
      .eq(1)
      .should("contain", "Universe")
      .get("@itemNames")
      .eq(2)
      .should("contain", "Mat The Great!")
      .get("@itemNames")
      .eq(3)
      .should("contain", "Go Team");
  });

  it("allows users to filter repositories", function() {
    cy.get('.page-body-content input[type="text"]').as("filterTextbox");
    cy.get("table.table > tbody > tr td:first-child").as("itemNames");

    cy.get("@filterTextbox").type("universe");
    cy.get("@itemNames").should(function($itemNames) {
      expect($itemNames.length).to.equal(3);
      expect($itemNames.eq(1)).to.contain("Universe");
    });
  });

  it("displays 'No data' when it has filtered out all packages", function() {
    cy.get('.page-body-content input[type="text"]').as("filterTextbox");
    cy.get("table.table > tbody > tr").as("tableRows");
    cy.get("@tableRows").get("td").as("tableRowCell");

    cy.get("@filterTextbox").type("foo_bar_baz_qux");

    cy.get("@tableRowCell").should(function($tableCell) {
      expect($tableCell[0].textContent).to.equal("No data");
    });
  });

  it("displays uninstall modal when uninstall is clicked", function() {
    cy
      .get(".button.button-link.button-danger")
      .eq(0)
      .invoke("show")
      .click({ force: true });
    cy
      .get(".modal .modal-footer .button.button-danger")
      .should("contain", "Remove Repository");
  });
});
