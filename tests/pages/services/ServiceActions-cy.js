import { SERVER_RESPONSE_DELAY } from "../../_support/constants/Timeouts";

describe("Service Actions", function() {
  function clickHeaderAction(actionText) {
    cy.get(".page-header-actions .dropdown").click();
    cy.get(".dropdown-menu-items").contains(actionText).click();
  }

  context("Open Service Action", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-for-each-health",
        nodeHealth: true
      });

      cy.visitUrl({ url: "/services/detail/%2Fcassandra-healthy" });
    });

    it('displays the "Open Service" option for services that have a web UI', function() {
      cy.get(".page-header-actions .dropdown").click();
      cy
        .get(".dropdown-menu-items")
        .contains("Open Service")
        .should(function($menuItem) {
          expect($menuItem.length).to.equal(1);
        });
    });

    it('does not display the "Open Service" option for services that have a web UI', function() {
      cy.visitUrl({ url: "/services/detail/%2Fcassandra-unhealthy" });

      cy.get(".page-header-actions .dropdown").click();
      cy
        .get(".dropdown-menu-items")
        .contains("Open Service")
        .should(function($menuItem) {
          expect($menuItem.length).to.equal(0);
        });
    });
  });

  context("Edit Action", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-for-each-health",
        nodeHealth: true
      });

      cy.visitUrl({ url: "/services/detail/%2Fcassandra-healthy" });

      clickHeaderAction("Edit");
    });

    it("navigates to the correct route", function() {
      cy
        .location()
        .its("hash")
        .should("include", "#/services/detail/%2Fcassandra-healthy/edit");
    });

    it("opens the correct service edit modal", function() {
      cy
        .get('.modal .menu-tabbed-view input[name="id"]')
        .should("to.have.value", "/cassandra-healthy");
    });

    it("closes modal on successful API request", function() {
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: []
      });
      cy.get(".modal .modal-header .button").contains("Review & Run").click();
      cy.get(".modal .modal-header .button").contains("Run Service").click();
      cy.get(".modal").should("to.have.length", 0);
    });

    it("closes modal on secondary button click", function() {
      cy.get(".modal .modal-header .button").contains("Cancel").click();
      cy.get(".modal").should("to.have.length", 0);
    });

    it("opens confirm after edits", function() {
      cy.get('.modal .menu-tabbed-view input[name="cpus"]').type("5"); // Edit the cpus field
      cy.get(".modal .modal-header .button").contains("Cancel").click();

      cy.get(".confirm-modal").should("to.have.length", 1);
    });

    it("closes both confirm and edit modal after confirmation", function() {
      cy.get('.modal .menu-tabbed-view input[name="cpus"]').type("5"); // Edit the cpus field
      cy.get(".modal .modal-header .button").contains("Cancel").click();
      cy.get(".confirm-modal .button").contains("Discard").click();

      cy.get(".confirm-modal").should("to.have.length", 0);
      cy.get(".modal").should("to.have.length", 0);
    });

    it("it stays in the edit modal after cancelling confirmation", function() {
      cy.get('.modal .menu-tabbed-view input[name="cpus"]').type("5"); // Edit the cpus field
      cy.get(".modal .modal-header .button").contains("Cancel").click();
      cy.get(".confirm-modal .button").contains("Cancel").click();

      cy.get(".confirm-modal").should("to.have.length", 0);
      cy.get(".modal").should("to.have.length", 1);
    });
  });

  context("Destroy Action", function() {
    context("Application", function() {
      beforeEach(function() {
        cy.configureCluster({
          mesos: "1-task-healthy",
          nodeHealth: true
        });

        cy.visitUrl({ url: "/services/detail/%2Fsleep" });
        clickHeaderAction("Delete");
      });

      it("opens the correct service destroy dialog", function() {
        cy
          .get(".modal-body p strong")
          .contains("/sleep")
          .should("to.have.length", 1);
      });

      it("disable danger button while service name isn't correct", function() {
        cy
          .get(".confirm-modal .button-collection .button-danger")
          .should("have.class", "disabled");
      });

      it("closes dialog when user type correct service name", function() {
        cy.route({
          method: "DELETE",
          url: /marathon\/v2\/apps\/\/sleep/,
          response: []
        });
        cy.get(".modal-body .filter-input-text").type("/sleep");
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
        cy.get(".modal-body .filter-input-text").type("/sleep");
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
        cy.get(".modal-body .filter-input-text").type("/sleep");
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
          .as("dangerButton");
        cy.get(".modal-body .filter-input-text").type("/sleep");
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

      cy.visitUrl({ url: "/services/detail/%2Fcassandra-healthy" });
      clickHeaderAction("Scale");
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

      cy.visitUrl({ url: "/services/detail/%2Fcassandra-healthy" });
      clickHeaderAction("Suspend");
    });

    it("opens the correct service suspend dialog", function() {
      cy
        .get(".confirm-modal p .emphasize")
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

      cy.visitUrl({ url: "/services/detail/%2Fsleep" });
    });

    it("hides the suspend option in the service action dropdown", function() {
      cy.get(".page-header-actions .dropdown").click();

      cy.get(".dropdown-menu-items li").should("not.contain", "Suspend");
    });

    it("shows the resume option in the service action dropdown", function() {
      cy.get(".page-header-actions .dropdown").click();

      cy
        .get(".dropdown-menu-items li")
        .contains("Resume")
        .should("not.have.class", "hidden");
    });

    it("opens the resume dialog", function() {
      clickHeaderAction("Resume");

      cy
        .get(".modal-header")
        .contains("Resume Service")
        .should("have.length", 1);
    });

    it("opens the resume dialog with the instances textbox if the single app instance label does not exist", function() {
      clickHeaderAction("Resume");

      cy.get('input[name="instances"]').should("have.length", 1);
    });

    it("opens the resume dialog without the instances textbox if the single app instance label exists", function() {
      cy.configureCluster({
        mesos: "1-service-suspended-single-instance",
        nodeHealth: true
      });

      clickHeaderAction("Resume");

      cy.get('input[name="instances"]').should("have.length", 0);
    });

    it("disables button during API request", function() {
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/sleep/,
        response: []
      });

      clickHeaderAction("Resume");

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

      clickHeaderAction("Resume");

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

      clickHeaderAction("Resume");

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

      clickHeaderAction("Resume");

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

      clickHeaderAction("Resume");

      cy
        .get(".modal-footer .button-collection .button-primary")
        .as("primaryButton")
        .click();
      cy.get("@primaryButton").should("have.class", "disabled");
      cy.get("@primaryButton").should("not.have.class", "disabled");
    });

    it("closes dialog on secondary button click", function() {
      clickHeaderAction("Resume");

      cy
        .get(".modal-footer .button-collection .button")
        .contains("Cancel")
        .click();
      cy.get(".modal-body").should("to.have.length", 0);
    });
  });

  context("SDK Services", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-sdk-service",
        nodeHealth: true
      });

      cy.visitUrl({ url: "/services/detail/%2Fservices%2Fsdk-sleep" });
    });

    it("opens the destroy dialog", function() {
      clickHeaderAction("Delete");

      cy
        .get(".modal-header")
        .contains("Delete Service")
        .should("to.have.length", 1);

      cy
        .get(".modal pre")
        .contains("dcos package uninstall test --app-id=/services/sdk-sleep");

      cy.get(".modal button").contains("Close").click();

      cy.get(".modal").should("not.exist");
    });

    it("opens the edit dialog", function() {
      clickHeaderAction("Edit");

      cy
        .get(".modal-header")
        .contains("Edit Service")
        .should("to.have.length", 1);

      cy
        .get(".modal pre")
        .contains(
          "dcos test --name=/services/sdk-sleep update --options=test-options.json"
        );

      cy.get(".modal button").contains("Close").click();

      cy.get(".modal").should("not.exist");
    });

    it("opens the scale dialog", function() {
      clickHeaderAction("Scale");

      cy
        .get(".modal-header")
        .contains("Scale Service")
        .should("to.have.length", 1);

      cy
        .get(".modal pre")
        .contains(
          "dcos test --name=/services/sdk-sleep update --options=test-options.json"
        );

      cy.get(".modal button").contains("Close").click();

      cy.get(".modal").should("not.exist");
    });

    it("opens the suspend dialog", function() {
      clickHeaderAction("Suspend");

      cy
        .get(".modal-header")
        .contains("Suspend Service")
        .should("to.have.length", 1);

      cy
        .get(".modal pre")
        .contains(
          "dcos test --name=/services/sdk-sleep update --options=test-options.json"
        );

      cy.get(".modal button").contains("Close").click();

      cy.get(".modal").should("not.exist");
    });

    it("opens the resume dialog", function() {
      cy.configureCluster({
        mesos: "1-suspended-sdk-service",
        nodeHealth: true
      });

      clickHeaderAction("Resume");

      cy
        .get(".modal-header")
        .contains("Resume Service")
        .should("have.length", 1);

      cy
        .get(".modal pre")
        .contains(
          "dcos test --name=/services/sdk-sleep update --options=test-options.json"
        );

      cy.get(".modal button").contains("Close").click();

      cy.get(".modal").should("not.exist");
    });

    it("opens the restart dialog", function() {
      clickHeaderAction("Restart");

      cy
        .get(".modal-header")
        .contains("Restart Service")
        .should("have.length", 1);

      cy
        .get(".modal pre")
        .contains("dcos marathon app restart /services/sdk-sleep");
      cy.get(".modal button").contains("Close").click();

      cy.get(".modal").should("not.exist");
    });
  });
});
