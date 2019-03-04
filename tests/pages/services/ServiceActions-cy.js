import { SERVER_RESPONSE_DELAY } from "../../_support/constants/Timeouts";

describe("Service Actions", function() {
  function clickHeaderAction(actionText) {
    cy.get(".page-header-actions .dropdown").click();

    cy.get(".dropdown-menu-items")
      .contains(actionText)
      .click();
  }

  context("Open Service Action", function() {
    it('displays the "Open Service" option for services that have a web UI', function() {
      cy.configureCluster({
        mesos: "1-for-each-health",
        nodeHealth: true
      });
      cy.visitUrl({ url: "/services/detail/%2Fcassandra-healthy" });

      cy.get(".page-header-actions .dropdown").click();

      cy.get(".dropdown-menu-items")
        .contains("Open Service")
        .should(function($menuItem) {
          expect($menuItem.length).to.equal(1);
        });
    });

    it('does not display the "Open Service" option for services that do not have a web UI', function() {
      cy.configureCluster({
        mesos: "1-for-each-health",
        nodeHealth: true
      });
      cy.visitUrl({ url: "/services/detail/%2Fcassandra-unhealthy" });

      cy.get(".page-header-actions .dropdown").click();

      cy.get(".dropdown-menu-items")
        .contains("Open Service")
        .should(function($menuItem) {
          expect($menuItem.length).to.equal(0);
        });
    });

    it('does not display the "Open Service" option for SDK services', function() {
      cy.configureCluster({
        mesos: "1-sdk-service",
        nodeHealth: true
      });
      cy.visitUrl({ url: "/services/detail/%2Fservices%2Fsdk-sleep" });

      cy.get(".page-header-actions .dropdown").click();

      cy.get(".dropdown-menu-items")
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
        nodeHealth: true,
        universePackages: true
      });

      cy.visitUrl({ url: "/services/detail/%2Fcassandra-healthy" });

      clickHeaderAction("Edit");
    });

    it("navigates to the correct route", function() {
      cy.location()
        .its("hash")
        .should("include", "#/services/detail/%2Fcassandra-healthy/edit");
    });

    it("opens the correct service edit modal", function() {
      cy.get('.modal .menu-tabbed-container input[name="name"]').should(
        "to.have.value",
        "elastic"
      );
    });

    it("closes modal on successful API request", function() {
      cy.get(".modal .modal-header .button")
        .contains("Review & Run")
        .click();

      cy.get(".modal .modal-header .button")
        .contains("Run Service")
        .click();

      cy.get(".modal").should("to.have.length", 0);
    });

    it("opens confirm after edits", function() {
      cy.get('.modal .menu-tabbed-container input[name="name"]').type("elast");

      cy.get(".modal .modal-header .button")
        .contains("Cancel")
        .click();

      cy.get(".modal-small").should("to.have.length", 1);
    });

    it("closes both confirm and edit modal after confirmation", function() {
      cy.get('.modal .menu-tabbed-container input[name="name"]').type("elast");
      cy.get(".modal .modal-header .button")
        .contains("Cancel")
        .click();

      cy.get(".modal-small .button")
        .contains("Discard")
        .click();

      cy.get(".modal-small").should("to.have.length", 0);
      cy.get(".modal").should("to.have.length", 0);
    });

    it("it stays in the edit modal after cancelling confirmation", function() {
      cy.get('.modal .menu-tabbed-container input[name="name"]').type("elast");
      cy.get(".modal .modal-header .button")
        .contains("Cancel")
        .click();
      cy.get(".modal-small .button")
        .contains("Cancel")
        .click();

      cy.get(".modal-small").should("to.have.length", 0);
      cy.get(".modal").should("to.have.length", 1);
    });

    it("opens and closes the JSON mode after clicking toggle", function() {
      cy.get(".modal .modal-header span")
        .contains("JSON Editor")
        .click();

      cy.get(".modal .modal-full-screen-side-panel.is-visible").should(
        "to.have.length",
        1
      );

      cy.get(".modal .modal-header span")
        .contains("JSON Editor")
        .click();

      cy.get(".modal .modal-full-screen-side-panel.is-visible").should(
        "to.have.length",
        0
      );
    });

    it("shows tab error badge when error in form section", function() {
      cy.get('.modal .menu-tabbed-container input[name="name"]')
        .type("{selectall}{backspace}")
        .type("{selectall}{backspace}");

      cy.get(".modal .modal-header button")
        .contains("Review & Run")
        .click();

      cy.get(".modal .menu-tabbed-container span[class*='css-']").should(
        "to.have.length",
        1
      );
    });

    it("shows anchored error when error in form section", function() {
      cy.get('.modal .menu-tabbed-container input[name="name"]')
        .type("{selectall}{backspace}")
        .type("{selectall}{backspace}");

      cy.get(".modal .modal-header button")
        .contains("Review & Run")
        .click();

      cy.get(".modal .menu-tabbed-container .form-control-feedback")
        .contains("Expecting a string here")
        .should("to.have.length", 1);
    });

    it("shows error message in JSON when form error", function() {
      cy.get('.modal .menu-tabbed-container input[name="name"]')
        .type("{selectall}{backspace}")
        .type("{selectall}{backspace}");

      cy.get(".modal .modal-header button")
        .contains("Review & Run")
        .click();

      cy.get(
        ".modal .modal-full-screen-side-panel .ace_gutter-cell.ace_error"
      ).should("to.have.length", 1);
    });

    it("disables Review & Run button when error", function() {
      cy.get('.modal .menu-tabbed-container input[name="name"]')
        .type("{selectall}{backspace}")
        .type("{selectall}{backspace}");

      cy.get(".modal .modal-header button")
        .contains("Review & Run")
        .click();

      cy.get(".modal .modal-header button[disabled]")
        .contains("Review & Run")
        .should("to.have.length", 1);
    });

    it("change JSON editor contents when form content change", function() {
      cy.get('.modal .menu-tabbed-container input[name="name"]').type(
        `{selectall}elast`
      );

      cy.get(".modal .modal-full-screen-side-panel .ace_line")
        .contains("elast")
        .should("to.have.length", 1);
    });

    it("shows review screen when Review & Run clicked", function() {
      cy.get(".modal .modal-header button")
        .contains("Review & Run")
        .click();

      cy.get(".modal .configuration-map-label")
        .contains("Name")
        .should("to.have.length", 1);
    });

    it("back button on review screen goes back to form", function() {
      cy.get(".modal .modal-header button")
        .contains("Review & Run")
        .click();

      cy.get(".modal .modal-header button")
        .contains("Back")
        .click();

      cy.get('.modal .menu-tabbed-container input[name="name"]').should(
        "have.length",
        1
      );
    });

    it("shows edit config button on review screen that opens form", function() {
      cy.get(".modal .modal-header button")
        .contains("Review & Run")
        .click();

      cy.get(".modal button")
        .contains("Edit Config")
        .click();

      cy.get('.modal .menu-tabbed-container input[name="name"]').should(
        "to.have.value",
        "elastic"
      );
    });
  });

  context("Top Level Edit Action", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-for-each-health",
        nodeHealth: true,
        universePackages: true
      });

      cy.visitUrl({ url: "/services/detail/%2Fcassandra-healthy" });
    });
    it("shows a Edit button on top level", function() {
      cy.get(".button")
        .contains("Edit")
        .click();

      cy.location()
        .its("hash")
        .should("include", "#/services/detail/%2Fcassandra-healthy/edit");
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
        cy.get(".modal-body p strong")
          .contains("sleep")
          .should("to.have.length", 1);
      });

      it("disable danger button while service name isn't correct", function() {
        cy.get(".modal-small .button-danger").should("have.class", "disabled");
      });

      it("closes dialog when user type correct service name", function() {
        cy.route({
          method: "DELETE",
          url: /marathon\/v2\/apps\/\/sleep/,
          response: []
        });
        cy.get(".modal-body .filter-input-text").type("sleep");
        cy.get(".modal-small .button-danger").click();
        cy.get(".modal-small").should("to.have.length", 0);
      });

      it("shows error message on conflict", function() {
        cy.route({
          method: "DELETE",
          status: 409,
          url: /marathon\/v2\/apps\/\/sleep/,
          response: { message: "App is locked by one or more deployments." }
        });
        cy.get(".modal-body .filter-input-text").type("sleep");
        cy.get(".modal-small .button-danger").click();
        cy.get(".modal-body .text-danger").should(
          "to.have.text",
          "App is locked by one or more deployments."
        );
      });

      it("shows error message on not authorized", function() {
        cy.route({
          method: "DELETE",
          status: 403,
          url: /marathon\/v2\/apps\/\/sleep/,
          response: { message: "Not Authorized to perform this action!" }
        });
        cy.get(".modal-body .filter-input-text").type("sleep");
        cy.get(".modal-small .button-danger").click();
        cy.get(".modal-body .text-danger").should(
          "to.have.text",
          "Not Authorized to perform this action!"
        );
      });

      it("re-enables button after faulty request", function() {
        cy.route({
          method: "DELETE",
          status: 403,
          url: /marathon\/v2\/apps\/\/sleep/,
          response: {
            message: { message: "Not Authorized to perform this action!" }
          },
          delay: SERVER_RESPONSE_DELAY
        });
        cy.get(".modal-small .button-danger").as("dangerButton");
        cy.get(".modal-body .filter-input-text").type("sleep");
        cy.get("@dangerButton").should("not.have.class", "disabled");
      });

      it("closes dialog on secondary button click", function() {
        cy.get(".modal-small .button")
          .contains("Cancel")
          .click();
        cy.get(".modal-small").should("to.have.length", 0);
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
      cy.get(".modal-header")
        .contains("Scale Service")
        .should("to.have.length", 1);
    });

    it("disables button during API request", function() {
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: [],
        delay: SERVER_RESPONSE_DELAY
      });
      cy.get(".modal-footer .button-primary")
        .click()
        .should("have.class", "disabled");
    });

    it("closes dialog on successful API request", function() {
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: []
      });
      cy.get(".modal-footer .button-primary").click();
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
      cy.get(".modal-footer .button-primary").click();
      cy.get(".modal-body .text-danger").should(
        "to.have.text",
        "App is locked by one or more deployments."
      );
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
      cy.get(".modal-footer .button-primary").click();
      cy.get(".modal-body .text-danger").should(
        "to.have.text",
        "Not Authorized to perform this action!"
      );
    });

    it("re-enables button after faulty request", function() {
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: [],
        delay: SERVER_RESPONSE_DELAY
      });
      cy.get(".modal-footer .button-primary")
        .as("primaryButton")
        .click();
      cy.get("@primaryButton").should("have.class", "disabled");
      cy.get("@primaryButton").should("not.have.class", "disabled");
    });

    it("closes dialog on secondary button click", function() {
      cy.get(".modal-footer .button")
        .contains("Cancel")
        .click();
      cy.get(".modal-body").should("to.have.length", 0);
    });
  });

  context("Stop Action", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-for-each-health",
        nodeHealth: true
      });

      cy.visitUrl({ url: "/services/detail/%2Fcassandra-healthy" });
      clickHeaderAction("Stop");
    });

    it("opens the correct service stop dialog", function() {
      cy.get(".modal-small p strong")
        .contains("cassandra-healthy")
        .should("to.have.length", 1);
    });

    it("disables button during API request", function() {
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: [],
        delay: SERVER_RESPONSE_DELAY
      });
      cy.get(".modal-small .button-danger")
        .click()
        .should("have.class", "disabled");
    });

    it("closes dialog on successful API request", function() {
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: []
      });
      cy.get(".modal-small .button-danger").click();
      cy.get(".modal-small").should("to.have.length", 0);
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
      cy.get(".modal-small .button-danger").click();
      cy.get(".modal-small .text-danger").should(
        "to.have.text",
        "App is locked by one or more deployments."
      );
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
      cy.get(".modal-small .button-danger").click();
      cy.get(".modal-small .text-danger").should(
        "to.have.text",
        "Not Authorized to perform this action!"
      );
    });

    it("re-enables button after faulty request", function() {
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: [],
        delay: SERVER_RESPONSE_DELAY
      });
      cy.get(".modal-small .button-danger")
        .as("primaryButton")
        .click();
      cy.get("@primaryButton").should("have.class", "disabled");
      cy.get("@primaryButton").should("not.have.class", "disabled");
    });

    it("closes dialog on secondary button click", function() {
      cy.get(".modal-small .button")
        .contains("Cancel")
        .click();
      cy.get(".modal-small").should("to.have.length", 0);
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

    it("hides the stop option in the service action dropdown", function() {
      cy.get(".page-header-actions .dropdown").click();

      cy.get(".dropdown-menu-items li").should("not.contain", "Stop");
    });

    it("shows the resume option in the service action dropdown", function() {
      cy.get(".page-header-actions .dropdown").click();

      cy.get(".dropdown-menu-items li")
        .contains("Resume")
        .should("not.have.class", "hidden");
    });

    it("opens the resume dialog", function() {
      clickHeaderAction("Resume");

      cy.get(".modal-header")
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
        response: [],
        delay: SERVER_RESPONSE_DELAY
      });

      clickHeaderAction("Resume");

      cy.get(".modal-footer .button-primary")
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

      cy.get(".modal-footer .button-primary").click();
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

      cy.get(".modal-footer .button-primary").click();
      cy.get(".modal-body .text-danger").should(
        "to.have.text",
        "App is locked by one or more deployments."
      );
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

      cy.get(".modal-footer .button-primary").click();
      cy.get(".modal-body .text-danger").should(
        "to.have.text",
        "Not Authorized to perform this action!"
      );
    });

    it("re-enables button after faulty request", function() {
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/sleep/,
        response: [],
        delay: SERVER_RESPONSE_DELAY
      });

      clickHeaderAction("Resume");

      cy.get(".modal-footer .button-primary")
        .as("primaryButton")
        .click();
      cy.get("@primaryButton").should("have.class", "disabled");
      cy.get("@primaryButton").should("not.have.class", "disabled");
    });

    it("closes dialog on secondary button click", function() {
      clickHeaderAction("Resume");

      cy.get(".modal-footer .button")
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

      cy.get(".modal-header")
        .contains("Delete Service")
        .should("to.have.length", 1);

      cy.get(".modal-body p").contains("sdk-sleep");
      cy.get(".modal .filter-input-text").should("exist");

      cy.get(".modal button")
        .contains("Cancel")
        .click();

      cy.get(".modal").should("not.exist");
    });

    it("submits destroy with enter", function() {
      clickHeaderAction("Delete");

      cy.get(".modal-header")
        .contains("Delete Service")
        .should("to.have.length", 1);

      cy.get(".modal-body p").contains("sdk-sleep");
      cy.get(".modal .filter-input-text").should("exist");

      cy.get(".modal .filter-input-text").type("sdk-sleep{enter}");
      cy.get(".modal .filter-input-text").should("be.empty");
    });

    it("opens the scale dialog", function() {
      clickHeaderAction("Scale");

      cy.get(".modal-header")
        .contains("Scale Service")
        .should("to.have.length", 1);

      cy.get(".modal pre").contains(
        "dcos test --name=/services/sdk-sleep update start --options=options.json"
      );

      cy.get(".modal button")
        .contains("Close")
        .click();

      cy.get(".modal").should("not.exist");
    });

    it("restart does not exist", function() {
      cy.get(".page-header-actions .dropdown")
        .click()
        .contains("restart")
        .should("not.exist");
    });

    it("stop does not exist", function() {
      cy.get(".page-header-actions .dropdown")
        .click()
        .contains("stop")
        .should("not.exist");
    });
  });
});
