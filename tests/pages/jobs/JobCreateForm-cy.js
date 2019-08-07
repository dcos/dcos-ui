describe("Job Create Form", function() {
  beforeEach(function() {
    cy.configureCluster({
      jobDetails: true,
      mesos: "1-for-each-health",
      nodeHealth: true
    });
    cy.visitUrl({ url: "/jobs/overview" });
  });

  it("displays an error badge for the Services tab", function() {
    const jobName = "simple";
    const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;

    // Click 'Create a job'
    // Note: The current group contains the previous job
    cy.get(".button.button-primary-link.button-narrow").click();

    // Wait for the 'New Job' dialog to appear
    cy.get(".modal-header")
      .contains("New Job")
      .should("exist");

    // Fill-in the input elements
    cy.root()
      .getFormGroupInputFor("CPUs *")
      .type("{selectall}0.1");

    cy.root()
      .getFormGroupInputFor("Mem (MiB) *")
      .type("{selectall}32");

    cy.root()
      .get("label")
      .contains("Command Only")
      .click();
    cy.root()
      .getFormGroupInputFor("Command *")
      .type("while true; do echo 'test' ; sleep 100 ; done");

    // Try to submit the form
    cy.contains("Submit").click();

    // Error banner lists errors
    cy.get(".errorsAlert-listItem").should(function($items) {
      expect($items.length).to.equal(1);
    });

    // Error badge appears
    cy.get('.active > .menu-tabbed-item-label span[role="button"]')
      .contains("1")
      .should("be.visible");

    // Fix error
    cy.root()
      .getFormGroupInputFor("Job ID *")
      .type(`{selectall}${fullJobName}`);

    // Error badge disappears
    cy.get('.active > .menu-tabbed-item-label span[role="button"]').should(
      "not.be.visible"
    );
  });
});
