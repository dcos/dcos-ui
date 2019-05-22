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

    context("Show tabs", function() {
      beforeEach(function() {
        cy.visitUrl({
          url: "/services/detail/%2Fpodses"
        });
      });

      it("shows instances tab per default", function() {
        cy.get(".menu-tabbed-item .active")
          .contains("Tasks")
          .get(".table")
          .contains("podses");

        cy.hash().should("match", /services\/detail\/%2Fpodses\/tasks.*/);
      });

      it("shows configuration tab when clicked", function() {
        cy.get(".menu-tabbed-item")
          .contains("Configuration")
          .click();

        cy.get(".menu-tabbed-item .active")
          .contains("Configuration")
          .get(".configuration-map");

        cy.hash().should(
          "match",
          /services\/detail\/%2Fpodses\/configuration.*/
        );
      });

      it("shows debug tab when clicked", function() {
        cy.get(".menu-tabbed-item")
          .contains("Debug")
          .click();

        cy.get(".menu-tabbed-item .active")
          .contains("Debug")
          .get(".page-body-content")
          .contains("Last Changes");

        cy.hash().should("match", /services\/detail\/%2Fpodses\/debug.*/);
      });

      context("Endpoints tab", function() {
        beforeEach(function() {
          cy.get(".menu-tabbed-item")
            .contains("Endpoints")
            .click();
        });

        it("shows endpoints tab when clicked", function() {
          cy.get(".menu-tabbed-item .active")
            .contains("Endpoints")
            .get(".configuration-map");

          cy.hash().should("match", /services\/detail\/%2Fpodses\/endpoints.*/);
        });

        it("shows endpoint name correctly", function() {
          cy.get(".configuration-map-heading")
            .contains("ping")
            .should("exist");
        });

        it("shows procotol correctly", function() {
          cy.get(".configuration-map-label")
            .contains("Protocol")
            .should("exist");
          cy.get(".configuration-map-value")
            .contains("tcp")
            .should("exist");
        });

        it("shows container port correctly", function() {
          cy.get(".configuration-map-label")
            .contains("Container Port")
            .should("exist");
          cy.get(".configuration-map-value")
            .contains("80")
            .should("exist");
        });

        it("shows host port correctly", function() {
          cy.get(".configuration-map-label")
            .contains("Host Port")
            .should("exist");
          cy.get(".configuration-map-value")
            .contains("Auto Assigned")
            .should("exist");
        });

        it("shows container correctly", function() {
          cy.get(".configuration-map-label")
            .contains("Container")
            .should("exist");
          cy.get(".configuration-map-value")
            .contains("container-1")
            .should("exist");
        });
      });
    });

    context("Sorting", function() {
      beforeEach(function() {
        cy.visitUrl({
          url: "/services/detail/%2Fpodses"
        });
      });

      it("sorts by host/port ASC", function() {
        cy.get("th.task-table-column-host-address").click();

        cy.get(":nth-child(1) > .task-table-column-host-address").contains(
          "10.0.0.67"
        );
        cy.get(":nth-child(9) > .task-table-column-host-address").contains(
          "10.0.5.136"
        );
      });

      it("sorts by host/port DESC", function() {
        cy.get("th.task-table-column-host-address").click();
        cy.get("th.task-table-column-host-address").click();

        cy.get(":nth-child(1) > .task-table-column-host-address").contains(
          "10.0.5.136"
        );
        cy.get(":nth-child(9) > .task-table-column-host-address").contains(
          "10.0.0.67"
        );
      });

      it("sorts by region ASC", function() {
        cy.get("th.task-table-column-region").click();

        cy.get(":nth-child(1) > .task-table-column-region").contains(
          "ap-southeast-1"
        );
        cy.get(":nth-child(9) > .task-table-column-region").contains(
          "us-west-1"
        );
      });

      it("sorts by region DESC", function() {
        cy.get("th.task-table-column-region").click();
        cy.get("th.task-table-column-region").click();

        cy.get(":nth-child(1) > .task-table-column-region").contains(
          "us-west-1"
        );
        cy.get(":nth-child(9) > .task-table-column-region").contains(
          "ap-southeast-1"
        );
      });

      it("sorts by zone ASC", function() {
        cy.get("th.task-table-column-zone").click();

        cy.get(":nth-child(1) > .task-table-column-zone").contains(
          "ap-southeast-1a"
        );
        cy.get(":nth-child(9) > .task-table-column-zone").contains(
          "us-west-1d"
        );
      });

      it("sorts by zone DESC", function() {
        cy.get("th.task-table-column-zone").click();
        cy.get("th.task-table-column-zone").click();

        cy.get(":nth-child(1) > .task-table-column-zone").contains(
          "us-west-1d"
        );
        cy.get(":nth-child(9) > .task-table-column-zone").contains(
          "ap-southeast-1a"
        );
      });
    });
  });
});
