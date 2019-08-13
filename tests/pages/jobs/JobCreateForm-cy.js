describe("Job Create Form", function() {
  function openTab(tab) {
    cy.get(".menu-tabbed-item-label")
      .contains(tab)
      .click();
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

  beforeEach(function() {
    cy.configureCluster({
      jobDetails: true,
      mesos: "1-for-each-health",
      nodeHealth: true
    });
    cy.visitUrl({ url: "/jobs/overview" });
  });

  context("Error badges for the jobs tabs", function() {
    beforeEach(function() {
      // Click 'Create a job'
      cy.get(".button.button-primary-link.button-narrow").click();

      // Wait for the 'New Job' dialog to appear
      cy.get(".modal-header")
        .contains("New Job")
        .should("exist");
    });

    context("General tab", function() {
      it("displays an error badge for the missing id", function() {
        // Fill-in the input elements
        cy.root()
          .get("label")
          .contains("Command Only")
          .click();
        cy.root()
          .getFormGroupInputFor("Command *")
          .type("while true; do echo 'test' ; sleep 100 ; done");

        // Try to submit the form
        submit();

        // Error banner lists errors
        cy.get(".errorsAlert-listItem").should(function($items) {
          expect($items.length).to.equal(1);
        });

        // Error badge appears
        getActiveTabErrorBadge()
          .contains("1")
          .should("be.visible");

        // Fix error
        cy.root()
          .getFormGroupInputFor("Job ID *")
          .type(`{selectall}${"simple"}`);

        // Error badge disappears
        getActiveTabErrorBadge().should("not.be.visible");
      });
    });

    context("Container Runtime tab", function() {
      it("displays an error badge for parameters", function() {
        openTab("Container Runtime");
        cy.get(".form-control-toggle")
          .contains("Docker Engine")
          .click();
        cy.get(".button-primary-link")
          .contains("Add Parameter")
          .click();
        typeInInput("key.0.dockerParams", " ");
        submit();
        getActiveTabErrorBadge()
          .contains("1")
          .should("exist");
        typeInInput("key.0.dockerParams", "{selectall}{backspace}");
        getActiveTabErrorBadge().should("not.exist");
      });
    });

    context("Schedule tab", function() {
      it("displays an error badge for missing schedule id", function() {
        openTab("Schedule");
        typeInInput("id.schedules", " ");
        submit();
        getActiveTabErrorBadge()
          .contains("2")
          .should("exist");
        typeInInput("id.schedules", "{selectall}{backspace}");
        getActiveTabErrorBadge().should("not.exist");
      });
    });

    context("Environment tab", function() {
      it("displays an error badge for environment variables", function() {
        openTab("Environment");
        cy.get(".button-primary-link")
          .contains("Add Environment Variable")
          .click();
        typeInInput("0.0.env", " ");
        submit();
        getActiveTabErrorBadge()
          .contains("1")
          .should("exist");
        typeInInput("0.0.env", "{selectall}{backspace}");
        getActiveTabErrorBadge().should("not.exist");
      });
    });

    context("Volumes tab", function() {
      it("displays an error badge for volume", function() {
        openTab("Volumes");
        cy.get(".button-primary-link")
          .contains("Add Volume")
          .click();
        typeInInput("containerPath.0.volumes", " ");
        submit();
        getActiveTabErrorBadge()
          .contains("2")
          .should("exist");
        typeInInput("containerPath.0.volumes", "{selectall}{backspace}");
        getActiveTabErrorBadge().should("not.exist");
      });
    });

    context("Placement tab", function() {
      it("displays an error badge for constraints", function() {
        openTab("Placement");
        cy.get(".button-primary-link")
          .contains("Add Placement Constraint")
          .click();
        typeInInput("attribute.0.placementConstraints", " ");
        submit();
        getActiveTabErrorBadge()
          .contains("2")
          .should("exist");
        typeInInput(
          "attribute.0.placementConstraints",
          "{selectall}{backspace}"
        );
        getActiveTabErrorBadge().should("not.exist");
      });
    });
  });
});
