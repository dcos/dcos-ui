describe("Pod Detail Page", function() {
  beforeEach(function() {
    cy.configureCluster({
      mesos: "1-pod",
      nodeHealth: true
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
        url: "/services/detail/%2Fpodses"
      });

      cy.get(".menu-tabbed-item .active")
        .contains("Tasks")
        .get(".table")
        .contains("podses");

      cy.hash().should("match", /services\/detail\/%2Fpodses\/tasks.*/);
    });

    it("shows configuration tab when clicked", function() {
      cy.visitUrl({
        url: "/services/detail/%2Fpodses"
      });

      cy.get(".menu-tabbed-item")
        .contains("Configuration")
        .click();

      cy.get(".menu-tabbed-item .active")
        .contains("Configuration")
        .get(".configuration-map");

      cy.hash().should("match", /services\/detail\/%2Fpodses\/configuration.*/);
    });

    it("shows debug tab when clicked", function() {
      cy.visitUrl({
        url: "/services/detail/%2Fpodses"
      });

      cy.get(".menu-tabbed-item")
        .contains("Debug")
        .click();

      cy.get(".menu-tabbed-item .active")
        .contains("Debug")
        .get(".page-body-content")
        .contains("Last Changes");

      cy.hash().should("match", /services\/detail\/%2Fpodses\/debug.*/);
    });
  });

  context("Sorting", function() {
    it("sorts by host/port ASC", function() {
      cy.visitUrl({
        url: "/services/detail/%2Fpodses"
      });

      cy.get("th.task-table-column-host-address").click();

      cy.get(":nth-child(2) > .task-table-column-host-address").contains(
        "10.0.0.67"
      );
      cy.get(":nth-child(10) > .task-table-column-host-address").contains(
        "10.0.5.136"
      );
    });

    it("sorts by host/port DESC", function() {
      cy.visitUrl({
        url: "/services/detail/%2Fpodses"
      });

      cy.get("th.task-table-column-host-address").click();
      cy.get("th.task-table-column-host-address").click();

      cy.get(":nth-child(2) > .task-table-column-host-address").contains(
        "10.0.5.136"
      );
      cy.get(":nth-child(10) > .task-table-column-host-address").contains(
        "10.0.0.67"
      );
    });

    it("sorts by region ASC", function() {
      cy.visitUrl({
        url: "/services/detail/%2Fpodses"
      });

      cy.get("th.task-table-column-region").click();

      cy.get(":nth-child(2) > .task-table-column-region").contains(
        "ap-southeast-1"
      );
      cy.get(":nth-child(10) > .task-table-column-region").contains(
        "us-west-1"
      );
    });

    it("sorts by region DESC", function() {
      cy.visitUrl({
        url: "/services/detail/%2Fpodses"
      });

      cy.get("th.task-table-column-region").click();
      cy.get("th.task-table-column-region").click();

      cy.get(":nth-child(2) > .task-table-column-region").contains("us-west-1");
      cy.get(":nth-child(10) > .task-table-column-region").contains(
        "ap-southeast-1"
      );
    });

    it("sorts by zone ASC", function() {
      cy.visitUrl({
        url: "/services/detail/%2Fpodses"
      });

      cy.get("th.task-table-column-zone").click();

      cy.get(":nth-child(2) > .task-table-column-zone").contains(
        "ap-southeast-1a"
      );
      cy.get(":nth-child(10) > .task-table-column-zone").contains("us-west-1d");
    });

    it("sorts by zone DESC", function() {
      cy.visitUrl({
        url: "/services/detail/%2Fpodses"
      });

      cy.get("th.task-table-column-zone").click();
      cy.get("th.task-table-column-zone").click();

      cy.get(":nth-child(2) > .task-table-column-zone").contains("us-west-1d");
      cy.get(":nth-child(10) > .task-table-column-zone").contains(
        "ap-southeast-1a"
      );
    });
  });
});
