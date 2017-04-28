import { SERVER_RESPONSE_DELAY } from "../../_support/constants/Timeouts";

describe("Service Table", function() {
  function openDropdown(serviceName) {
    cy
      .get(".service-table")
      .contains(serviceName)
      .closest("tr")
      .find(".dropdown")
      .click();
  }

  function clickDropdownAction(actionText) {
    cy.get(".dropdown-menu-items").contains(actionText).click();
  }

  context("Open Service Action", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-for-each-health",
        nodeHealth: true
      });

      cy.visitUrl({ url: "/services/overview" });
    });

    it('displays the "Open Service" option for services that have a web UI', function() {
      openDropdown("cassandra-healthy");

      cy
        .get(".dropdown-menu-items")
        .contains("Open Service")
        .should(function($menuItem) {
          expect($menuItem.length).to.equal(1);
        });
    });

    it('does not display the "Open Service" option for services that have a web UI', function() {
      openDropdown("cassandra-unhealthy");

      cy
        .get(".dropdown-menu-items")
        .contains("Open Service")
        .should(function($menuItem) {
          expect($menuItem.hasClass("hidden")).to.equal(true);
        });
    });
  });

  context("Destroy Action", function() {
    context("Application", function() {
      beforeEach(function() {
        cy.configureCluster({
          mesos: "1-task-healthy",
          nodeHealth: true
        });
        cy.visitUrl({ url: "/services/overview" });

        openDropdown("sleep");
        clickDropdownAction("Delete");
      });

      it("opens the correct service destroy dialog", function() {
        cy
          .get(".confirm-modal p span")
          .contains("/sleep")
          .should("to.have.length", 1);
      });

      it("disables button during API request", function() {
        cy.route({
          method: "DELETE",
          url: /marathon\/v2\/apps\/\/sleep/,
          response: []
        });
        cy
          .get(".confirm-modal .button-collection .button-danger")
          .click()
          .should("have.class", "disabled");
      });

      it("closes dialog on successful API request", function() {
        cy.route({
          method: "DELETE",
          url: /marathon\/v2\/apps\/\/sleep/,
          response: []
        });
        cy.get(".confirm-modal .button-collection .button-danger").click();
        cy.get(".confirm-modal").should("to.have.length", 0);
      });

      it("shows error message on conflict", function() {
        cy.route({
          method: "DELETE",
          status: 409,
          url: /marathon\/v2\/apps\/\/sleep/,
          response: { message: "App is locked by one or more deployments." }
        });
        cy.get(".confirm-modal .button-collection .button-danger").click();
        cy
          .get(".modal-body .text-danger")
          .should("to.have.text", "App is locked by one or more deployments.");
      });

      it("shows error message on not authorized", function() {
        cy.route({
          method: "DELETE",
          status: 403,
          url: /marathon\/v2\/apps\/\/sleep/,
          response: { message: "Not Authorized to perform this action!" }
        });
        cy.get(".confirm-modal .button-collection .button-danger").click();
        cy
          .get(".modal-body .text-danger")
          .should("to.have.text", "Not Authorized to perform this action!");
      });

      it("reenables button after faulty request", function() {
        cy.route({
          method: "DELETE",
          status: 403,
          url: /marathon\/v2\/apps\/\/sleep/,
          response: {
            message: { message: "Not Authorized to perform this action!" }
          },
          delay: SERVER_RESPONSE_DELAY
        });
        cy
          .get(".confirm-modal .button-collection .button-danger")
          .as("dangerButton")
          .click();
        cy.get("@dangerButton").should("have.class", "disabled");
        cy.get("@dangerButton").should("not.have.class", "disabled");
      });

      it("closes dialog on secondary button click", function() {
        cy
          .get(".confirm-modal .button-collection .button")
          .contains("Cancel")
          .click();
        cy.get(".confirm-modal").should("to.have.length", 0);
      });
    });
  });

  context("Scale Action", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-for-each-health",
        nodeHealth: true
      });

      cy.visitUrl({ url: "/services/overview" });

      openDropdown("cassandra-healthy");
      clickDropdownAction("Scale");
    });

    it("opens the correct service scale dialog", function() {
      cy
        .get(".modal-header")
        .contains("Scale Service")
        .should("to.have.length", 1);
    });

    it("disables button during API request", function() {
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: []
      });
      cy
        .get(".modal-footer .button-collection .button-primary")
        .click()
        .should("have.class", "disabled");
    });

    it("closes dialog on successful API request", function() {
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: []
      });
      cy.get(".modal-footer .button-collection .button-primary").click();
      cy.get(".modal-body").should("to.have.length", 0);
    });

    it("shows error message on conflict", function() {
      cy.route({
        method: "PUT",
        status: 409,
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: {
          message: "App is locked by one or more deployments."
        }
      });
      cy.get(".modal-footer .button-collection .button-primary").click();
      cy
        .get(".modal-body .text-danger")
        .should("to.have.text", "App is locked by one or more deployments.");
    });

    it("shows error message on not authorized", function() {
      cy.route({
        method: "PUT",
        status: 403,
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: {
          message: "Not Authorized to perform this action!"
        }
      });
      cy.get(".modal-footer .button-collection .button-primary").click();
      cy
        .get(".modal-body .text-danger")
        .should("to.have.text", "Not Authorized to perform this action!");
    });

    it("reenables button after faulty request", function() {
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: [],
        delay: SERVER_RESPONSE_DELAY
      });
      cy
        .get(".modal-footer .button-collection .button-primary")
        .as("primaryButton")
        .click();
      cy.get("@primaryButton").should("have.class", "disabled");
      cy.get("@primaryButton").should("not.have.class", "disabled");
    });

    it("closes dialog on secondary button click", function() {
      cy
        .get(".modal-footer .button-collection .button")
        .contains("Cancel")
        .click();
      cy.get(".modal-body").should("to.have.length", 0);
    });
  });

  context("Suspend Action", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-for-each-health",
        nodeHealth: true
      });

      cy.visitUrl({ url: "/services/overview" });

      openDropdown("cassandra-healthy");
      clickDropdownAction("Suspend");
    });

    it("opens the correct service suspend dialog", function() {
      cy
        .get(".confirm-modal p span")
        .contains("/cassandra-healthy")
        .should("to.have.length", 1);
    });

    it("disables button during API request", function() {
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: []
      });
      cy
        .get(".confirm-modal .button-collection .button-primary")
        .click()
        .should("have.class", "disabled");
    });

    it("closes dialog on successful API request", function() {
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: []
      });
      cy.get(".confirm-modal .button-collection .button-primary").click();
      cy.get(".confirm-modal").should("to.have.length", 0);
    });

    it("shows error message on conflict", function() {
      cy.route({
        method: "PUT",
        status: 409,
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: {
          message: "App is locked by one or more deployments."
        }
      });
      cy.get(".confirm-modal .button-collection .button-primary").click();
      cy
        .get(".confirm-modal .text-danger")
        .should("to.have.text", "App is locked by one or more deployments.");
    });

    it("shows error message on not authorized", function() {
      cy.route({
        method: "PUT",
        status: 403,
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: {
          message: "Not Authorized to perform this action!"
        }
      });
      cy.get(".confirm-modal .button-collection .button-primary").click();
      cy
        .get(".confirm-modal .text-danger")
        .should("to.have.text", "Not Authorized to perform this action!");
    });

    it("reenables button after faulty request", function() {
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: [],
        delay: SERVER_RESPONSE_DELAY
      });
      cy
        .get(".confirm-modal .button-collection .button-primary")
        .as("primaryButton")
        .click();
      cy.get("@primaryButton").should("have.class", "disabled");
      cy.get("@primaryButton").should("not.have.class", "disabled");
    });

    it("closes dialog on secondary button click", function() {
      cy
        .get(".confirm-modal .button-collection .button")
        .contains("Cancel")
        .click();
      cy.get(".confirm-modal").should("to.have.length", 0);
    });
  });

  context("Resume Action", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-service-suspended",
        nodeHealth: true
      });

      cy.visitUrl({ url: "/services/overview" });
    });

    it("hides the suspend option in the service action dropdown", function() {
      openDropdown("sleep");

      cy
        .get(".dropdown-menu-items li")
        .contains("Suspend")
        .should("have.class", "hidden");
    });

    it("shows the resume option in the service action dropdown", function() {
      openDropdown("sleep");

      cy
        .get(".dropdown-menu-items li")
        .contains("Resume")
        .should("not.have.class", "hidden");
    });

    it("opens the resume dialog", function() {
      openDropdown("sleep");
      clickDropdownAction("Resume");

      cy
        .get(".modal-header")
        .contains("Resume Service")
        .should("have.length", 1);
    });

    it("opens the resume dialog with the instances textbox if the single app instance label does not exist", function() {
      openDropdown("sleep");
      clickDropdownAction("Resume");

      cy.get('input[name="instances"]').should("have.length", 1);
    });

    it("opens the resume dialog without the instances textbox if the single app instance label exists", function() {
      cy.configureCluster({
        mesos: "1-service-suspended-single-instance",
        nodeHealth: true
      });

      cy.visitUrl({ url: "/services/overview" });

      openDropdown("sleep");
      clickDropdownAction("Resume");

      cy.get('input[name="instances"]').should("have.length", 0);
    });

    it("disables button during API request", function() {
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/sleep/,
        response: []
      });

      openDropdown("sleep");
      clickDropdownAction("Resume");

      cy
        .get(".modal-footer .button-collection .button-primary")
        .click()
        .should("have.class", "disabled");
    });

    it("closes dialog on successful API request", function() {
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/sleep/,
        response: []
      });

      openDropdown("sleep");
      clickDropdownAction("Resume");

      cy.get(".modal-footer .button-collection .button-primary").click();
      cy.get(".modal-body").should("to.have.length", 0);
    });

    it("shows error message on conflict", function() {
      cy.route({
        method: "PUT",
        status: 409,
        url: /marathon\/v2\/apps\/\/sleep/,
        response: {
          message: "App is locked by one or more deployments."
        }
      });

      openDropdown("sleep");
      clickDropdownAction("Resume");

      cy.get(".modal-footer .button-collection .button-primary").click();
      cy
        .get(".modal-body .text-danger")
        .should("to.have.text", "App is locked by one or more deployments.");
    });

    it("shows error message on not authorized", function() {
      cy.route({
        method: "PUT",
        status: 403,
        url: /marathon\/v2\/apps\/\/sleep/,
        response: {
          message: "Not Authorized to perform this action!"
        }
      });

      openDropdown("sleep");
      clickDropdownAction("Resume");

      cy.get(".modal-footer .button-collection .button-primary").click();
      cy
        .get(".modal-body .text-danger")
        .should("to.have.text", "Not Authorized to perform this action!");
    });

    it("reenables button after faulty request", function() {
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/sleep/,
        response: [],
        delay: SERVER_RESPONSE_DELAY
      });

      openDropdown("sleep");
      clickDropdownAction("Resume");

      cy
        .get(".modal-footer .button-collection .button-primary")
        .as("primaryButton")
        .click();
      cy.get("@primaryButton").should("have.class", "disabled");
      cy.get("@primaryButton").should("not.have.class", "disabled");
    });

    it("closes dialog on secondary button click", function() {
      openDropdown("sleep");
      clickDropdownAction("Resume");

      cy
        .get(".modal-footer .button-collection .button")
        .contains("Cancel")
        .click();
      cy.get(".modal-body").should("to.have.length", 0);
    });
  });
});
