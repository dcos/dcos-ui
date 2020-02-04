const nameError =
  "Name must be at least 1 character and may only contain digits (0-9), dashes (-), dots (.), and lowercase letters (a-z). The name may not begin or end with a dash or dot.";
const groupNameError =
  "Group name must be at least 1 character and may only contain digits (0-9), dashes (-), dots (.), and lowercase letters (a-z). The name may not begin or end with a dash or dot.";

describe("Group Modals", () => {
  function openDropdown(serviceName) {
    cy.get(".filter-input-text").type(serviceName); // filter to find the correct service
    cy.get(".form-control-group-add-on")
      .eq(-1)
      .click(); // close filter window
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

  function getInput(id) {
    return cy.get(".form-group").find('.form-control[name="' + id + '"]');
  }

  context("Fullscreen group modal", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-sdk-service",
        nodeHealth: true
      });

      cy.visitUrl({ url: "/services/overview" });

      cy.get(".page-header-actions [data-cy='primaryDropdownButton']")
        .contains("New")
        .click();
      cy.get("[data-cy='PopoverListItem']")
        .contains("Create Group")
        .click();
    });

    it("displays proper errors ", () => {
      cy.get(".form-group")
        .find('.form-control[name="id"]')
        .as("idInput");

      cy.get(".modal-full-screen-actions-primary")
        .contains("Create")
        .as("submit");

      cy.log("group name starting with a dot");

      cy.get("@idInput").type(".test");
      cy.get("@submit").click();
      cy.get(".errorsAlert-list").contains(groupNameError);
      cy.get(".form-control-feedback").contains(nameError);

      cy.log("displays an error for a group name ending with a dot");
      cy.get("@idInput").retype("test.");
      cy.get("@submit").click();
      cy.get(".form-control-feedback").contains(nameError);

      cy.log("displays an error for a group name starting with a dash");
      cy.get("@idInput").retype("-test");
      cy.get("@submit").click();
      cy.get(".form-control-feedback").contains(nameError);

      cy.log("displays an error for a group name ending with a dash");
      cy.get("@idInput").retype("test-");
      cy.get("@submit").click();
      cy.get(".form-control-feedback").contains(nameError);

      cy.log("displays an error for a group name containing unallowed symbols");
      cy.get("@idInput").retype(".te$t");
      cy.get("@submit").click();
      cy.get(".form-control-feedback").contains(nameError);

      cy.get("@idInput").retype("test");
      cy.get("@submit").click();
      cy.get(".form-control-feedback").should("not.contain", nameError);
    });

    context("Create modal", () => {
      it("displays the fullscreen modal when visiting the url", () => {
        cy.visitUrl({ url: "/services/overview/create_group" });
        cy.get(".modal-full-screen");
      });

      it("has a reasonable acting fullscreen modal for top level groups", () => {
        cy.get(".modal-full-screen");

        cy.log("displays a header");
        cy.get(".modal-full-screen-header-title").contains("New Group");

        cy.log("displays a General section");
        cy.get("h1").contains("General");

        cy.log("displays a name label input");
        cy.get(".form-group-heading-content").contains("Name");
        cy.get(".form-group-heading-content")
          .contains("Name")
          .siblings()
          .eq(0) // First sibling.
          .contains("*");
        getInput("id");
        getInput("id").type("group-name");
        getInput("id").should("have.value", "group-name");

        cy.log("displays a path");
        cy.get(".form-group-heading-content").contains("Path");
        cy.get("div").contains("/");
        getInput("id").type("group-name");
        cy.get("div").contains("/group-name");

        cy.log("displays a Quota section");
        cy.get(".form-group-heading-content").contains("Quota");

        cy.log("displays a CPUs label and input");
        cy.get(".form-group-heading-content").contains("CPUs");
        getInput("quota.cpus");
        getInput("quota.cpus").type("1");
        getInput("quota.cpus").should("have.value", "1");

        cy.log("displays a Memory label and input");
        cy.get(".form-group-heading-content").contains("Mem (MiB)");
        getInput("quota.mem");
        getInput("quota.mem").type("10");
        getInput("quota.mem").should("have.value", "10");

        cy.log("displays a Disk label and input");
        cy.get(".form-group-heading-content").contains("Disk (MiB)");
        getInput("quota.disk");
        getInput("quota.disk").type("5");
        getInput("quota.disk").should("have.value", "5");

        cy.log("displays a GPUs label and input");
        cy.get(".form-group-heading-content").contains("GPUs");
        getInput("quota.gpus");
        getInput("quota.gpus").type("0.5");
        getInput("quota.gpus").should("have.value", "0.5");

        cy.log("displays advanced settings");
        cy.get(".advanced-section-label").contains("Advanced Settings");

        cy.log("shows and hides the advanced settings");
        cy.get(".advanced-section-content").should("not.exist");
        cy.get(".advanced-section-label")
          .contains("Advanced Settings")
          .click();
        cy.get(".advanced-section-content");
        cy.get(".advanced-section-label")
          .contains("Advanced Settings")
          .click();
        cy.get(".advanced-section-content").should("not.exist");

        cy.log("shows role enforcement labels and checkboxes");
        cy.get(".advanced-section-label")
          .contains("Advanced Settings")
          .click();
        cy.get(".form-group-heading-content").contains("Role Enforcement");
        cy.get(".form-control-toggle").contains("Use Group Role");
        cy.get(".form-control-toggle").contains("Recommended");
        cy.get(".form-control-toggle").contains(
          "Allows Quota to be enforced on all the services in the group."
        );
        cy.get(".form-control-toggle").contains("Use Legacy Role");
        cy.get(".form-control-toggle").contains(
          "Will not enforce quota on all services in the group."
        );
      });

      it("fails to submit", () => {
        const submit = () => {
          cy.get(".button-primary")
            .contains("Create")
            .click();
        };
        const msgContains = msg => cy.get(".errorsAlert-message").contains(msg);
        const hintContains = msg =>
          cy.get(".form-control-feedback").contains(msg);

        cy.log("if name is invalid");
        getInput("id").retype(".");
        submit();
        cy.get(".errorsAlert-message").as("msg");
        msgContains("An error occurred with your configuration.");
        msgContains(groupNameError);
        hintContains(nameError);

        cy.log("fails to submit if CPUs value is invalid");
        getInput("quota.cpus").retype("-1");
        submit();
        msgContains("CPU must be bigger than or equal to 0");
        hintContains("Must be bigger than or equal to 0");

        getInput("quota.cpus").retype("a");
        submit();
        msgContains("CPU must be a number");
        hintContains("Must be a number");
        getInput("quota.cpus").clear();

        cy.log("fails to submit if memory value is invalid");
        getInput("quota.mem").retype("-1");
        submit();
        msgContains("Mem must be bigger than or equal to 0");
        hintContains("Must be bigger than or equal to 0");
        getInput("quota.mem").retype("a");
        submit();
        msgContains("Mem must be a number");
        hintContains("Must be a number");
        getInput("quota.mem").clear();

        cy.log("fails to submit if disk value is invalid");
        getInput("quota.disk").retype("-1");
        submit();
        msgContains("An error occurred with your configuration.");
        msgContains("Disk must be bigger than or equal to 0");
        hintContains("Must be bigger than or equal to 0");

        getInput("quota.disk").retype("a");
        submit();
        msgContains("An error occurred with your configuration.");
        msgContains("Disk must be a number");
        hintContains("Must be a number");
        getInput("quota.disk").clear();

        cy.log("fails to submit if GPUs value is invalid");
        getInput("quota.gpus").retype("-1");
        submit();
        msgContains("An error occurred with your configuration.");
        msgContains("GPU must be bigger than or equal to 0");
        hintContains("Must be bigger than or equal to 0");

        getInput("quota.gpus").retype("a");
        submit();
        msgContains("An error occurred with your configuration.");
        msgContains("GPU must be a number");
        hintContains("Must be a number");
        getInput("quota.gpus").clear();

        cy.log(
          "fails to create a group for a user with insufficient permissions"
        );
        getInput("id").retype("group-name");
        getInput("quota.cpus").retype("1");
        getInput("quota.mem").retype("10");
        getInput("quota.disk").retype("5");
        getInput("quota.gpus").retype("0.5");

        submit();

        msgContains("An error occurred with your configuration.");
      });
    });

    context("Edit modal", () => {
      beforeEach(() => {
        cy.visitUrl({ url: "/services/overview" });
        openDropdown("services");
      });

      it("shows and does meaningful things ", () => {
        cy.log("an edit action for top-level groups");
        cy.get(".dropdown-menu-items li").contains("Edit");

        clickDropdownAction("Edit");

        cy.log("modal shows correct title");
        cy.get(".modal-full-screen-header-title").contains("Edit Group");

        cy.log("shows the correct id and the input is disabled");
        getInput("id")
          .should("have.attr", "value", "/services")
          .should("have.attr", "disabled");

        cy.log("shows the correct path");
        cy.get("div").contains("/services");

        cy.log("shows the correct Quota inputs");
        getInput("quota.cpus");
        getInput("quota.mem");
        getInput("quota.disk");
        getInput("quota.gpus");

        cy.log("allows Quota values to be changed");
        getInput("quota.cpus").should("have.attr", "value", "");
        getInput("quota.cpus").type("1");
        getInput("quota.cpus").should("have.attr", "value", "1");
      });
    });

    it("opens the edit modal from group detail page", () => {
      cy.visitUrl({ url: "/services/overview" });
      cy.get(".table-cell-link-primary")
        .contains("services")
        .click();

      cy.get(".page-header-actions button.button-narrow").click();
      cy.get("li.is-selectable")
        .contains("Edit Group")
        .click();
      cy.get(".modal-full-screen-header-title").contains("Edit Group");
    });

    it("does not have an edit action for root level", () => {
      cy.visitUrl({ url: "/services/overview" });
      cy.get(".page-header-actions button.button-narrow").should("not.exist");
    });

    it("does not have an edit action for non-top-level groups", () => {
      cy.visitUrl({ url: "/services/overview" });
      cy.get(".table-cell-link-primary")
        .contains("services")
        .click();
      cy.get(".table-cell-link-primary")
        .contains("services2")
        .click();
      cy.get("button.button-narrow").should("not.exist");
    });
  });

  context("Group creation", () => {
    it("closes modal on successful creation", () => {
      cy.configureCluster({
        mesos: "1-sdk-service",
        nodeHealth: true,
        groups: {
          marathonCreate: "create-success",
          mesosQuotaUpdate: "updateQuotaSuccess"
        }
      });

      cy.visitUrl({ url: "/services/overview" });

      cy.get(".page-header-actions [data-cy='primaryDropdownButton']")
        .contains("New")
        .click();
      cy.get("[data-cy='PopoverListItem']")
        .contains("Create Group")
        .click();

      cy.get(".modal-full-screen");

      getInput("id").type("test");
      getInput("quota.cpus").type("1");

      cy.get(".modal-full-screen-actions-primary")
        .contains("Create")
        .click();

      cy.wait("@updateQuota");

      cy.get(".modal-full-screen").should("not.exist");
    });

    it("displays an error if group exists", () => {
      cy.configureCluster({
        mesos: "1-sdk-service",
        nodeHealth: true,
        groups: {
          marathonCreate: "create-conflict",
          marathonCreateStatus: 409
        }
      });

      cy.visitUrl({ url: "/services/overview" });

      cy.get(".page-header-actions [data-cy='primaryDropdownButton']")
        .contains("New")
        .click();
      cy.get("[data-cy='PopoverListItem']")
        .contains("Create Group")
        .click();

      cy.get(".modal-full-screen");

      getInput("id").type("test");

      cy.get(".modal-full-screen-actions-primary")
        .contains("Create")
        .click();

      cy.wait("@createGroup");

      cy.get(".form-control-feedback").contains(
        "Name already exists. Try a different name."
      );

      cy.get(".errorsAlert-list").contains(
        "A group with the same name already exists. Try a different name."
      );
    });

    it("displays a generic error if group create fails", () => {
      cy.configureCluster({
        mesos: "1-sdk-service",
        nodeHealth: true,
        groups: {
          marathonCreate: "create-invalid",
          marathonCreateStatus: 422
        }
      });

      cy.visitUrl({ url: "/services/overview" });

      cy.get(".page-header-actions [data-cy='primaryDropdownButton']")
        .contains("New")
        .click();
      cy.get("[data-cy='PopoverListItem']")
        .contains("Create Group")
        .click();

      cy.get(".modal-full-screen");

      getInput("id").type("test");

      cy.get(".modal-full-screen-actions-primary")
        .contains("Create")
        .click();

      cy.wait("@createGroup");

      cy.get(".errorsAlert-list").contains("Unable to create group:");
    });

    it("changes to edit mode if quota update fails", () => {
      cy.configureCluster({
        mesos: "1-sdk-service",
        nodeHealth: true,
        groups: {
          marathonCreate: "create-success",
          mesosQuotaUpdate: "updateQuotaFailed",
          mesosQuotaUpdateStatus: 400
        }
      });

      cy.visitUrl({ url: "/services/overview" });

      cy.get(".page-header-actions [data-cy='primaryDropdownButton']")
        .contains("New")
        .click();
      cy.get("[data-cy='PopoverListItem']")
        .contains("Create Group")
        .click();

      cy.get(".modal-full-screen");

      getInput("id").type("test");
      getInput("quota.cpus").type("1");

      cy.get(".modal-full-screen-actions-primary")
        .contains("Create")
        .click();

      cy.wait("@updateQuota");

      cy.get(".errorsAlert-list").contains("Unable to update group's quota:");

      // Changes title.
      cy.get(".modal-full-screen-header-title").contains("Edit Group");

      getInput("id")
        .should("have.attr", "value", "/test")
        .should("have.attr", "disabled");
    });
  });

  context("Group Edit", () => {
    it("closes modal on successful creation", () => {
      cy.configureCluster({
        mesos: "1-sdk-service",
        nodeHealth: true,
        groups: {
          marathonEdit: "create-success",
          mesosQuotaUpdate: "updateQuotaSuccess"
        }
      });

      cy.visitUrl({ url: "/services/overview" });

      openDropdown("s");
      clickDropdownAction("Edit");

      // Shows correct title.
      cy.get(".modal-full-screen-header-title")
        .contains("Edit Group")
        .should("exist");

      getInput("quota.cpus").type("1.0");
      getInput("quota.mem").type("2048");

      cy.get(".modal-full-screen-actions-primary")
        .contains("Update")
        .click();

      cy.wait("@updateQuota");

      cy.get(".modal-full-screen").should("not.exist");
    });

    it("shows force update if mesos returns overcommit error", () => {
      cy.configureCluster({
        mesos: "1-sdk-service",
        nodeHealth: true,
        groups: {
          marathonEdit: "create-success",
          mesosQuotaUpdate: "updateQuotaOvercommit",
          mesosQuotaUpdateStatus: 400
        }
      });

      cy.visitUrl({ url: "/services/overview" });

      openDropdown("s");
      clickDropdownAction("Edit");

      // Shows correct title.
      cy.get(".modal-full-screen-header-title")
        .contains("Edit Group")
        .should("exist");

      getInput("quota.cpus").type("1.0");
      getInput("quota.mem").type("2048");

      cy.get(".modal-full-screen-actions-primary")
        .contains("Update")
        .click();

      cy.wait("@updateQuota");

      cy.get(".errorsAlert-list").should("exist");

      cy.get(".modal-full-screen-actions-primary")
        .contains("Force Update")
        .should("exist");
    });
  });

  context("Small group modal", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-sdk-service",
        nodeHealth: true
      });

      cy.visitUrl({ url: "/services/overview" });
      cy.get(".table-cell-link-primary")
        .contains("services")
        .click();
    });
    it("displays a small group modal for non-top-level groups", () => {
      cy.get(".page-header-actions [data-cy='primaryDropdownButton']")
        .contains("New")
        .click();
      cy.get("[data-cy='PopoverListItem']")
        .contains("Create Group")
        .click();

      cy.get(".modal-small");
      cy.get(".modal-full-screen").should("not.exist");
    });

    it("does not show the edit action for non-top-level groups", () => {
      openDropdown("services2");
      cy.get(".dropdown-menu-items li")
        .contains("Edit")
        .should("not.exist");
    });
  });
});
