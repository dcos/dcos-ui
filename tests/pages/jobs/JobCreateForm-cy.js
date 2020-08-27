describe("Job Create Form", () => {
  function openTab(tab) {
    cy.get(".menu-tabbed-item-label").contains(tab).click();
  }

  function submit() {
    cy.contains("Submit").click();
  }

  function typeInInput(inputName, text) {
    cy.get(".create-service-modal-form")
      .find('.form-control[name="' + inputName + '"]')
      .type(text);
  }

  function getActiveTabErrorBadge() {
    return cy.get('.active > .menu-tabbed-item-label span[role="button"]');
  }

  beforeEach(() => {
    cy.configureCluster({
      jobDetails: true,
      mesos: "1-for-each-health",
      nodeHealth: true,
    });
    cy.visitUrl({ url: "/jobs/overview" });
  });

  context("Error badges for the jobs tabs", () => {
    beforeEach(() => {
      // Click 'Create a job'
      cy.get(".button.button-primary-link.button-narrow").click();

      // Wait for the 'New Job' dialog to appear
      cy.get(".modal-header").contains("New Job");
    });

    context("General tab", () => {
      it("displays an error badge for the missing id", () => {
        // Fill-in the input elements
        cy.root().get("label").contains("Command Only").click();
        cy.root()
          .getFormGroupInputFor("Command *")
          .type("while true; do echo 'test' ; sleep 100 ; done");

        // Try to submit the form
        submit();

        // Error banner lists errors
        cy.get(".errorsAlert-listItem").should(($items) => {
          expect($items.length).to.equal(1);
        });

        // Error badge appears
        getActiveTabErrorBadge().contains("1");

        // Fix error
        cy.root()
          .getFormGroupInputFor("Job ID *")
          .type(`{selectall}${"simple"}`);

        // Error badge disappears
        getActiveTabErrorBadge().should("not.be.visible");
      });
    });

    context("Container Runtime tab", () => {
      it("displays an error badge for parameters", () => {
        openTab("Container Runtime");
        cy.get(".form-control-toggle").contains("Docker Engine").click();
        cy.get(".button-primary-link").contains("Add Parameter").click();
        typeInInput("key.0.dockerParams", " ");
        submit();
        getActiveTabErrorBadge().contains("1");
        typeInInput("key.0.dockerParams", "{selectall}{backspace}");
        getActiveTabErrorBadge().should("not.exist");
      });
    });

    context("Schedule tab", () => {
      it("displays an error badge for missing schedule id", () => {
        openTab("Schedule");
        typeInInput("id.schedules", " ");
        submit();
        getActiveTabErrorBadge().contains("2");
        typeInInput("id.schedules", "{selectall}{backspace}");
        getActiveTabErrorBadge().should("not.exist");
      });
    });

    context("Environment tab", () => {
      it("displays an error badge for environment variables", () => {
        openTab("Environment");
        cy.get(".button-primary-link")
          .contains("Add Environment Variable")
          .click();
        typeInInput("0.0.env", " ");
        submit();
        getActiveTabErrorBadge().contains("1");
        typeInInput("0.0.env", "{selectall}{backspace}");
        getActiveTabErrorBadge().should("not.exist");
      });
    });

    context("Volumes tab", () => {
      it("displays an error badge for volume", () => {
        openTab("Volumes");
        cy.get(".button-primary-link").contains("Add Volume").click();
        typeInInput("containerPath.0.volumes", " ");
        submit();
        getActiveTabErrorBadge().contains("2");
        typeInInput("containerPath.0.volumes", "{selectall}{backspace}");
        getActiveTabErrorBadge().should("not.exist");
      });
    });

    context("Placement tab", () => {
      it("displays an error badge for constraints", () => {
        openTab("Placement");
        cy.get(".button-primary-link")
          .contains("Add Placement Constraint")
          .click();
        typeInInput("attribute.0.placementConstraints", " ");
        submit();
        getActiveTabErrorBadge().contains("2");
        typeInInput(
          "attribute.0.placementConstraints",
          "{selectall}{backspace}"
        );
        getActiveTabErrorBadge().should("not.exist");
      });
    });
  });
});
