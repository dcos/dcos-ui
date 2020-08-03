import { SERVER_RESPONSE_DELAY } from "../../_support/constants/Timeouts";

describe("Service Actions", () => {
  function clickHeaderAction(actionText) {
    cy.get(".page-header-actions .dropdown").click();

    cy.get(".dropdown-menu-items").contains(actionText).click();
  }

  context("Open Service Action", () => {
    it('displays the "Open Service" option for services that have a web UI', () => {
      cy.configureCluster({
        mesos: "1-for-each-health",
        nodeHealth: true,
      });
      cy.visitUrl({ url: "/services/detail/%2Fcassandra-healthy" });

      cy.get(".page-header-actions .dropdown").click();

      cy.get(".dropdown-menu-items")
        .contains("Open Service")
        .should(($menuItem) => {
          expect($menuItem.length).to.equal(1);
        });
    });

    it('does not display the "Open Service" option for services that do not have a web UI', () => {
      cy.configureCluster({
        mesos: "1-for-each-health",
        nodeHealth: true,
      });
      cy.visitUrl({ url: "/services/detail/%2Fcassandra-unhealthy" });

      cy.get(".page-header-actions .dropdown").click();

      cy.get(".dropdown-menu-items")
        .contains("Open Service")
        .should(($menuItem) => {
          expect($menuItem.length).to.equal(0);
        });
    });

    it('does not display the "Open Service" option for SDK services', () => {
      cy.configureCluster({
        mesos: "1-sdk-service",
        nodeHealth: true,
      });
      cy.visitUrl({ url: "/services/detail/%2Fservices%2Fsdk-sleep" });

      cy.get(".page-header-actions .dropdown").click();

      cy.get(".dropdown-menu-items")
        .contains("Open Service")
        .should(($menuItem) => {
          expect($menuItem.length).to.equal(0);
        });
    });
  });

  it("does meaningful things while editing", () => {
    cy.configureCluster({ mesos: "1-for-each-health", universePackages: true });

    cy.visitUrl({ url: "/services/detail/%2Fcassandra-healthy" });
    clickHeaderAction("Edit");

    cy.log("navigates to the correct route");
    cy.location()
      .its("hash")
      .should("include", "#/services/detail/%2Fcassandra-healthy/edit");

    cy.log("opens the correct service edit modal");
    cy.get('.modal input[name="name"]').should("to.have.value", "elastic");

    cy.log("closes modal on successful API request");
    cy.contains("Review & Run").click();
    cy.get(".modal .modal-header .button").contains("Run Service").click();
    cy.get(".modal").should("have.length", 0);

    cy.log("opens confirm after edits");
    clickHeaderAction("Edit");
    cy.get('.modal input[name="name"]').retype("elast");
    cy.get("button").contains("Cancel").click();
    cy.get("button").contains("Discard").click();
    cy.get(".modal").should("have.length", 0);

    cy.log("it stays in the edit modal after cancelling confirmation");
    clickHeaderAction("Edit");
    cy.get('.modal input[name="name"]').retype("elast");
    cy.get("button").contains("Cancel").click();
    cy.get(".modal-small button").contains("Cancel").click();
    cy.get(".modal-small").should("have.length", 0);
    cy.get(".modal").should("have.length", 1);

    cy.log("opens and closes the JSON mode after clicking toggle");
    cy.get(".modal .modal-header span").contains("JSON Editor").click();
    const visibleJSONEditor = ".modal-full-screen-side-panel.is-visible";
    cy.get(visibleJSONEditor).should("have.length", 1);
    cy.get(".modal .modal-header span").contains("JSON Editor").click();
    cy.get(visibleJSONEditor).should("have.length", 0);

    cy.log("shows error messages");
    cy.get('.modal input[name="name"]').clear();
    cy.contains("Review & Run").click();

    cy.log("... tab error badge");
    cy.get(".modal span[class*='css-']").should("have.length", 1);

    cy.log("... anchored error");
    cy.get(".modal .form-control-feedback")
      .contains("Expecting a string here")
      .should("have.length", 1);

    cy.log("... in JSON editor");
    cy.get(".modal .ace_gutter-cell.ace_error").should("have.length", 1);

    cy.log("... and disables Review & Run");
    cy.contains("Review & Run").closest("button").should("be.disabled");

    cy.log("change JSON editor contents when form content change");
    cy.get('.modal input[name="name"]').retype(`elast`);
    // there seems to be some rendering-timing-issue going on that swallows
    // typed characters while the error-hinting is disabled. to get rid of
    // CI-flakes we just type again. we actually should fix our forms - but
    // that'll take a lot of time.
    cy.get('.modal input[name="name"]').retype(`elast`);
    cy.get(".modal .ace_line").contains("elast").should("have.length", 1);

    cy.log("shows review screen when Review & Run clicked");
    cy.contains("Review & Run").click();
    cy.get(".modal .configuration-map-label").contains("Name");

    cy.log("back button on review screen goes back to form");
    cy.get(".modal .modal-header button").contains("Back").click();
    cy.get('.modal input[name="name"]');

    cy.log("shows edit config button on review screen that opens form");
    cy.contains("Review & Run").click();
    cy.contains("Edit Config").click();
    cy.get('.modal input[name="name"]').should("have.value", "elast");
  });

  context("Top Level Edit Action", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-for-each-health",
        nodeHealth: true,
        universePackages: true,
      });

      cy.visitUrl({ url: "/services/detail/%2Fcassandra-healthy" });
    });
    it("shows a Edit button on top level", () => {
      cy.get(".button").contains("Edit").click();

      cy.location()
        .its("hash")
        .should("include", "#/services/detail/%2Fcassandra-healthy/edit");
    });
  });

  context("Destroy Action", () => {
    context("Application", () => {
      beforeEach(() => {
        cy.configureCluster({
          mesos: "1-task-healthy",
          nodeHealth: true,
        });

        cy.visitUrl({ url: "/services/detail/%2Fsleep" });
        clickHeaderAction("Delete");
      });

      it("opens the correct service destroy dialog", () => {
        cy.get(".modal-body p strong")
          .contains("sleep")
          .should("have.length", 1);

        cy.log("disable danger button while service name isn't correct");
        cy.get(".modal-small .button-danger").should("have.class", "disabled");

        cy.log("shows error message on conflict");
        cy.route({
          method: "DELETE",
          status: 409,
          url: /marathon\/v2\/apps\/\/sleep/,
          response: { message: "App is locked by one or more deployments." },
        });
        cy.get(".modal-body .filter-input-text").type("sleep");
        cy.get(".modal-small .button-danger").click();
        cy.get(".modal-body .text-danger").should(
          "have.text",
          "App is locked by one or more deployments."
        );

        cy.log("shows error message on not authorized");
        cy.route({
          method: "DELETE",
          status: 403,
          url: /marathon\/v2\/apps\/\/sleep/,
          response: { message: "Not Authorized to perform this action!" },
        });
        cy.get(".modal-body .filter-input-text").type("sleep");
        cy.get(".modal-small .button-danger").click();
        cy.get(".modal-body .text-danger").should(
          "to.have.text",
          "Not Authorized to perform this action!"
        );

        cy.log("re-enables button after faulty request");
        cy.route({
          method: "DELETE",
          status: 403,
          url: /marathon\/v2\/apps\/\/sleep/,
          response: {
            message: { message: "Not Authorized to perform this action!" },
          },
          delay: SERVER_RESPONSE_DELAY,
        });
        cy.get(".modal-body .filter-input-text").type("sleep");
        cy.get(".modal-small .button-danger").as("dangerButton");
        cy.get("@dangerButton").should("not.have.class", "disabled");

        cy.log("closes dialog on secondary button click");
        cy.get(".modal-small .button").contains("Cancel").click();
        cy.get(".modal-small").should("have.length", 0);

        cy.log("closes dialog when server responds with success");
        cy.route({
          method: "DELETE",
          url: /marathon\/v2\/apps\/\/sleep/,
          response: [],
        });
        clickHeaderAction("Delete");
        cy.get(".modal-body .filter-input-text").type("sleep");
        cy.get(".modal-small .button-danger").click();
        cy.get(".modal-small").should("have.length", 0);
      });
    });
  });

  context("Scale Action", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-for-each-health",
        nodeHealth: true,
      });

      cy.visitUrl({ url: "/services/detail/%2Fcassandra-healthy" });
      clickHeaderAction("Scale");
    });

    it("opens the scale dialog", () => {
      cy.get(".modal-header")
        .contains("Scale Service")
        .should("have.length", 1);

      cy.log("disables button during API request");
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: [],
        delay: SERVER_RESPONSE_DELAY,
      });
      cy.get(".modal-footer .button-primary")
        .click()
        .should("have.class", "disabled");

      cy.log("modal closes eventually");
      cy.get(".modal-body").should("have.length", 0);

      cy.log("shows error message on conflict");
      clickHeaderAction("Scale");
      cy.route({
        method: "PUT",
        status: 409,
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: {
          message: "App is locked by one or more deployments.",
        },
      });
      cy.get(".modal-footer .button-primary").click();
      cy.get(".modal-body .text-danger").should(
        "to.have.text",
        "App is locked by one or more deployments."
      );

      cy.log("shows error message on not authorized");
      cy.route({
        method: "PUT",
        status: 403,
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: {
          message: "Not Authorized to perform this action!",
        },
      });
      cy.get(".modal-footer .button-primary").click();
      cy.get(".modal-body .text-danger").should(
        "to.have.text",
        "Not Authorized to perform this action!"
      );

      cy.log("re-enables button after faulty request");
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: [],
        delay: SERVER_RESPONSE_DELAY,
      });
      cy.get(".modal-footer .button-primary").as("primaryButton").click();
      cy.get("@primaryButton").should("have.class", "disabled");
      cy.get("@primaryButton").should("not.have.class", "disabled");

      cy.log("closes dialog on secondary button click");
      clickHeaderAction("Scale");
      cy.get(".modal-footer .button").contains("Cancel").click();
      cy.get(".modal-body").should("have.length", 0);
    });
  });

  context("Stop Action", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-for-each-health",
        nodeHealth: true,
      });

      cy.visitUrl({ url: "/services/detail/%2Fcassandra-healthy" });
      clickHeaderAction("Stop");
    });

    it("opens the correct service stop dialog", () => {
      cy.get(".modal-small p strong")
        .contains("cassandra-healthy")
        .should("have.length", 1);

      cy.log("disables button during API request");
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: [],
        delay: SERVER_RESPONSE_DELAY,
      });
      cy.get(".modal-small .button-danger")
        .click()
        .should("have.class", "disabled");

      cy.log("closes dialog on successful API request");
      cy.get(".modal-small").should("have.length", 0);

      cy.log("shows error message on conflict");
      cy.route({
        method: "PUT",
        status: 409,
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: {
          message: "App is locked by one or more deployments.",
        },
      });
      clickHeaderAction("Stop");
      cy.get(".modal-small .button-danger").click();
      cy.get(".modal-small .text-danger").should(
        "to.have.text",
        "App is locked by one or more deployments."
      );

      cy.log("shows error message on not authorized");
      cy.route({
        method: "PUT",
        status: 403,
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: {
          message: "Not Authorized to perform this action!",
        },
      });
      cy.get(".modal-small .button-danger").click();
      cy.get(".modal-small .text-danger").should(
        "to.have.text",
        "Not Authorized to perform this action!"
      );

      cy.log("re-enables button after faulty request");
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/cassandra-healthy/,
        response: [],
        delay: SERVER_RESPONSE_DELAY,
      });
      cy.get(".modal-small .button-danger").as("primaryButton").click();
      cy.get("@primaryButton").should("have.class", "disabled");
      cy.get("@primaryButton").should("not.have.class", "disabled");

      cy.log("closes dialog on secondary button click");
      clickHeaderAction("Stop");
      cy.get(".modal-small .button").contains("Cancel").click();
      cy.get(".modal-small").should("have.length", 0);
    });
  });

  context("Resume Action", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-service-suspended",
        nodeHealth: true,
      });

      cy.visitUrl({ url: "/services/detail/%2Fsleep" });
    });

    it("hides the stop option in the service action dropdown", () => {
      cy.get(".page-header-actions .dropdown").click();

      cy.get(".dropdown-menu-items li").should("not.contain", "Stop");

      cy.log("shows the resume option in the service action dropdown");
      cy.get(".dropdown-menu-items li")
        .contains("Resume")
        .should("not.have.class", "hidden");

      cy.log("opens the resume dialog");
      cy.get(".dropdown-menu-items").contains("Resume").click();

      cy.get(".modal-header")
        .contains("Resume Service")
        .should("have.length", 1);

      cy.log(
        "opens the resume dialog with the instances textbox if the single app instance label does not exist"
      );
      cy.get('input[name="instances"]').should("have.length", 1);

      cy.log(
        "opens the resume dialog without the instances textbox if the single app instance label exists"
      );
      cy.configureCluster({
        mesos: "1-service-suspended-single-instance",
        nodeHealth: true,
      });
      cy.get('input[name="instances"]').should("have.length", 0);

      cy.log("disables button during API request");
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/sleep/,
        response: [],
        delay: SERVER_RESPONSE_DELAY,
      });
      cy.get(".modal-footer .button-primary")
        .click()
        .should("have.class", "disabled");

      cy.log("closes dialog on successful API request");
      cy.get(".modal-body").should("have.length", 0);

      cy.log("shows error message on conflict");
      clickHeaderAction("Resume");
      cy.route({
        method: "PUT",
        status: 409,
        url: /marathon\/v2\/apps\/\/sleep/,
        response: {
          message: "App is locked by one or more deployments.",
        },
      });
      cy.get(".modal-footer .button-primary").click();
      cy.get(".modal-body .text-danger").should(
        "to.have.text",
        "App is locked by one or more deployments."
      );

      cy.log("shows error message on not authorized");
      cy.route({
        method: "PUT",
        status: 403,
        url: /marathon\/v2\/apps\/\/sleep/,
        response: {
          message: "Not Authorized to perform this action!",
        },
      });
      cy.get(".modal-footer .button-primary").click();
      cy.get(".modal-body .text-danger").should(
        "to.have.text",
        "Not Authorized to perform this action!"
      );

      cy.log("re-enables button after faulty request");
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/sleep/,
        response: [],
        delay: SERVER_RESPONSE_DELAY,
      });
      cy.get(".modal-footer .button-primary").as("primaryButton").click();
      cy.get("@primaryButton").should("have.class", "disabled");
      cy.get("@primaryButton").should("not.have.class", "disabled");

      cy.log("closes dialog on secondary button click");
      clickHeaderAction("Resume");

      cy.get(".modal-footer .button").contains("Cancel").click();
      cy.get(".modal-body").should("have.length", 0);
    });
  });

  context("SDK Services", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-sdk-service",
        nodeHealth: true,
      });

      cy.visitUrl({ url: "/services/detail/%2Fservices%2Fsdk-sleep" });
    });

    it("opens the destroy dialog", () => {
      clickHeaderAction("Delete");
      cy.get(".modal-header")
        .contains("Delete Service")
        .should("have.length", 1);
      cy.get(".modal-body p").contains("sdk-sleep");
      cy.get(".modal .filter-input-text");
      cy.get(".modal button").contains("Cancel").click();
      cy.get(".modal").should("not.exist");

      cy.log("submits destroy with enter");
      clickHeaderAction("Delete");
      cy.get(".modal-header")
        .contains("Delete Service")
        .should("have.length", 1);

      cy.get(".modal-body p").contains("sdk-sleep");
      cy.get(".modal .filter-input-text").type("sdk-sleep{enter}");
      cy.get(".modal .filter-input-text").should("be.empty");
      cy.get(".modal button").contains("Cancel").click();

      cy.log("opens the scale dialog");
      clickHeaderAction("Scale");
      cy.get(".modal-header")
        .contains("Scale Service")
        .should("have.length", 1);
      cy.get(".modal pre").contains(
        "dcos test --name=/services/sdk-sleep update start --options=options.json"
      );
      cy.get(".modal button").contains("Close").click();
      cy.get(".modal").should("not.exist");

      cy.log("restart does not exist");
      cy.get(".page-header-actions .dropdown")
        .click()
        .should("not.contain", "restart");

      cy.log("stop does not exist");
      cy.get(".page-header-actions .dropdown")
        .click()
        .should("not.contain", "stop");
    });
  });
});
