const { Timeouts } = require("../_support/constants");

describe("Jobs", function() {
  afterEach(() => {
    cy.window().then(win => {
      win.location.href = "about:blank";
    });
  });

  it("creates a simple job", function() {
    const jobName = "job-with-inline-shell-script";
    const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;
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
      .getFormGroupInputFor("ID *")
      .type(`{selectall}${fullJobName}`);
    //
    // TODO: Due to a bug in cypress you cannot type values with dots
    // cy
    //   .root()
    //   .getFormGroupInputFor('CPUs')
    //   .type('{selectall}0.1');
    //
    cy.root()
      .getFormGroupInputFor("Mem (MiB)")
      .type("{selectall}32");
    cy.root()
      .getFormGroupInputFor("Command")
      .type(cmdline);

    // Click create job
    cy.contains("Create Job").click();

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
      .getFormGroupInputFor("ID *")
      .should("have.value", `${fullJobName}`);

    cy.root()
      .getFormGroupInputFor("Mem (MiB)")
      .should("have.value", "32");

    cy.root()
      .getFormGroupInputFor("Command")
      .contains(`${cmdline}`);
  });

  it("creates a job with docker config", function() {
    const jobName = "job-with-docker-config";
    const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;
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
      .getFormGroupInputFor("ID *")
      .type(`{selectall}${fullJobName}`);
    //
    // TODO: Due to a bug in cypress you cannot type values with dots
    // cy
    //   .root()
    //   .getFormGroupInputFor('CPUs')
    //   .type('{selectall}0.5');
    //
    cy.root()
      .getFormGroupInputFor("Mem (MiB)")
      .type("{selectall}32");
    cy.root()
      .getFormGroupInputFor("Command")
      .type(cmdline);

    // Select `Docker Container`
    cy.root()
      .get(".multiple-form-modal-sidebar-menu-item")
      .contains("Docker Container")
      .click();

    // Fill-in image
    cy.root()
      .getFormGroupInputFor("Image")
      .type("python:3");

    // Click crate job
    cy.contains("Create Job").click();

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
      .getFormGroupInputFor("ID *")
      .should("have.value", `${fullJobName}`);
    //
    // TODO: Due to a bug in cypress you cannot type values with dots
    // cy
    //   .root()
    //   .getFormGroupInputFor('CPUs')
    //   .type('{selectall}0.5');
    //
    cy.root()
      .getFormGroupInputFor("Mem (MiB)")
      .should("have.value", "32");
    cy.root()
      .getFormGroupInputFor("Command")
      .contains(cmdline);

    // Select `Docker Container`
    cy.root()
      .get(".multiple-form-modal-sidebar-menu-item")
      .contains("Docker Container")
      .click();

    // Fill-in image
    cy.root()
      .getFormGroupInputFor("Image")
      .should("have.value", "python:3");
  });

  it("creates a job with labels", function() {
    const jobName = "job-with-labels";
    const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

    // Visit jobs
    cy.visitUrl("jobs/overview");

    // Click 'Create a job'
    // Note: The current group contains the previous jobs
    cy.get(".button.button-primary-link.button-narrow").click();

    // Wait for the 'New Job' dialog to appear
    // Note: The current group contains the previous two jobs
    cy.get(".modal-header")
      .contains("New Job")
      .should("exist");

    // Fill-in the input elements
    cy.root()
      .getFormGroupInputFor("ID *")
      .type(`{selectall}${fullJobName}`);
    //
    // TODO: Due to a bug in cypress you cannot type values with dots
    // cy
    //   .root()
    //   .getFormGroupInputFor('CPUs')
    //   .type('{selectall}0.5');
    //
    cy.root()
      .getFormGroupInputFor("Mem (MiB)")
      .type("{selectall}32");
    cy.root()
      .getFormGroupInputFor("Command")
      .type(cmdline);

    // Select `Labels`
    cy.root()
      .get(".multiple-form-modal-sidebar-menu-item")
      .contains("Labels")
      .click();

    // Fill-in the first label
    cy.root()
      .getFormGroupInputFor("Label Name")
      .eq(0)
      .type("camelCase");
    cy.root()
      .getFormGroupInputFor("Label Value")
      .eq(0)
      .type("test");

    // Add an additional label
    cy.get(".clickable")
      .contains("Add Label")
      .click({ force: true });

    // Fill-in the second label
    cy.root()
      .getFormGroupInputFor("Label Name")
      .eq(1)
      .type("snake_case");
    cy.root()
      .getFormGroupInputFor("Label Value")
      .eq(1)
      .type("test");

    // Add an additional label
    cy.get(".clickable")
      .contains("Add Label")
      .click({ force: true });

    // Fill-in the third label
    cy.root()
      .getFormGroupInputFor("Label Name")
      .eq(2)
      .type("lowercase");
    cy.root()
      .getFormGroupInputFor("Label Value")
      .eq(2)
      .type("test");

    // Add an additional label
    cy.get(".clickable")
      .contains("Add Label")
      .click({ force: true });

    // Fill-in the fourth label
    cy.root()
      .getFormGroupInputFor("Label Name")
      .eq(3)
      .type("UPPERCASE");
    cy.root()
      .getFormGroupInputFor("Label Value")
      .eq(3)
      .type("test");

    // Click crate job
    cy.contains("Create Job").click();

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
      .getFormGroupInputFor("ID *")
      .should("have.value", `${fullJobName}`);
    cy.root()
      .getFormGroupInputFor("Mem (MiB)")
      .should("have.value", "32");
    cy.root()
      .getFormGroupInputFor("Command")
      .contains(cmdline);

    // Select `Labels`
    cy.root()
      .get(".multiple-form-modal-sidebar-menu-item")
      .contains("Labels")
      .click();

    // Fill-in the first label
    cy.root()
      .getFormGroupInputFor("Label Name")
      .eq(0)
      .should("have.value", "camelCase");
    cy.root()
      .getFormGroupInputFor("Label Value")
      .eq(0)
      .should("have.value", "test");

    // Fill-in the second label
    cy.root()
      .getFormGroupInputFor("Label Name")
      .eq(1)
      .should("have.value", "snake_case");
    cy.root()
      .getFormGroupInputFor("Label Value")
      .eq(1)
      .should("have.value", "test");

    // Fill-in the third label
    cy.root()
      .getFormGroupInputFor("Label Name")
      .eq(2)
      .should("have.value", "lowercase");
    cy.root()
      .getFormGroupInputFor("Label Value")
      .eq(2)
      .should("have.value", "test");

    // Fill-in the fourth label
    cy.root()
      .getFormGroupInputFor("Label Name")
      .eq(3)
      .should("have.value", "UPPERCASE");
    cy.root()
      .getFormGroupInputFor("Label Value")
      .eq(3)
      .should("have.value", "test");
  });

  it("creates a job with schedule", function() {
    const jobName = "job-with-schedule";
    const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

    // Visit jobs
    cy.visitUrl("jobs/overview");

    // Click 'Create a job'
    // Note: The current group contains the previous jobs
    cy.get(".button.button-primary-link.button-narrow").click();

    // Wait for the 'New Job' dialog to appear
    cy.get(".modal-header")
      .contains("New Job")
      .should("exist");

    // Fill-in the input elements
    cy.root()
      .getFormGroupInputFor("ID *")
      .type(`{selectall}${fullJobName}`);
    //
    // TODO: Due to a bug in cypress you cannot type values with dots
    // cy
    //   .root()
    //   .getFormGroupInputFor('CPUs')
    //   .type('{selectall}0.1');
    //
    cy.root()
      .getFormGroupInputFor("Mem (MiB)")
      .type("{selectall}32");
    cy.root()
      .getFormGroupInputFor("Command")
      .type(cmdline);

    // Select `Schedule`
    cy.root()
      .get(".multiple-form-modal-sidebar-menu-item")
      .contains("Schedule")
      .click();

    // Check 'Run on a schedule'
    cy.contains("Run on a schedule").click();

    // Specify a schedule
    cy.root()
      .getFormGroupInputFor("Cron Schedule *")
      .type("* * * * *");

    // Enable schedule
    cy.contains("Enable").click();

    // Click crate job
    cy.contains("Create Job").click();

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
      .getFormGroupInputFor("ID *")
      .should("have.value", `${fullJobName}`);
    //
    // TODO: Due to a bug in cypress you cannot type values with dots
    // cy
    //   .root()
    //   .getFormGroupInputFor('CPUs')
    //   .type('{selectall}0.1');
    //
    cy.root()
      .getFormGroupInputFor("Mem (MiB)")
      .should("have.value", "32");
    cy.root()
      .getFormGroupInputFor("Command")
      .contains(cmdline);

    // Select `Schedule`
    cy.root()
      .get(".multiple-form-modal-sidebar-menu-item")
      .contains("Schedule")
      .click();

    cy.root()
      .getFormGroupInputFor("Cron Schedule *")
      .should("have.value", "* * * * *");
  });

  it("runs, stops and deletes a job", function() {
    // first create a simple job
    const jobName = "job-to-delete";
    const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

    // Visit jobs
    cy.visitUrl("jobs/overview");
    cy.get(".button.button-primary-link.button-narrow").click();
    cy.get(".modal-header")
      .contains("New Job")
      .should("exist");

    // Fill-in the input elements
    cy.root()
      .getFormGroupInputFor("ID *")
      .type(`{selectall}${fullJobName}`);
    cy.root()
      .getFormGroupInputFor("Command")
      .type(cmdline);

    // Click create job
    cy.contains("Create Job").click();

    // Switch to the group that will contain the service
    cy.visitUrl(`jobs/overview/${Cypress.env("TEST_UUID")}`);

    // Wait for the table and the service to appear
    cy.get(".page-body-content table")
      .contains(jobName, { timeout: Timeouts.JOB_DEPLOYMENT_TIMEOUT })
      .get("a.table-cell-link-primary")
      .contains(`${jobName}`)
      .click();

    // run job
    cy.get(".page-header-actions .dropdown").click();
    cy.get(".dropdown-menu-items")
      .contains("Run Now")
      .click();
    cy.wait(10000); // wait 10 seconds
    cy.get(".table-virtual-list")
      .contains("Running")
      .should("exist");

    // stop job
    cy.get(".table-virtual-list")
      .children()
      .get(".form-control-toggle-indicator")
      .should("exist");
    cy.get(".table-virtual-list")
      .children()
      .get(".form-control-toggle-indicator")
      .click();
    cy.get(".button-danger")
      .contains("Stop")
      .click();
    cy.get(".button-danger")
      .contains("Stop Job Run")
      .should("exist");
    cy.get(".button-danger")
      .contains("Stop Job Run")
      .click();
    cy.get(".table-virtual-list")
      .contains("Failed")
      .should("exist");

    // open delete screen
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
