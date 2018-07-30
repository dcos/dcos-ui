describe("Node Health Tab [0fa]", function() {
  beforeEach(function() {
    cy.configureCluster({
      mesos: "1-task-healthy",
      nodeHealth: true
    });
  });

  context("Navigate to tab [0fb]", function() {
    it("navigates to health tab [0fc]", function() {
      cy.visitUrl({ url: "/nodes", identify: true, fakeAnalytics: true });
      cy.get("tr a")
        .eq(0)
        .click({ force: true });
      cy.get(".menu-tabbed-item")
        .contains("Health")
        .click();

      cy.hash().should("match", /nodes\/[a-zA-Z0-9-]+/);
      cy.get(".page-body-content .h4").should(function($title) {
        expect($title).to.contain("Health Checks");
      });
    });
  });

  context("Health Tab [0fd]", function() {
    beforeEach(function() {
      cy.visitUrl({ url: "/nodes", identify: true, fakeAnalytics: true });
      cy.get("tr a")
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

    it("filters by health [0fe]", function() {
      cy.get(".page-body-content td .text-success").then(function(
        $healthyRows
      ) {
        cy.get("@filterHealth").click();

        cy.get(".dropdown-menu")
          .find("li")
          .contains("Healthy")
          .click();
        // Healthy rows should remain
        cy.get(".page-body-content td .text-success").should(function($row) {
          expect($row.length).to.equal($healthyRows.length);
        });
        // Unhealthy rows should not show
        cy.get(".page-body-content td .text-danger").should(function($row) {
          expect($row.length).to.equal(0);
        });
      });
    });

    it("filters by health check name [0ff]", function() {
      cy.get(".page-body-content td a").then(function($allRows) {
        var logrotateRows = $allRows.filter(function(i, el) {
          return el.textContent.toLowerCase().indexOf("logrotate") !== -1;
        });

        cy.get("@filterTextbox").type("logrotate");
        cy.get(".page-body-content td a").should(function($rows) {
          expect($rows.length).to.equal(logrotateRows.length);
        });
      });
    });
  });
});
