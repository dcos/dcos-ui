describe("Node Health Tab [0fa]", () => {
  beforeEach(() => {
    cy.configureCluster({
      mesos: "1-task-healthy",
      nodeHealth: true
    });
  });

  context("Navigate to tab [0fb]", () => {
    it("navigates to health tab [0fc]", () => {
      cy.visitUrl({ url: "/nodes", identify: true });
      cy.get(
        ".BottomLeftGrid_ScrollWrapper .ReactVirtualized__Grid__innerScrollContainer a"
      )
        .eq(0)
        .click({ force: true });
      cy.get(".menu-tabbed-item")
        .contains("Health")
        .click();

      cy.hash().should("match", /nodes\/[a-zA-Z0-9-]+/);
      cy.get(".page-body-content .h4").should($title => {
        expect($title).to.contain("Health Checks");
      });
    });
  });

  context("Health Tab [0fd]", () => {
    beforeEach(() => {
      cy.visitUrl({ url: "/nodes", identify: true });
      cy.get(
        ".BottomLeftGrid_ScrollWrapper .ReactVirtualized__Grid__innerScrollContainer a"
      )
        .eq(0)
        .click({ force: true });
      cy.get(".menu-tabbed-item")
        .contains("Health")
        .click();

      cy.get(".page-body-content .form-control input[type='text']").as(
        "filterTextbox"
      );
      cy.get("button")
        .contains("Health Checks")
        .as("filterHealth");
    });

    it("filters by health [0fe]", () => {
      cy.get(".page-body-content td .text-success").then($healthyRows => {
        cy.get("@filterHealth").click();

        cy.get(".dropdown-menu")
          .find("li")
          .contains("Healthy")
          .click();
        // Healthy rows should remain
        cy.get(".page-body-content td .text-success").should($row => {
          expect($row.length).to.equal($healthyRows.length);
        });
        // Unhealthy rows should not show
        cy.get(".page-body-content td .text-danger").should($row => {
          expect($row.length).to.equal(0);
        });
      });
    });

    it("filters by health check name [0ff]", () => {
      cy.get(".page-body-content td a").then($allRows => {
        var logrotateRows = $allRows.filter((i, el) => {
          return el.textContent.toLowerCase().indexOf("logrotate") !== -1;
        });

        cy.get("@filterTextbox").type("logrotate");
        cy.get(".page-body-content td a").should($rows => {
          expect($rows.length).to.equal(logrotateRows.length);
        });
      });
    });
  });
});
