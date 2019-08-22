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
          cy.get(".configuration-map-heading").contains("ping");
        });

        it("shows procotol correctly", function() {
          cy.get(".configuration-map-label").contains("Protocol");

          cy.get(".configuration-map-value").contains("tcp");
        });

        it("shows container port correctly", function() {
          cy.get(".configuration-map-label").contains("Container Port");

          cy.get(".configuration-map-value").contains("80");
        });

        it("shows host port correctly", function() {
          cy.get(".configuration-map-label").contains("Host Port");

          cy.get(".configuration-map-value").contains("Auto Assigned");
        });

        it("shows container correctly", function() {
          cy.get(".configuration-map-label").contains("Container");

          cy.get(".configuration-map-value").contains("container-1");
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

  context("Delayed pod", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-pod-delayed",
        nodeHealth: true
      });
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
      cy.contains(
        "DC/OS has delayed the launching of this service due to failures."
      );
      cy.get("a")
        .contains("More information")
        .should("have.attr", "href");
      cy.get("a")
        .contains("Retry now")
        .click();
      cy.route({
        method: "DELETE",
        url: /marathon\/v2\/queue\/\/podses\/delay/,
        response: []
      });
      cy.get(".toasts-container");
      cy.hash().should("match", /services\/detail\/%2Fpodses\/debug.*/);
    });
  });

  context("Actions", function() {
    function openDropdown() {
      cy.get(".button-narrow").click();
    }

    function clickDropdownAction(actionText) {
      cy.get(".dropdown-menu-items")
        .contains(actionText)
        .click();
    }

    context("Reset Delay Action", function() {
      context("Delayed pod", function() {
        beforeEach(function() {
          cy.configureCluster({
            mesos: "1-pod-delayed",
            nodeHealth: true
          });
          cy.visitUrl({
            url: "/services/detail/%2Fpodses"
          });
          openDropdown("podses");
          clickDropdownAction("Reset Delay");
        });

        it("shows a toast notification", function() {
          cy.route({
            method: "DELETE",
            url: /marathon\/v2\/queue\/\/podses\/delay/,
            response: []
          });
          cy.get(".toasts-container");
        });
      });

      context("Non-delayed pod", function() {
        beforeEach(function() {
          cy.configureCluster({
            mesos: "1-pod",
            nodeHealth: true
          });
          cy.visitUrl({
            url: "/services/detail/%2Fpodses"
          });
          openDropdown("podses");
        });

        it("doesn't have a reset delayed action", function() {
          cy.get(".dropdown-menu-items")
            .contains("Reset Delay")
            .should("not.exist");
        });
      });
    });
  });
});
