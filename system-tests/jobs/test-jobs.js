const { Timeouts } = require("../_support/constants");

describe("Jobs", function() {
  afterEach(() => {
    cy.window().then(win => {
      win.location.href = "about:blank";
    });
  });

  it("creates a simple job", function() {
    const jobName = "job-with-inline-shell-script";
    const fullJobName = `${Cypress.env("TEST_UUID")}-${jobName}`;
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

    // Visit jobs
    cy.visitUrl("jobs/overview");

    // Click 'Create a job'
    // Note: The current group contains no jobs
    cy.contains("Create a Job").click();

    // Wait for the 'New Job' dialog to appear
    cy.get(".modal-header")
      .contains("New Job")
      .should("exist");

    // Fill-in the input elements
    cy.root()
      .getFormGroupInputFor("Job ID *")
      .type(`{selectall}${fullJobName}`);
    //
    // TODO: Due to a bug in cypress you cannot type values with dots
    // cy
    //   .root()
    //   .getFormGroupInputFor('CPUs')
    //   .type('{selectall}0.1');
    //
    cy.root()
      .getFormGroupInputFor("Mem (MiB) *")
      .type("{selectall}32");
    cy.root()
      .getFormGroupInputFor("Command *")
      .type(cmdline);

    // Click create job
    cy.contains("Submit").click();

    // Switch to the group that will contain the service
    cy.visitUrl(`jobs/overview/${Cypress.env("TEST_UUID")}`);

    // Wait for the table and the service to appear
    cy.get(".page-body-content table")
      .contains(jobName, { timeout: Timeouts.JOB_DEPLOYMENT_TIMEOUT })
      .get("a.table-cell-link-primary")
      .contains(`${jobName}`)
      .click();

    // open edit screen
    cy.get(".page-header-actions .dropdown")
      .click()
      .get(".dropdown-menu-items")
      .contains("Edit")
      .click();

    // Check the input elements
    cy.root()
      .getFormGroupInputFor("Job ID *")
      .should("have.value", `${fullJobName}`);

    cy.root()
      .getFormGroupInputFor("Mem (MiB) *")
      .should("have.value", "32");

    cy.root()
      .getFormGroupInputFor("Command *")
      .should("have.value", `${cmdline}`);
  });

  it("creates a job with default ucr config", function() {
    const jobName = "job-with-ucr-config";
    const fullJobName = `${Cypress.env("TEST_UUID")}-${jobName}`;
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

    // Visit jobs
    cy.visitUrl("jobs/overview");

    // Click 'Create a job'
    // Note: The current group contains the previous job
    cy.get(".button.button-primary-link.button-narrow").click();

    // Wait for the 'New Job' dialog to appear
    cy.get(".modal-header")
      .contains("New Job")
      .should("exist");

    // Fill-in the input elements
    cy.root()
      .getFormGroupInputFor("Job ID *")
      .type(`{selectall}${fullJobName}`);
    //
    // TODO: Due to a bug in cypress you cannot type values with dots
    // cy
    //   .root()
    //   .getFormGroupInputFor('CPUs')
    //   .type('{selectall}0.5');
    //
    cy.root()
      .getFormGroupInputFor("Mem (MiB) *")
      .type("{selectall}32");
    cy.root()
      .getFormGroupInputFor("Command *")
      .type(cmdline);

    // Select `Container Image` radio button
    cy.root()
      .get("label")
      .contains("Container Image")
      .click();

    // Fill-in image
    cy.root()
      .getFormGroupInputFor("Container Image *")
      .type("nginx");

    // Click crate job
    cy.contains("Submit").click();

    // Switch to the group that will contain the service
    cy.visitUrl(`jobs/overview/${Cypress.env("TEST_UUID")}`);

    // Wait for the table and the service to appear
    cy.get(".page-body-content table")
      .contains(jobName, { timeout: Timeouts.JOB_DEPLOYMENT_TIMEOUT })
      .get("a.table-cell-link-primary")
      .contains(`${jobName}`)
      .click();

    // open edit screen
    cy.get(".page-header-actions .dropdown")
      .click()
      .get(".dropdown-menu-items")
      .contains("Edit")
      .click();

    // Fill-in the input elements
    cy.root()
      .getFormGroupInputFor("Job ID *")
      .should("have.value", `${fullJobName}`);
    //
    // TODO: Due to a bug in cypress you cannot type values with dots
    // cy
    //   .root()
    //   .getFormGroupInputFor('CPUs')
    //   .type('{selectall}0.5');
    //
    cy.root()
      .getFormGroupInputFor("Mem (MiB) *")
      .should("have.value", "32");
    cy.root()
      .getFormGroupInputFor("Command")
      .should("have.value", `${cmdline}`);

    // Fill-in image
    cy.root()
      .getFormGroupInputFor("Container Image *")
      .should("have.value", "nginx");
  });

  it("runs, stops and deletes a job", function() {
    // first create a simple job
    const jobName = "job-to-delete";
    const fullJobName = `${Cypress.env("TEST_UUID")}-${jobName}`;
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

    // Visit jobs
    cy.visitUrl("jobs/overview");
    cy.get(".button.button-primary-link.button-narrow").click();
    cy.get(".modal-header")
      .contains("New Job")
      .should("exist");

    // Fill-in the input elements
    cy.root()
      .getFormGroupInputFor("Job ID *")
      .type(`{selectall}${fullJobName}`);
    cy.root()
      .getFormGroupInputFor("Command *")
      .type(cmdline);

    // Click create job
    cy.contains("Submit").click();

    // Switch to the group that will contain the service
    cy.visitUrl(`jobs/overview/${Cypress.env("TEST_UUID")}`);

    // Wait for the table and the service to appear
    cy.get(".page-body-content table")
      .contains(jobName, { timeout: Timeouts.JOB_DEPLOYMENT_TIMEOUT })
      .get("a.table-cell-link-primary")
      .contains(`${jobName}`)
      .click();

    // open edit screen
    cy.get(".page-header-actions .dropdown")
      .click()
      .get(".dropdown-menu-items")
      .contains("Delete")
      .click();

    // click delete
    cy.get(".modal .button-danger")
      .contains("Delete Job")
      .click();

    // Switch to the group that will contain the service
    cy.visitUrl(`jobs/overview/${Cypress.env("TEST_UUID")}`);

    // The job should no longer be in the table
    cy.get(".page-body-content table")
      .contains(jobName)
      .should("not.exist");
  });
});
