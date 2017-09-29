const { Timeouts } = require("../_support/constants");

describe("Jobs", function() {
  afterEach(() => {
    cy.window().then(win => {
      win.location.href = "about:blank";
    });
  });

  it("should create a simple job", function() {
    const jobName = "job-with-inline-shell-script";
    const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

    // Visit jobs
    cy.visitUrl("jobs/overview");

    // Click 'Create a job'
    // Note: The current group contains no jobs
    cy.contains("Create a Job").click();

    // Wait for the 'New Job' dialog to appear
    cy.get(".modal-header").contains("New Job").should("exist");

    // Fill-in the input elements
    cy.root().getFormGroupInputFor("ID *").type(`{selectall}${fullJobName}`);
    //
    // TODO: Due to a bug in cypress you cannot type values with dots
    // cy
    //   .root()
    //   .getFormGroupInputFor('CPUs')
    //   .type('{selectall}0.1');
    //
    cy.root().getFormGroupInputFor("Mem (MiB)").type("{selectall}32");
    cy.root().getFormGroupInputFor("Command").type(cmdline);

    // Check JSON mode
    cy.contains("JSON mode").click();

    // Check contents of the JSON editor
    cy.get("#brace-editor").contents().asJson().should("deep.equal", [
      {
        id: fullJobName,
        run: {
          cpus: 0.01,
          mem: 32,
          disk: 0,
          cmd: cmdline
        },
        schedules: []
      }
    ]);

    // Click crate job
    cy.contains("Create Job").click();

    // Switch to the group that will contain the service
    cy.visitUrl(`jobs/overview/${Cypress.env("TEST_UUID")}`);

    // Wait for the table and the service to appear
    cy
      .get(".page-body-content table")
      .contains(jobName, { timeout: Timeouts.JOB_DEPLOYMENT_TIMEOUT })
      .get("a.table-cell-link-primary")
      .contains(`${jobName}`)
      .click();

    // open edit screen
    cy
      .get(".page-header-actions .dropdown")
      .click()
      .get(".dropdown-menu-items")
      .contains("Edit")
      .click();

    // Check the input elements
    cy
      .root()
      .getFormGroupInputFor("ID *")
      .should("have.value", `${fullJobName}`);

    cy.root().getFormGroupInputFor("Mem (MiB)").should("have.value", "32");

    cy.root().getFormGroupInputFor("Command").contains(`${cmdline}`);
  });

  it("should create a job with docker config", function() {
    const jobName = "job-with-docker-config";
    const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

    // Visit jobs
    cy.visitUrl("jobs/overview");

    // Click 'Create a job'
    // Note: The current group contains the previous job
    cy.get(".button.button-link.button-narrow").click();

    // Wait for the 'New Job' dialog to appear
    cy.get(".modal-header").contains("New Job").should("exist");

    // Fill-in the input elements
    cy.root().getFormGroupInputFor("ID *").type(`{selectall}${fullJobName}`);
    //
    // TODO: Due to a bug in cypress you cannot type values with dots
    // cy
    //   .root()
    //   .getFormGroupInputFor('CPUs')
    //   .type('{selectall}0.5');
    //
    cy.root().getFormGroupInputFor("Mem (MiB)").type("{selectall}32");
    cy.root().getFormGroupInputFor("Command").type(cmdline);

    // Select `Docker Container`
    cy
      .root()
      .get(".multiple-form-modal-sidebar-menu-item")
      .contains("Docker Container")
      .click();

    // Fill-in image
    cy.root().getFormGroupInputFor("Image").type("python:3");

    // Check JSON mode
    cy.contains("JSON mode").click();

    // Check contents of the JSON editor
    cy.get("#brace-editor").contents().asJson().should("deep.equal", [
      {
        id: fullJobName,
        run: {
          cpus: 0.01,
          mem: 32,
          disk: 0,
          cmd: cmdline,
          docker: {
            image: "python:3",
            privileged: false,
            parameters: []
          }
        },
        schedules: []
      }
    ]);

    // Click crate job
    cy.contains("Create Job").click();

    // Switch to the group that will contain the service
    cy.visitUrl(`jobs/overview/${Cypress.env("TEST_UUID")}`);

    // Wait for the table and the service to appear
    cy
      .get(".page-body-content table")
      .contains(jobName, { timeout: Timeouts.JOB_DEPLOYMENT_TIMEOUT })
      .get("a.table-cell-link-primary")
      .contains(`${jobName}`)
      .click();

    // open edit screen
    cy
      .get(".page-header-actions .dropdown")
      .click()
      .get(".dropdown-menu-items")
      .contains("Edit")
      .click();

    // Fill-in the input elements
    cy
      .root()
      .getFormGroupInputFor("ID *")
      .should("have.value", `${fullJobName}`);
    //
    // TODO: Due to a bug in cypress you cannot type values with dots
    // cy
    //   .root()
    //   .getFormGroupInputFor('CPUs')
    //   .type('{selectall}0.5');
    //
    cy.root().getFormGroupInputFor("Mem (MiB)").should("have.value", "32");
    cy.root().getFormGroupInputFor("Command").contains(cmdline);

    // Select `Docker Container`
    cy
      .root()
      .get(".multiple-form-modal-sidebar-menu-item")
      .contains("Docker Container")
      .click();

    // Fill-in image
    cy.root().getFormGroupInputFor("Image").should("have.value", "python:3");
  });

  it("should create a job with labels", function() {
    const jobName = "job-with-labels";
    const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

    // Visit jobs
    cy.visitUrl("jobs/overview");

    // Click 'Create a job'
    // Note: The current group contains the previous jobs
    cy.get(".button.button-link.button-narrow").click();

    // Wait for the 'New Job' dialog to appear
    // Note: The current group contains the previous two jobs
    cy.get(".modal-header").contains("New Job").should("exist");

    // Fill-in the input elements
    cy.root().getFormGroupInputFor("ID *").type(`{selectall}${fullJobName}`);
    //
    // TODO: Due to a bug in cypress you cannot type values with dots
    // cy
    //   .root()
    //   .getFormGroupInputFor('CPUs')
    //   .type('{selectall}0.5');
    //
    cy.root().getFormGroupInputFor("Mem (MiB)").type("{selectall}32");
    cy.root().getFormGroupInputFor("Command").type(cmdline);

    // Select `Labels`
    cy
      .root()
      .get(".multiple-form-modal-sidebar-menu-item")
      .contains("Labels")
      .click();

    // Fill-in the first label
    cy.root().getFormGroupInputFor("Label Name").eq(0).type("camelCase");
    cy.root().getFormGroupInputFor("Label Value").eq(0).type("test");

    // Add an additional label
    cy.get(".clickable").contains("Add Label").click({ force: true });

    // Fill-in the second label
    cy.root().getFormGroupInputFor("Label Name").eq(1).type("snake_case");
    cy.root().getFormGroupInputFor("Label Value").eq(1).type("test");

    // Add an additional label
    cy.get(".clickable").contains("Add Label").click({ force: true });

    // Fill-in the third label
    cy.root().getFormGroupInputFor("Label Name").eq(2).type("lowercase");
    cy.root().getFormGroupInputFor("Label Value").eq(2).type("test");

    // Add an additional label
    cy.get(".clickable").contains("Add Label").click({ force: true });

    // Fill-in the fourth label
    cy.root().getFormGroupInputFor("Label Name").eq(3).type("UPPERCASE");
    cy.root().getFormGroupInputFor("Label Value").eq(3).type("test");

    // Check JSON mode
    cy.contains("JSON mode").click();

    // Check contents of the JSON editor
    cy.get("#brace-editor").contents().asJson().should("deep.equal", [
      {
        id: fullJobName,
        run: {
          cpus: 0.01,
          mem: 32,
          disk: 0,
          cmd: cmdline
        },
        labels: {
          camelCase: "test",
          snake_case: "test",
          lowercase: "test",
          UPPERCASE: "test"
        },
        schedules: []
      }
    ]);

    // Click crate job
    cy.contains("Create Job").click();

    // Switch to the group that will contain the service
    cy.visitUrl(`jobs/overview/${Cypress.env("TEST_UUID")}`);

    // Wait for the table and the service to appear
    cy
      .get(".page-body-content table")
      .contains(jobName, { timeout: Timeouts.JOB_DEPLOYMENT_TIMEOUT })
      .get("a.table-cell-link-primary")
      .contains(`${jobName}`)
      .click();

    // open edit screen
    cy
      .get(".page-header-actions .dropdown")
      .click()
      .get(".dropdown-menu-items")
      .contains("Edit")
      .click();

    // Fill-in the input elements
    cy
      .root()
      .getFormGroupInputFor("ID *")
      .should("have.value", `${fullJobName}`);
    cy.root().getFormGroupInputFor("Mem (MiB)").should("have.value", "32");
    cy.root().getFormGroupInputFor("Command").contains(cmdline);

    // Select `Labels`
    cy
      .root()
      .get(".multiple-form-modal-sidebar-menu-item")
      .contains("Labels")
      .click();

    // Fill-in the first label
    cy
      .root()
      .getFormGroupInputFor("Label Name")
      .eq(0)
      .should("have.value", "camelCase");
    cy
      .root()
      .getFormGroupInputFor("Label Value")
      .eq(0)
      .should("have.value", "test");

    // Fill-in the second label
    cy
      .root()
      .getFormGroupInputFor("Label Name")
      .eq(1)
      .should("have.value", "snake_case");
    cy
      .root()
      .getFormGroupInputFor("Label Value")
      .eq(1)
      .should("have.value", "test");

    // Fill-in the third label
    cy
      .root()
      .getFormGroupInputFor("Label Name")
      .eq(2)
      .should("have.value", "lowercase");
    cy
      .root()
      .getFormGroupInputFor("Label Value")
      .eq(2)
      .should("have.value", "test");

    // Fill-in the fourth label
    cy
      .root()
      .getFormGroupInputFor("Label Name")
      .eq(3)
      .should("have.value", "UPPERCASE");
    cy
      .root()
      .getFormGroupInputFor("Label Value")
      .eq(3)
      .should("have.value", "test");
  });

  it("should create a job with schedule", function() {
    const jobName = "job-with-schedule";
    const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

    // Visit jobs
    cy.visitUrl("jobs/overview");

    // Click 'Create a job'
    // Note: The current group contains the previous jobs
    cy.get(".button.button-link.button-narrow").click();

    // Wait for the 'New Job' dialog to appear
    cy.get(".modal-header").contains("New Job").should("exist");

    // Fill-in the input elements
    cy.root().getFormGroupInputFor("ID *").type(`{selectall}${fullJobName}`);
    //
    // TODO: Due to a bug in cypress you cannot type values with dots
    // cy
    //   .root()
    //   .getFormGroupInputFor('CPUs')
    //   .type('{selectall}0.1');
    //
    cy.root().getFormGroupInputFor("Mem (MiB)").type("{selectall}32");
    cy.root().getFormGroupInputFor("Command").type(cmdline);

    // Select `Schedule`
    cy
      .root()
      .get(".multiple-form-modal-sidebar-menu-item")
      .contains("Schedule")
      .click();

    // Check 'Run on a schedule'
    cy.contains("Run on a schedule").click();

    // Specify a schedule
    cy.root().getFormGroupInputFor("Cron Schedule *").type("* * * * *");

    // Enable schedule
    cy.contains("Enable").click();

    // Check JSON mode
    cy.contains("JSON mode").click();

    // Check contents of the JSON editor
    cy.get("#brace-editor").contents().asJson().should("deep.equal", [
      {
        id: fullJobName,
        run: {
          cpus: 0.01,
          mem: 32,
          disk: 0,
          cmd: cmdline
        },
        schedules: [
          {
            id: "default",
            enabled: true,
            cron: "* * * * *",
            concurrencyPolicy: "ALLOW"
          }
        ]
      }
    ]);

    // Click crate job
    cy.contains("Create Job").click();

    // Switch to the group that will contain the service
    cy.visitUrl(`jobs/overview/${Cypress.env("TEST_UUID")}`);

    // Wait for the table and the service to appear
    cy
      .get(".page-body-content table")
      .contains(jobName, { timeout: Timeouts.JOB_DEPLOYMENT_TIMEOUT })
      .get("a.table-cell-link-primary")
      .contains(`${jobName}`)
      .click();

    // open edit screen
    cy
      .get(".page-header-actions .dropdown")
      .click()
      .get(".dropdown-menu-items")
      .contains("Edit")
      .click();

    // Fill-in the input elements
    cy
      .root()
      .getFormGroupInputFor("ID *")
      .should("have.value", `${fullJobName}`);
    //
    // TODO: Due to a bug in cypress you cannot type values with dots
    // cy
    //   .root()
    //   .getFormGroupInputFor('CPUs')
    //   .type('{selectall}0.1');
    //
    cy.root().getFormGroupInputFor("Mem (MiB)").should("have.value", "32");
    cy.root().getFormGroupInputFor("Command").contains(cmdline);

    // Select `Schedule`
    cy
      .root()
      .get(".multiple-form-modal-sidebar-menu-item")
      .contains("Schedule")
      .click();

    cy
      .root()
      .getFormGroupInputFor("Cron Schedule *")
      .should("have.value", "* * * * *");
  });
});
