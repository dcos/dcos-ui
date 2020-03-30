describe("Pod Detail Page", () => {
  beforeEach(() => {
    cy.configureCluster({
      mesos: "1-pod",
      nodeHealth: true,
    });
  });

  context("Navigate to service detail page", () => {
    it("shows the Service Not Found alert panel in page contents", () => {
      cy.visitUrl({
        url: "/services/detail/non-existing-service",
      });
      cy.get(".page-body-content").contains("Service not found");
    });

    context("Show tabs", () => {
      beforeEach(() => {
        cy.visitUrl({
          url: "/services/detail/%2Fpodses",
        });
      });

      it("shows instances tab per default", () => {
        cy.get(".menu-tabbed-item .active")
          .contains("Tasks")
          .get(".table")
          .contains("podses");

        cy.hash().should("match", /services\/detail\/%2Fpodses\/tasks.*/);
      });

      it("shows configuration tab when clicked", () => {
        cy.get(".menu-tabbed-item").contains("Configuration").click();

        cy.get(".menu-tabbed-item .active")
          .contains("Configuration")
          .get(".configuration-map");

        cy.hash().should(
          "match",
          /services\/detail\/%2Fpodses\/configuration.*/
        );
      });

      it("shows debug tab when clicked", () => {
        cy.get(".menu-tabbed-item").contains("Debug").click();

        cy.get(".menu-tabbed-item .active")
          .contains("Debug")
          .get(".page-body-content")
          .contains("Last Changes");

        cy.hash().should("match", /services\/detail\/%2Fpodses\/debug.*/);
      });

      context("Endpoints tab", () => {
        beforeEach(() => {
          cy.get(".menu-tabbed-item").contains("Endpoints").click();
        });

        it("shows endpoints tab with correct values when clicked", () => {
          cy.get(".menu-tabbed-item .active")
            .contains("Endpoints")
            .get(".configuration-map");

          cy.hash().should("match", /services\/detail\/%2Fpodses\/endpoints.*/);

          cy.get(".configuration-map-heading").contains("ping");

          cy.get(".table-row")
            .eq(0)
            .should("contain", "Protocol")
            .and("contain", "tcp");

          cy.get(".table-row")
            .eq(1)
            .should("contain", "Container Port")
            .and("contain", "80");

          cy.get(".table-row")
            .eq(2)
            .should("contain", "Host Port")
            .and("contain", "Auto Assigned");

          cy.get(".table-row")
            .eq(3)
            .should("contain", "Container")
            .and("contain", "container-1");
        });
      });
    });

    context("Sorting", () => {
      beforeEach(() => {
        cy.visitUrl({
          url: "/services/detail/%2Fpodses",
        });
      });

      it("sorts by host/port ASC", () => {
        cy.get("th.task-table-column-host-address").click();

        cy.get(":nth-child(1) > .task-table-column-host-address").contains(
          "10.0.0.67"
        );
        cy.get(":nth-child(9) > .task-table-column-host-address").contains(
          "10.0.5.136"
        );
      });

      it("sorts by host/port DESC", () => {
        cy.get("th.task-table-column-host-address").click();
        cy.get("th.task-table-column-host-address").click();

        cy.get(":nth-child(1) > .task-table-column-host-address").contains(
          "10.0.5.136"
        );
        cy.get(":nth-child(9) > .task-table-column-host-address").contains(
          "10.0.0.67"
        );
      });

      it("sorts by region ASC", () => {
        cy.get("th.task-table-column-region").click();

        cy.get(":nth-child(1) > .task-table-column-region").contains(
          "ap-southeast-1"
        );
        cy.get(":nth-child(9) > .task-table-column-region").contains(
          "us-west-1"
        );
      });

      it("sorts by region DESC", () => {
        cy.get("th.task-table-column-region").click();
        cy.get("th.task-table-column-region").click();

        cy.get(":nth-child(1) > .task-table-column-region").contains(
          "us-west-1"
        );
        cy.get(":nth-child(9) > .task-table-column-region").contains(
          "ap-southeast-1"
        );
      });

      it("sorts by zone ASC", () => {
        cy.get("th.task-table-column-zone").click();

        cy.get(":nth-child(1) > .task-table-column-zone").contains(
          "ap-southeast-1a"
        );
        cy.get(":nth-child(9) > .task-table-column-zone").contains(
          "us-west-1d"
        );
      });

      it("sorts by zone DESC", () => {
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

  context("Delayed pod", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-pod-delayed",
        nodeHealth: true,
      });
    });

    it("shows debug tab when clicked", () => {
      cy.visitUrl({
        url: "/services/detail/%2Fpodses",
      });

      cy.get(".menu-tabbed-item").contains("Debug").click();

      cy.get(".menu-tabbed-item .active")
        .contains("Debug")
        .get(".page-body-content")
        .contains("Last Changes");
      cy.contains(
        "DC/OS has delayed the launching of this service due to failures."
      );
      cy.get("a").contains("More information").should("have.attr", "href");
      cy.get("a").contains("Retry now").click();
      cy.route({
        method: "DELETE",
        url: /marathon\/v2\/queue\/\/podses\/delay/,
        response: [],
      });
      cy.get(".toasts-container");
      cy.hash().should("match", /services\/detail\/%2Fpodses\/debug.*/);
    });
  });

  context("Actions", () => {
    function openDropdown() {
      cy.get(".button-narrow").click();
    }

    function clickDropdownAction(actionText) {
      cy.get(".dropdown-menu-items").contains(actionText).click();
    }

    context("Reset Delay Action", () => {
      context("Delayed pod", () => {
        beforeEach(() => {
          cy.configureCluster({
            mesos: "1-pod-delayed",
            nodeHealth: true,
          });
          cy.visitUrl({
            url: "/services/detail/%2Fpodses",
          });
          openDropdown("podses");
          clickDropdownAction("Reset Delay");
        });

        it("shows a toast notification", () => {
          cy.route({
            method: "DELETE",
            url: /marathon\/v2\/queue\/\/podses\/delay/,
            response: [],
          });
          cy.get(".toasts-container");
        });
      });

      context("Non-delayed pod", () => {
        beforeEach(() => {
          cy.configureCluster({
            mesos: "1-pod",
            nodeHealth: true,
          });
          cy.visitUrl({
            url: "/services/detail/%2Fpodses",
          });
          openDropdown("podses");
        });

        it("doesn't have a reset delayed action", () => {
          cy.get(".dropdown-menu-items")
            .contains("Reset Delay")
            .should("not.exist");
        });
      });
    });
  });
});
