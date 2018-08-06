describe("Service Detail Page", function() {
  context("Services", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-task-healthy",
        nodeHealth: true
      });
    });

    context("Navigate to service page", function() {
      it("should show the Page Not Found alert panel", function() {
        cy.visitUrl({
          url: "/services/non-existing-service"
        });
        cy.get(".page-body-content").contains("Page not found");
      });
    });

    context("Navigate to service detail page", function() {
      it("shows the Service Not Found alert panel in page contents", function() {
        cy.visitUrl({
          url: "/services/detail/non-existing-service"
        });
        cy.get(".page-body-content").contains("Service not found");
      });

      it("shows instances tab per default", function() {
        cy.visitUrl({
          url: "/services/detail/%2Fsleep"
        });

        cy
          .get(".menu-tabbed-item .active")
          .contains("Tasks")
          .get(".table")
          .contains("sleep");

        cy.hash().should("match", /services\/detail\/%2Fsleep\/tasks.*/);
      });

      it("shows configuration tab when clicked", function() {
        cy.visitUrl({
          url: "/services/detail/%2Fsleep"
        });

        cy.get(".menu-tabbed-item").contains("Configuration").click();

        cy
          .get(".menu-tabbed-item .active")
          .contains("Configuration")
          .get(".configuration-map");

        cy
          .hash()
          .should("match", /services\/detail\/%2Fsleep\/configuration.*/);
      });

      it("shows debug tab when clicked", function() {
        cy.visitUrl({
          url: "/services/detail/%2Fsleep"
        });

        cy.get(".menu-tabbed-item").contains("Debug").click();

        cy
          .get(".menu-tabbed-item .active")
          .contains("Debug")
          .get(".page-body-content")
          .contains("Last Changes");

        cy.hash().should("match", /services\/detail\/%2Fsleep\/debug.*/);
      });

      it("shows volumes tab when clicked", function() {
        cy.visitUrl({
          url: "/services/detail/%2Fsleep"
        });

        cy.get(".menu-tabbed-item").contains("Volumes").click();

        cy.get(".menu-tabbed-item .active").contains("Volumes");

        cy
          .get(".table")
          .contains("tr", "volume-1")
          .parents(".table")
          .contains("tr", "volume-2");

        cy.hash().should("match", /services\/detail\/%2Fsleep\/volumes.*/);
      });
    });

    context("Filter Tasks", function() {
      const DEFAULT_ROWS = 3; // Headline plus invisible rows
      beforeEach(function() {
        cy.visitUrl({
          url: "/services/detail/%2Fsleep/tasks"
        });
      });

      it("starts with no filters", function() {
        cy.get(".table tr").should("to.have.length", DEFAULT_ROWS + 3);
      });

      it("can filter tasks by status", function() {
        cy
          .get('use[*|href$="#icon-system--caret-down"]')
          .click({ force: true });

        // Disable active
        cy.contains("Active").click({ force: true });

        // Enable completed
        cy.contains("Completed").click({ force: true });

        // Wait a moment to check it doesn't flip back
        cy.wait(500);

        // Apply filter
        cy.contains("Apply").click({ force: true });

        cy.get(".table tr.inactive").should("to.have.length", 22);
      });

      it("can filter tasks by name", function() {
        cy
          .get('use[*|href$="#icon-system--caret-down"]')
          .click({ force: true });

        // Disable active
        cy.contains("Active").click({ force: true });

        cy
          .get(".dsl-form-group input[name='text']")
          .type("sleep.7084272b-6b76-11e5-a953-08002719334c");

        // Wait a moment to check it doesn't flip back
        cy.wait(500);

        // Apply filter
        cy.contains("Apply").click({ force: true });

        cy.get(".table tr").should("to.have.length", DEFAULT_ROWS + 1);
      });

      it("can filter tasks by zone", function() {
        cy
          .get('use[*|href$="#icon-system--caret-down"]')
          .click({ force: true });

        // Enable zone
        cy.contains("ap-northeast-1a").click({ force: true });

        // Wait a moment to check it doesn't flip back
        cy.wait(500);

        // Apply filter
        cy.contains("Apply").click({ force: true });

        cy.get(".table tr").should("to.have.length", DEFAULT_ROWS + 1);
      });

      it("can filter by typing a filter", function() {
        cy
          .get(".filter-input-text")
          .focus()
          .clear()
          .type("region:ap-northeast-1");
        cy.get(".table tr").should("to.have.length", DEFAULT_ROWS + 1);
      });
    });
  });

  context("SDK Services", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-for-each-health",
        nodeHealth: true,
        universePackages: true
      });

      cy.visitUrl({
        url: "/services/detail/%2Fcassandra-healthy/configuration"
      });
    });

    it("edit config button opens the edit flow", function() {
      cy.get(".container").contains("Edit Config").click();

      cy
        .location()
        .its("hash")
        .should("include", "#/services/detail/%2Fcassandra-healthy/edit");
    });

    it("download button exists", function() {
      cy.get(".container").contains("Download Config");
    });
  });
});
