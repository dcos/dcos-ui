describe("Job JSON Editor", function() {
  beforeEach(function() {
    cy.configureCluster({
      jobDetails: true,
      mesos: "1-for-each-health",
      nodeHealth: true
    });
    cy.visitUrl({ url: "/jobs/overview" });
  });

  it("renders proper JSON for a simple job", function() {
    const jobName = "job-with-inline-shell-script";
    const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

    // Click 'Create a job'
    // Note: The current group contains the previous job
    cy.get(".button.button-primary-link.button-narrow").click();

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
  });

  it("renders proper JSON for a job with docker config", function() {
    const jobName = "job-with-docker-config";
    const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

    // Click 'Create a job'
    // Note: The current group contains the previous job
    cy.get(".button.button-primary-link.button-narrow").click();

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

    // Select `Docker Parameters`
    cy
      .root()
      .get(".multiple-form-modal-sidebar-menu-item")
      .contains("Docker Parameters")
      .click();

    // Fill-in the first param
    cy.root().getFormGroupInputFor("Parameter Name").eq(0).type("cap-drop");
    cy.root().getFormGroupInputFor("Parameter Value").eq(0).type("ALL");

    // Add an additional param
    cy.get(".clickable").contains("Add Parameter").click({ force: true });

    // Fill-in the second param
    cy.root().getFormGroupInputFor("Parameter Name").eq(1).type("cap-add");
    cy.root().getFormGroupInputFor("Parameter Value").eq(1).type("SYSLOG");

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
            parameters: [
              {
                "key": "cap-drop",
                "value": "ALL"
              },
              {
                "key": "cap-add",
                "value": "SYSLOG"
              }
            ]
          }
        },
        schedules: []
      }
    ]);
  });

  it("renders proper JSON for a job with labels", function() {
    const jobName = "job-with-labels";
    const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

    // Click 'Create a job'
    // Note: The current group contains the previous jobs
    cy.get(".button.button-primary-link.button-narrow").click();

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
  });

  it("renders the proper JSON for a job with schedule", function() {
    const jobName = "job-with-schedule";
    const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

    // Click 'Create a job'
    // Note: The current group contains the previous jobs
    cy.get(".button.button-primary-link.button-narrow").click();

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
  });
});
