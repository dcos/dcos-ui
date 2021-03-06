describe("Service Versions", () => {
  context("Configuration Tab", () => {
    context("Services", () => {
      beforeEach(() => {
        cy.configureCluster({
          mesos: "1-task-healthy",
          nodeHealth: true,
        });

        cy.visitUrl({ url: "/services/detail/%2Fsleep" });
        cy.get(".page-header-navigation .menu-tabbed-item")
          .contains("Configuration")
          .click();

        cy.get(".services-version-select button").as("dropdown");
      });

      it("opens the current service version on default", () => {
        cy.get("@dropdown").contains("Active");
      });

      it("renders the version dropdown with the current locale version as default", () => {
        cy.get(".page-body-content .dropdown .button span")
          .contains(new Date("2015-08-28T01:26:14.620Z").toLocaleString())
          .should("have.length", 1);
      });

      it("renders the selected service version", () => {
        cy.get("@dropdown")
          .get(".button span")
          .contains(new Date("2015-08-28T01:26:14.620Z").toLocaleString())
          .parent()
          .click();

        cy.get("@dropdown")
          .get(".dropdown-menu-list ul li")
          .contains(new Date("2015-02-28T05:12:12.221Z").toLocaleString())
          .click();

        cy.get("@dropdown").contains(
          new Date("2015-02-28T05:12:12.221Z").toLocaleString()
        );
      });

      it("applies the selected service version", () => {
        cy.route({
          method: "PUT",
          url: /marathon\/v2\/apps\/\/sleep/,
          response: {
            deploymentId: "5ed4c0c5-9ff8-4a6f-a0cd-f57f59a34b43",
            version: "2015-09-29T15:59:51.164Z",
          },
          delay: 0,
        });

        cy.get("@dropdown")
          .get(".button span")
          .contains(new Date("2015-08-28T01:26:14.620Z").toLocaleString())
          .parent()
          .click();

        cy.get("@dropdown")
          .get(".dropdown-menu-list ul li")
          .contains(new Date("2015-02-28T05:12:12.221Z").toLocaleString())
          .click();

        cy.get("@dropdown").contains(
          new Date("2015-02-28T05:12:12.221Z").toLocaleString()
        );

        cy.get(".page-body-content .button").contains("Apply").click();
      });

      it("opens correct edit modal of the selected service version", () => {
        cy.get("@dropdown")
          .get(".button span")
          .contains(new Date("2015-08-28T01:26:14.620Z").toLocaleString())
          .parent()
          .click();

        cy.get("@dropdown")
          .get(".dropdown-menu-list ul li")
          .contains(new Date("2015-02-28T05:12:12.221Z").toLocaleString())
          .click();

        cy.get(".page-body-content .button").contains("Edit").click();

        cy.get('.modal .menu-tabbed-view textarea[name="cmd"]').contains(
          "sleep 1000"
        );
      });
    });

    context("SDK Services", () => {
      beforeEach(() => {
        cy.configureCluster({
          mesos: "1-sdk-service",
          nodeHealth: true,
        });
        cy.visitUrl({
          url: "/services/detail/%2Fservices%2Fsdk-sleep/configuration",
        });
      });

      it("does not show version selection for sdk service", () => {
        cy.get(".services-version-select button").should("not.exist");
      });
    });
  });
});
