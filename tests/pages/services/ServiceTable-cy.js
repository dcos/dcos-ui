import { SERVER_RESPONSE_DELAY } from "../../_support/constants/Timeouts";

describe("Service Table", function() {
  function openDropdown(serviceName) {
    cy.get(".filter-input-text").type(serviceName); // filter to find the correct service
    cy.get(".form-control-group-add-on")
      .eq(-1)
      .click(); // close filter window
    cy.wait(2000); // wait for data to load
    cy.get(".ReactVirtualized__Grid")
      .eq(-1) // bottom right grid
      .scrollTo("right"); // scroll to the actions column
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

  context("Service status", function() {
    it("shows correct status and icon for a delayed service", function() {
      cy.configureCluster({
        mesos: "1-service-delayed",
        nodeHealth: true
      });

      cy.visitUrl({ url: "/services/overview" });

      cy.get(".service-status-icon-wrapper")
        .contains("Delayed")
        .should("exist"); // Text
      cy.get(".service-status-icon-wrapper")
        .find('svg[aria-label="system-yield icon"]')
        .should("exist"); // Icon
    });

    it("shows correct status and icon for a delayed pod", function() {
      cy.configureCluster({
        mesos: "1-pod-delayed",
        nodeHealth: true
      });

      cy.visitUrl({ url: "/services/overview" });

      cy.get(".service-status-icon-wrapper")
        .contains("Delayed")
        .should("exist"); // Text
      cy.get(".service-status-icon-wrapper")
        .find('svg[aria-label="system-yield icon"]')
        .should("exist"); // Icon
    });
  });

  context("Destroy Action", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-task-healthy",
        nodeHealth: true
      });
      cy.visitUrl({ url: "/services/overview" });

      openDropdown("sleep");
      clickDropdownAction("Delete");
    });

    it("disables button during API request", function() {
      cy.route({
        method: "DELETE",
        url: /marathon\/v2\/apps\/\/sleep/,
        response: [],
        delay: SERVER_RESPONSE_DELAY
      });
      cy.get(".modal-small .button-danger").should("have.class", "disabled");
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

    it("hides the stop option in the service action dropdown", function() {
      openDropdown("sleep");

      cy.get(".dropdown-menu-items li")
        .contains("Stop")
        .should("not.exist");
    });

    it("shows the resume option in the service action dropdown", function() {
      openDropdown("sleep");

      cy.get(".dropdown-menu-items li")
        .contains("Resume")
        .should("not.have.class", "hidden");
    });

    it("opens the resume dialog", function() {
      openDropdown("sleep");
      clickDropdownAction("Resume");

      cy.get(".modal-header")
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

      openDropdown("sleep");
      clickDropdownAction("Resume");

      cy.get('input[name="instances"]').should("have.length", 0);
    });

    it("disables button during API request", function() {
      cy.route({
        method: "PUT",
        url: /marathon\/v2\/apps\/\/sleep/,
        response: [],
        delay: SERVER_RESPONSE_DELAY
      });

      openDropdown("sleep");
      clickDropdownAction("Resume");

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

      openDropdown("sleep");
      clickDropdownAction("Resume");

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

      openDropdown("sleep");
      clickDropdownAction("Resume");

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

      openDropdown("sleep");
      clickDropdownAction("Resume");

      cy.get(".modal-footer .button-primary").click();
      cy.get(".modal-body .text-danger").should(
        "to.have.text",
        "Not Authorized to perform this action!"
      );
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

      cy.get(".modal-footer .button-primary")
        .as("primaryButton")
        .click();
      cy.get("@primaryButton").should("have.class", "disabled");
      cy.get("@primaryButton").should("not.have.class", "disabled");
    });

    it("closes dialog on secondary button click", function() {
      openDropdown("sleep");
      clickDropdownAction("Resume");

      cy.get(".modal-footer .button")
        .contains("Cancel")
        .click();
      cy.get(".modal-body").should("to.have.length", 0);
    });
  });

  context("Reset Delay Action", function() {
    context("Delayed service", function() {
      beforeEach(function() {
        cy.configureCluster({
          mesos: "1-task-delayed",
          nodeHealth: true
        });
        cy.visitUrl({ url: "/services/overview" });

        openDropdown("sleep");
        clickDropdownAction("Reset Delay");
      });

      it("shows a toast notification", function() {
        cy.route({
          method: "DELETE",
          url: /marathon\/v2\/queue\/\/sleep\/delay/,
          response: []
        });
        cy.get(".toasts-container").should("exist");
      });
    });

    context("Non-delayed service", function() {
      beforeEach(function() {
        cy.configureCluster({
          mesos: "1-task-healthy",
          nodeHealth: true
        });
        cy.visitUrl({ url: "/services/overview" });

        openDropdown("sleep");
      });

      it("doesn't have a reset delayed action", function() {
        cy.get(".dropdown-menu-items")
          .contains("Reset Delay")
          .should("not.exist");
      });
    });

    context("Delayed pod", function() {
      beforeEach(function() {
        cy.configureCluster({
          mesos: "1-pod-delayed",
          nodeHealth: true
        });
        cy.visitUrl({ url: "/services/overview" });

        openDropdown("podses");
        clickDropdownAction("Reset Delay");
      });

      it("shows a toast notification", function() {
        cy.route({
          method: "DELETE",
          url: /marathon\/v2\/queue\/\/podses\/delay/,
          response: []
        });
        cy.get(".toasts-container").should("exist");
      });
    });

    context("Non-delayed pod", function() {
      beforeEach(function() {
        cy.configureCluster({
          mesos: "1-pod",
          nodeHealth: true
        });
        cy.visitUrl({ url: "/services/overview" });
        openDropdown("podses");
      });

      it("doesn't have a reset delayed action", function() {
        cy.get(".dropdown-menu-items")
          .contains("Reset Delay")
          .should("not.exist");
      });
    });
  });

  context("SDK Services", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-sdk-service",
        nodeHealth: true
      });

      cy.visitUrl({ url: "/services/overview/%2Fservices" });
    });

    it("updates package icon", function() {
      const imageUrl = "foo.png";
      const serviceName = "sdk-sleep-with-image";

      cy.get(".service-table")
        .find(`.icon-image-container img[src="${imageUrl}"]`)
        .should("exist");

      cy.contains(serviceName).click();

      cy.get(".breadcrumb")
        .find(`.icon-image-container img[src="${imageUrl}"]`)
        .should("exist");
    });

    it("opens the destroy dialog", function() {
      openDropdown("sdk-sleep");
      clickDropdownAction("Delete");

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

    it("opens the scale dialog", function() {
      openDropdown("sdk-sleep");
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
    });

    it("restart does not exist", function() {
      openDropdown("sdk-sleep");

      cy.get(".dropdown-menu-items")
        .contains("restart")
        .should("not.exist");
    });

    it("stop does not exist", function() {
      openDropdown("sdk-sleep");

      cy.get(".dropdown-menu-items")
        .contains("stop")
        .should("not.exist");
    });

    it("has an 'Open Service'-DropdownItem when DCOS_SERVICE_WEB_PATH-label is set", function() {
      openDropdown("sdk-sleep-with-image");

      cy.get(".dropdown-menu-items")
        .contains("Open Service")
        .should("exist");
    });

    it("shows the full version for a framework", function() {
      cy.get(".ReactVirtualized__Grid__innerScrollContainer")
        .last() // Bottom right part of the table.
        .children()
        .eq(1) // Version column for the first row.
        .contains("1.0.0-2.0.0");
    });
  });

  context("SDK Groups", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-sdk-service",
        nodeHealth: true
      });

      cy.visitUrl({ url: "/services/overview" });
    });

    it("opens the cannot delete group dialog", function() {
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

    it("opens the scale dialog", function() {
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

    context("Create groups modal", function() {
      beforeEach(function() {
        cy.get("button.button-narrow")
          .eq(-1)
          .click();
        cy.get("li.is-selectable")
          .contains("Create Group")
          .click();
      });

      it("displays an error for a group name starting with a dot", function() {
        cy.get(".form-group")
          .find('.form-control[name="id"]')
          .type(".test");
        cy.get(".modal-full-screen-actions-primary")
          .contains("Create")
          .click();
        cy.get(".form-control-feedback")
          .contains(
            "Name must be at least 1 character and may only contain digits (0-9), dashes (-), dots (.), and lowercase letters (a-z). The name may not begin or end with a dash or dot."
          )
          .should("exist");
      });

      it("displays an error for a group name ending with a dot", function() {
        cy.get(".form-group")
          .find('.form-control[name="id"]')
          .type("test.");
        cy.get(".modal-full-screen-actions-primary")
          .contains("Create")
          .click();
        cy.get(".form-control-feedback")
          .contains(
            "Name must be at least 1 character and may only contain digits (0-9), dashes (-), dots (.), and lowercase letters (a-z). The name may not begin or end with a dash or dot."
          )
          .should("exist");
      });

      it("displays an error for a group name starting with a dash", function() {
        cy.get(".form-group")
          .find('.form-control[name="id"]')
          .type("-test");
        cy.get(".modal-full-screen-actions-primary")
          .contains("Create")
          .click();
        cy.get(".form-control-feedback")
          .contains(
            "Name must be at least 1 character and may only contain digits (0-9), dashes (-), dots (.), and lowercase letters (a-z). The name may not begin or end with a dash or dot."
          )
          .should("exist");
      });

      it("displays an error for a group name ending with a dash", function() {
        cy.get(".form-group")
          .find('.form-control[name="id"]')
          .type("test-");
        cy.get(".modal-full-screen-actions-primary")
          .contains("Create")
          .click();
        cy.get(".form-control-feedback")
          .contains(
            "Name must be at least 1 character and may only contain digits (0-9), dashes (-), dots (.), and lowercase letters (a-z). The name may not begin or end with a dash or dot."
          )
          .should("exist");
      });

      it("displays an error for a group name containing unallowed symbols", function() {
        cy.get(".form-group")
          .find('.form-control[name="id"]')
          .type(".te$t");
        cy.get(".modal-full-screen-actions-primary")
          .contains("Create")
          .click();
        cy.get(".form-control-feedback")
          .contains(
            "Name must be at least 1 character and may only contain digits (0-9), dashes (-), dots (.), and lowercase letters (a-z). The name may not begin or end with a dash or dot."
          )
          .should("exist");
      });

      context("Fullscreen group modal", function() {
        function getInput(id) {
          return cy.get(".form-group").find('.form-control[name="' + id + '"]');
        }

        it("displays a fullscreen modal for top level groups", function() {
          cy.get(".modal-full-screen").should("exist");
        });

        it("displays the fullscreen modal when visiting the url", function() {
          cy.visitUrl({ url: "/services/overview/create_group" });
          cy.get(".modal-full-screen").should("exist");
        });

        it("displays a header", function() {
          cy.get(".modal-full-screen-header-title")
            .contains("New Group")
            .should("exist");
        });

        it("displays a General section", function() {
          cy.get("h1")
            .contains("General")
            .should("exist");
        });

        it("displays a name label input", function() {
          cy.get(".form-group-heading-content")
            .contains("Name")
            .should("exist");
          cy.get(".form-group-heading-content")
            .contains("Name")
            .siblings()
            .eq(0) // First sibling.
            .contains("*")
            .should("exist");
          getInput("id").should("exist");
          getInput("id").type("group-name");
          getInput("id").should("have.value", "group-name");
        });

        it("displays a path", function() {
          cy.get(".form-group-heading-content")
            .contains("Path")
            .should("exist");
          cy.get("div")
            .contains("/")
            .should("exist");
          getInput("id").type("group-name");
          cy.get("div")
            .contains("/group-name")
            .should("exist");
        });

        it("displays a Quota section", function() {
          cy.get(".form-group-heading-content")
            .contains("Quota")
            .should("exist");
        });

        it("displays a CPUs label and input", function() {
          cy.get(".form-group-heading-content")
            .contains("CPUs")
            .should("exist");
          getInput("quota.cpus").should("exist");
          getInput("quota.cpus").type("1");
          getInput("quota.cpus").should("have.value", "1");
        });

        it("displays a Memory label and input", function() {
          cy.get(".form-group-heading-content")
            .contains("Mem (MiB)")
            .should("exist");
          getInput("quota.mem").should("exist");
          getInput("quota.mem").type("10");
          getInput("quota.mem").should("have.value", "10");
        });

        it("displays a Disk label and input", function() {
          cy.get(".form-group-heading-content")
            .contains("Disk (MiB)")
            .should("exist");
          getInput("quota.disk").should("exist");
          getInput("quota.disk").type("5");
          getInput("quota.disk").should("have.value", "5");
        });

        it("displays a GPUs label and input", function() {
          cy.get(".form-group-heading-content")
            .contains("GPUs")
            .should("exist");
          getInput("quota.gpus").should("exist");
          getInput("quota.gpus").type("0.5");
          getInput("quota.gpus").should("have.value", "0.5");
        });

        it("displays advanced settings", function() {
          cy.get(".advanced-section-label")
            .contains("Advanced Settings")
            .should("exist");
        });

        it("shows and hides the advanced settings", function() {
          cy.get(".advanced-section-content").should("not.exist");
          cy.get(".advanced-section-label")
            .contains("Advanced Settings")
            .click();
          cy.get(".advanced-section-content").should("exist");
          cy.get(".advanced-section-label")
            .contains("Advanced Settings")
            .click();
          cy.get(".advanced-section-content").should("not.exist");
        });

        it("shows role enforcement labels and checkboxes", function() {
          cy.get(".advanced-section-label")
            .contains("Advanced Settings")
            .click();
          cy.get(".form-group-heading-content")
            .contains("Role Enforcement")
            .should("exist");
          cy.get(".form-control-toggle")
            .contains("Use Group Role")
            .should("exist");
          cy.get(".form-control-toggle")
            .contains("Recommended")
            .should("exist");
          cy.get(".form-control-toggle")
            .contains(
              "Allows Quota to be enforced on all the services in the group."
            )
            .should("exist");
          cy.get(".form-control-toggle")
            .contains("Use Legacy Role")
            .should("exist");
          cy.get(".form-control-toggle")
            .contains("Will not enforce quota on all services in the group.")
            .should("exist");
        });

        it("fails to submit if name value is invalid", function() {
          getInput("id").type(".");
          cy.get(".button-primary")
            .contains("Create")
            .click();
          cy.get(".errorsAlert-message")
            .contains("An error occurred with your configuration.")
            .should("exist");
          cy.get(".errorsAlert-message")
            .contains(
              "Group name must be at least 1 character and may only contain digits (0-9), dashes (-), dots (.), and lowercase letters (a-z). The name may not begin or end with a dash or dot."
            )
            .should("exist");
          cy.get(".form-control-feedback")
            .contains(
              "Name must be at least 1 character and may only contain digits (0-9), dashes (-), dots (.), and lowercase letters (a-z). The name may not begin or end with a dash or dot."
            )
            .should("exist");
        });

        it("fails to submit if CPUs value is invalid", function() {
          getInput("quota.cpus").type("-1");
          cy.get(".button-primary")
            .contains("Create")
            .click();
          cy.get(".errorsAlert-message")
            .contains("An error occurred with your configuration.")
            .should("exist");
          cy.get(".errorsAlert-message")
            .contains("CPU must be bigger than or equal to 0")
            .should("exist");
          cy.get(".form-control-feedback")
            .contains("Must be bigger than or equal to 0")
            .should("exist");

          getInput("quota.cpus").type("a");
          cy.get(".button-primary")
            .contains("Create")
            .click();
          cy.get(".errorsAlert-message")
            .contains("An error occurred with your configuration.")
            .should("exist");
          cy.get(".errorsAlert-message")
            .contains("CPU must be a number")
            .should("exist");
          cy.get(".form-control-feedback")
            .contains("Must be a number")
            .should("exist");
        });

        it("fails to submit if memory value is invalid", function() {
          getInput("quota.mem").type("-1");
          cy.get(".button-primary")
            .contains("Create")
            .click();
          cy.get(".errorsAlert-message")
            .contains("An error occurred with your configuration.")
            .should("exist");
          cy.get(".errorsAlert-message")
            .contains("Mem must be bigger than or equal to 0")
            .should("exist");
          cy.get(".form-control-feedback")
            .contains("Must be bigger than or equal to 0")
            .should("exist");

          getInput("quota.mem").type("a");
          cy.get(".button-primary")
            .contains("Create")
            .click();
          cy.get(".errorsAlert-message")
            .contains("An error occurred with your configuration.")
            .should("exist");
          cy.get(".errorsAlert-message")
            .contains("Mem must be a number")
            .should("exist");
          cy.get(".form-control-feedback")
            .contains("Must be a number")
            .should("exist");
        });

        it("fails to submit if disk value is invalid", function() {
          getInput("quota.disk").type("-1");
          cy.get(".button-primary")
            .contains("Create")
            .click();
          cy.get(".errorsAlert-message")
            .contains("An error occurred with your configuration.")
            .should("exist");
          cy.get(".errorsAlert-message")
            .contains("Disk must be bigger than or equal to 0")
            .should("exist");
          cy.get(".form-control-feedback")
            .contains("Must be bigger than or equal to 0")
            .should("exist");

          getInput("quota.disk").type("a");
          cy.get(".button-primary")
            .contains("Create")
            .click();
          cy.get(".errorsAlert-message")
            .contains("An error occurred with your configuration.")
            .should("exist");
          cy.get(".errorsAlert-message")
            .contains("Disk must be a number")
            .should("exist");
          cy.get(".form-control-feedback")
            .contains("Must be a number")
            .should("exist");
        });

        it("fails to submit if GPUs value is invalid", function() {
          getInput("quota.gpus").type("-1");
          cy.get(".button-primary")
            .contains("Create")
            .click();
          cy.get(".errorsAlert-message")
            .contains("An error occurred with your configuration.")
            .should("exist");
          cy.get(".errorsAlert-message")
            .contains("GPU must be bigger than or equal to 0")
            .should("exist");
          cy.get(".form-control-feedback")
            .contains("Must be bigger than or equal to 0")
            .should("exist");

          getInput("quota.gpus").type("a");
          cy.get(".button-primary")
            .contains("Create")
            .click();
          cy.get(".errorsAlert-message")
            .contains("An error occurred with your configuration.")
            .should("exist");
          cy.get(".errorsAlert-message")
            .contains("GPU must be a number")
            .should("exist");
          cy.get(".form-control-feedback")
            .contains("Must be a number")
            .should("exist");
        });

        it("fails to create a group for a user with insufficient permissions", function() {
          getInput("id").type("group-name");
          getInput("quota.cpus").type("1");
          getInput("quota.mem").type("10");
          getInput("quota.disk").type("5");
          getInput("quota.gpus").type("0.5");

          cy.get(".button-primary")
            .contains("Create")
            .click();

          cy.get(".errorsAlert-message")
            .contains("An error occurred with your configuration.")
            .should("exist");
        });
      });

      context("Small group modal", function() {
        it("displays a small group modal for non-top-level groups", function() {
          cy.visitUrl({ url: "/services/overview" });
          cy.get(".table-cell-link-primary")
            .contains("services")
            .click();
          cy.get("button.button-narrow")
            .eq(-1)
            .click();
          cy.get("li.is-selectable")
            .contains("Create Group")
            .click();
          cy.get(".modal-small").should("exist");
          cy.get(".modal-full-screen").should("not.exist");
        });
      });
    });
  });

  context("Region Column", function() {
    context("Single Region", () => {
      beforeEach(function() {
        cy.configureCluster({
          mesos: "1-task-healthy-with-region",
          regions: 1,
          nodeHealth: true
        });
        cy.visitUrl({ url: "/services/overview" });
      });

      it("does contain the right region", function() {
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
      beforeEach(function() {
        cy.configureCluster({
          mesos: "1-task-healthy-with-region",
          regions: 2,
          nodeHealth: true
        });
        cy.visitUrl({ url: "/services/overview" });
      });

      it("does contain the right region", function() {
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

  context("Groups", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-sdk-service",
        nodeHealth: true
      });

      cy.visitUrl({ url: "/services/overview" });
    });

    it("group status is an aggregate of children", function() {
      cy.get(".status-bar-text")
        .eq(1)
        .contains("Running (3 of 3)");
    });

    it("shows service status counts in group tooltip", function() {
      cy.get(".service-status-icon-wrapper > .tooltip-wrapper")
        .eq(1)
        .trigger("mouseover");
      cy.get(".tooltip").contains("3 Running");
    });

    it("group status shows the highest priority", function() {
      cy.get(".status-bar-text")
        .eq(0)
        .contains("Running (1 of 2)");
    });

    it("shows service status counts in group tooltip", function() {
      cy.get(".service-status-icon-wrapper > .tooltip-wrapper")
        .eq(0)
        .trigger("mouseover");
      cy.get(".tooltip").contains("1 Stopped");
    });
  });

  context("Quota groups", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-task-healthy-with-quota",
        nodeHealth: true
      });
      cy.visitUrl({ url: "/services/overview" });
    });

    it("Shows no limit banner and badge if services have no quota enforced", function() {
      cy.get(".table-cell-link-primary")
        .contains("2_apps")
        .click();
      cy.get("#quota-no-limit-infobox")
        .contains(
          "1 service is not limited by quota. Update role to have quota enforced."
        )
        .should("exist");
      cy.get(".quota-no-limit")
        .contains("No Limit")
        .should("exist");
    });
  });
});
