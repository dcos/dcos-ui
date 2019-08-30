import { SERVER_RESPONSE_DELAY } from "../../_support/constants/Timeouts";

describe("Service Table", () => {
  function openDropdown(serviceName) {
    if (serviceName) {
      cy.get(".filter-input-text").type(`{selectall}${serviceName}`);
      // filter to find the correct service
    }

    cy.get(".form-control-group-add-on")
      .eq(-1)
      .click(); // close filter window
    // scrolling right several times, as we (or react virtualized) seem to change the width of the table while scrolling as of today
    for (const i of [1, 2, 3]) {
      cy.get(".ReactVirtualized__Grid")
        .eq(-1) // bottom right grid
        .scrollTo("right", { duration: i * 200 }); // scroll to the actions column
    }
    cy.get(".actions-dropdown").should("not.to.have.length", 0);
    cy.get(".actions-dropdown")
      .eq(0)
      .click();
  }

  function clickDropdownAction(actionText) {
    cy.get(".dropdown-menu-items")
      .contains(actionText)
      .click();
  }

  context("Service status", () => {
    it("shows correct status and icon for a delayed service", () => {
      cy.configureCluster({
        mesos: "1-service-delayed",
        nodeHealth: true
      });

      cy.visitUrl({ url: "/services/overview" });

      cy.get(".service-status-icon-wrapper").contains("Delayed");
      cy.get(".service-status-icon-wrapper").find(
        'svg[aria-label="system-yield icon"]'
      );
    });

    it("shows correct status and icon for a delayed pod", () => {
      cy.configureCluster({
        mesos: "1-pod-delayed",
        nodeHealth: true
      });

      cy.visitUrl({ url: "/services/overview" });

      cy.get(".service-status-icon-wrapper").contains("Delayed");
      cy.get(".service-status-icon-wrapper").find(
        'svg[aria-label="system-yield icon"]'
      );
    });
  });

  context("Destroy Action", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy",
        nodeHealth: true
      });
      cy.visitUrl({ url: "/services/overview" });

      openDropdown();
      clickDropdownAction("Delete");
    });

    it("disables button during API request", () => {
      cy.route({
        method: "DELETE",
        url: /marathon\/v2\/apps\/\/sleep/,
        response: [],
        delay: SERVER_RESPONSE_DELAY
      });
      cy.get(".modal-small .button-danger").should("have.class", "disabled");
    });
  });

  context("Resume Action", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-service-suspended",
        nodeHealth: true
      });

      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/sleep/,
        response: [],
        delay: SERVER_RESPONSE_DELAY
      });

      cy.visitUrl({ url: "/services/overview" });
    });

    it("has a reasonable dropdown", () => {
      openDropdown();

      // hides stop
      cy.get(".dropdown-menu-items li")
        .contains("Stop")
        .should("not.exist");

      // shows resume
      cy.get(".dropdown-menu-items li")
        .contains("Resume")
        .should("not.have.class", "hidden");

      // opens resume
      clickDropdownAction("Resume");
      cy.get(".modal-header")
        .contains("Resume Service")
        .should("have.length", 1);

      // opens the resume dialog with the instances textbox if the single app instance label does not exist
      cy.get('input[name="instances"]').should("have.length", 1);

      // disables button during API request
      cy.get(".modal-footer .button-primary")
        .click()
        .should("have.class", "disabled");

      // closes dialog on successful API request
      openDropdown();
      clickDropdownAction("Resume");
      cy.get(".modal-footer .button-primary").click();
      cy.get(".modal-body").should("to.have.length", 0);

      // opens the resume dialog without the instances textbox if the single app instance label exists
      cy.configureCluster({
        mesos: "1-service-suspended-single-instance",
        nodeHealth: true
      });
      openDropdown();
      clickDropdownAction("Resume");

      cy.get('input[name="instances"]').should("have.length", 0);
    });

    it("shows error message on conflict", () => {
      cy.route({
        method: "PUT",
        status: 409,
        url: /marathon\/v2\/apps\/\/sleep/,
        response: {
          message: "App is locked by one or more deployments."
        }
      });

      openDropdown();
      clickDropdownAction("Resume");

      cy.get(".modal-footer .button-primary").click();
      cy.get(".modal-body .text-danger").should(
        "to.have.text",
        "App is locked by one or more deployments."
      );
    });

    it("shows error message on not authorized", () => {
      cy.route({
        method: "PUT",
        status: 403,
        url: /marathon\/v2\/apps\/\/sleep/,
        response: {
          message: "Not Authorized to perform this action!"
        }
      });

      openDropdown();
      clickDropdownAction("Resume");

      cy.get(".modal-footer .button-primary").click();
      cy.get(".modal-body .text-danger").should(
        "to.have.text",
        "Not Authorized to perform this action!"
      );
    });

    it("reenables button after faulty request", () => {
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/sleep/,
        response: [],
        delay: SERVER_RESPONSE_DELAY
      });

      openDropdown();
      clickDropdownAction("Resume");

      cy.get(".modal-footer .button-primary")
        .as("primaryButton")
        .click();
      cy.get("@primaryButton").should("have.class", "disabled");
      cy.get("@primaryButton").should("not.have.class", "disabled");
    });

    it("closes dialog on secondary button click", () => {
      openDropdown();
      clickDropdownAction("Resume");

      cy.get(".modal-footer .button")
        .contains("Cancel")
        .click();
      cy.get(".modal-body").should("to.have.length", 0);
    });
  });

  context("Reset Delay Action", () => {
    context("Delayed service", () => {
      beforeEach(() => {
        cy.configureCluster({
          mesos: "1-task-delayed",
          nodeHealth: true
        });
        cy.visitUrl({ url: "/services/overview" });

        openDropdown("sleep");
        clickDropdownAction("Reset Delay");
      });

      it("shows a toast notification", () => {
        cy.route({
          method: "DELETE",
          url: /marathon\/v2\/queue\/\/sleep\/delay/,
          response: []
        });
        cy.get(".toasts-container");
      });
    });

    context("Non-delayed service", () => {
      beforeEach(() => {
        cy.configureCluster({
          mesos: "1-task-healthy",
          nodeHealth: true
        });
        cy.visitUrl({ url: "/services/overview" });

        openDropdown();
      });

      it("doesn't have a reset delayed action", () => {
        cy.get(".dropdown-menu-items")
          .contains("Reset Delay")
          .should("not.exist");
      });
    });

    context("Delayed pod", () => {
      beforeEach(() => {
        cy.configureCluster({
          mesos: "1-pod-delayed",
          nodeHealth: true
        });
        cy.visitUrl({ url: "/services/overview" });

        openDropdown("podses");
        clickDropdownAction("Reset Delay");
      });

      it("shows a toast notification", () => {
        cy.route({
          method: "DELETE",
          url: /marathon\/v2\/queue\/\/podses\/delay/,
          response: []
        });
        cy.get(".toasts-container");
      });
    });

    context("Non-delayed pod", () => {
      beforeEach(() => {
        cy.configureCluster({
          mesos: "1-pod",
          nodeHealth: true
        });
        cy.visitUrl({ url: "/services/overview" });
        openDropdown("podses");
      });

      it("doesn't have a reset delayed action", () => {
        cy.get(".dropdown-menu-items")
          .contains("Reset Delay")
          .should("not.exist");
      });
    });
  });

  context("SDK Services", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-sdk-service",
        nodeHealth: true
      });

      cy.visitUrl({ url: "/services/overview/%2Fservices" });
    });

    it("updates package icon", () => {
      const imageUrl = "foo.png";
      const serviceName = "sdk-sleep-with-image";

      cy.get(".service-table").find(
        `.icon-image-container img[src="${imageUrl}"]`
      );

      cy.contains(serviceName).click();

      cy.get(".breadcrumb").find(
        `.icon-image-container img[src="${imageUrl}"]`
      );
    });

    it("has a reasonable Dropdown", () => {
      openDropdown("sleep");

      // restart does not exist
      cy.get(".dropdown-menu-items")
        .contains("restart")
        .should("not.exist");

      // stop does not exist
      cy.get(".dropdown-menu-items")
        .contains("stop")
        .should("not.exist");

      // opens the destroy dialog
      openDropdown("sleep");
      clickDropdownAction("Delete");

      cy.get(".modal-header")
        .contains("Delete Service")
        .should("to.have.length", 1);

      cy.get(".modal-body p").contains("sdk-sleep");
      cy.get(".modal .filter-input-text");

      cy.get(".modal button")
        .contains("Cancel")
        .click();

      cy.get(".modal").should("not.exist");

      // opens the scale dialog
      openDropdown("sleep");
      clickDropdownAction("Scale");

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

      // has an 'Open Service'-DropdownItem when DCOS_SERVICE_WEB_PATH-label is set
      openDropdown("sdk-sleep-with-image");
      cy.get(".dropdown-menu-items").contains("Open Service");
    });

    it("shows the full version for a framework", () => {
      cy.get(".ReactVirtualized__Grid__innerScrollContainer")
        .last() // Bottom right part of the table.
        .children()
        .eq(6) // Version column for the second row.
        .contains("1.0.0-2.0.0");
    });
  });

  context("SDK Groups", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-sdk-service",
        nodeHealth: true
      });

      cy.visitUrl({ url: "/services/overview" });
    });

    it("opens the cannot delete group dialog", () => {
      openDropdown("services");
      clickDropdownAction("Delete");

      cy.get(".modal-header")
        .contains("Delete Group")
        .should("to.have.length", 1);

      cy.get(".modal-body").contains(
        "This group needs to be empty to delete it. Please delete any services or groups in the group first."
      );
      cy.get(".modal .filter-input-text").should("not.exist");

      cy.get(".modal button")
        .contains("OK")
        .click();

      cy.get(".modal").should("not.exist");
    });

    it("opens the scale dialog", () => {
      openDropdown("services");
      clickDropdownAction("Scale");

      cy.get(".modal-header")
        .contains("Scale Group")
        .should("to.have.length", 1);

      cy.get(".modal pre").contains(
        "dcos test --name=/services/sdk-sleep update start --options=options.json"
      );

      cy.get(".modal pre").contains(
        "dcos marathon app update /services/sleep options.json"
      );

      cy.get(".modal button")
        .contains("Close")
        .click();

      cy.get(".modal").should("not.exist");
    });
  });

  context("Region Column", () => {
    context("Single Region", () => {
      beforeEach(() => {
        cy.configureCluster({
          mesos: "1-task-healthy-with-region",
          regions: 1,
          nodeHealth: true
        });
        cy.visitUrl({ url: "/services/overview" });
      });

      it("does contain the right region", () => {
        cy.get(".filter-input-text").type("sleep");
        cy.get(".form-control-group-add-on")
          .eq(-1)
          .click(); // close filter window

        cy.get(".ReactVirtualized__Grid")
          .eq(-1) // bottom right grid
          .contains("Region-A")
          .should("to.have.length", 1);
      });
    });

    context("Multiple Regions", () => {
      beforeEach(() => {
        cy.configureCluster({
          mesos: "1-task-healthy-with-region",
          regions: 2,
          nodeHealth: true
        });
        cy.visitUrl({ url: "/services/overview" });
      });

      it("does contain the right region", () => {
        cy.get(".filter-input-text").type("sleep");
        cy.get(".form-control-group-add-on")
          .eq(-1)
          .click(); // close filter window

        cy.get(".ReactVirtualized__Grid")
          .eq(-1) // bottom right grid
          .contains("Region-A, Region-B")
          .should("to.have.length", 1);
      });
    });
  });

  it("renders groups", () => {
    cy.configureCluster({
      mesos: "1-sdk-service",
      nodeHealth: true
    });

    cy.visitUrl({ url: "/services/overview" });

    // group status shows the highest priority
    cy.get(".status-bar-text")
      .eq(0)
      .contains("Running (1 of 2)");

    // group status is an aggregate of children"
    cy.get(".status-bar-text")
      .eq(1)
      .contains("Running (3 of 3)");

    // shows service status counts in group tooltip
    cy.get(".service-status-icon-wrapper > .tooltip-wrapper")
      .eq(0)
      .trigger("mouseover");
    cy.get(".tooltip").contains("1 Stopped");

    // shows service status counts in group tooltip
    cy.get(".service-status-icon-wrapper > .tooltip-wrapper")
      .eq(1)
      .trigger("mouseover");
    cy.get(".tooltip").contains("3 Running");
  });
});
