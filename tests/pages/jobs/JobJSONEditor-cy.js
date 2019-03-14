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

    // Check JSON mode
    cy.contains("JSON Editor").click();

    // Check contents of the JSON editor
    cy.get("#brace-editor")
      .contents()
      .asJson()
      .should("deep.equal", [
        {
          job: {
            id: fullJobName,
            description: "",
            run: {
              cpus: 1,
              mem: 32,
              disk: 0,
              cmd: cmdline
            }
          }
        }
      ]);
  });

  it("renders proper JSON for a job with default container image", function() {
    const jobName = "job-with-docker-config";
    const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

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
    cy.root()
      .getFormGroupInputFor("Mem (MiB) *")
      .type("{selectall}32");
    cy.root()
      .getFormGroupInputFor("Command *")
      .type(cmdline);

    cy.root()
      .get("label")
      .contains("Container Image")
      .click();

    // Fill-in image
    cy.root()
      .getFormGroupInputFor("Container Image *")
      .type("nginx");

    // Fill-in GPUs (should be enabled)
    cy.root()
      .getFormGroupInputFor("GPUs")
      .type("{selectall}1");

    // Check JSON mode
    cy.contains("JSON Editor").click();

    // Check contents of the JSON editor
    cy.get("#brace-editor")
      .contents()
      .asJson()
      .should("deep.equal", [
        {
          job: {
            id: fullJobName,
            description: "",
            run: {
              cpus: 1,
              mem: 32,
              disk: 0,
              gpus: 1,
              cmd: cmdline,
              ucr: {
                image: {
                  id: "nginx",
                  kind: "docker"
                }
              }
            }
          }
        }
      ]);
  });

  it("shows disabled inputs in Container tab when Command Only is chosen", () => {
    // Click 'Create a job'
    // Note: The current group contains the previous job
    cy.get(".button.button-primary-link.button-narrow").click();

    cy.get(".menu-tabbed-item")
      .contains("Container")
      .click();

    // Ensure disabled banner is shown
    cy.contains(
      "Container options disabled. Select Container Image in general tab to enable."
    );

    cy.get("label")
      .contains("Universal Container Runtime")
      .get("input")
      .should("be.disabled");

    cy.get("label")
      .contains("Docker Engine")
      .get("input")
      .should("be.disabled");

    cy.get("label")
      .contains("Force Pull Image On Launch")
      .get("input")
      .should("be.disabled");
  });

  it("renders proper JSON for a job using UCR with advanced options", () => {
    const jobName = "job-with-ucr-config";
    const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

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
    cy.root()
      .getFormGroupInputFor("Mem (MiB) *")
      .type("{selectall}32");
    cy.root()
      .getFormGroupInputFor("Command *")
      .type(cmdline);

    cy.root()
      .get("label")
      .contains("Container Image")
      .click();

    // Fill-in image
    cy.root()
      .getFormGroupInputFor("Container Image *")
      .type("nginx");

    // Fill-in GPUs (should be enabled)
    cy.root()
      .getFormGroupInputFor("GPUs")
      .type("{selectall}1");

    cy.get(".menu-tabbed-item")
      .contains("Container")
      .click();

    cy.root()
      .get("label")
      .contains("Force Pull Image On Launch")
      .click();

    cy.get(".menu-tabbed-item")
      .contains("Run Config")
      .click();

    cy.root()
      .getFormGroupInputFor("Max Launch Delay")
      .type("{selectall}1");

    cy.root()
      .getFormGroupInputFor("Kill Grace Period")
      .type("{selectall}2");

    cy.root()
      .getFormGroupInputFor("Username")
      .type("{selectall}user1");

    // Add Artifact

    // Restart Job

    cy.root()
      .getFormGroupInputFor("Retry Time")
      .type("{selectall}3");

    // Add labels

    // Check JSON mode
    cy.contains("JSON Editor").click();

    // Check contents of the JSON editor
    cy.get("#brace-editor")
      .contents()
      .asJson()
      .should("deep.equal", [
        {
          job: {
            id: fullJobName,
            description: "",
            run: {
              cpus: 1,
              mem: 32,
              disk: 0,
              gpus: 1,
              cmd: cmdline,
              ucr: {
                image: {
                  id: "nginx",
                  kind: "docker",
                  forcePull: true
                }
              },
              maxLaunchDelay: 1,
              taskKillGracePeriodSeconds: 2,
              user: "user1",
              restart: {
                policy: "NEVER",
                activeDeadlineSeconds: 3
              }
            }
          }
        }
      ]);
  });

  it("renders proper JSON for a job using Docker with advanced options", () => {
    const jobName = "job-with-docker-config";
    const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

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
    cy.root()
      .getFormGroupInputFor("Mem (MiB) *")
      .type("{selectall}32");
    cy.root()
      .getFormGroupInputFor("Command *")
      .type(cmdline);

    cy.root()
      .get("label")
      .contains("Container Image")
      .click();

    // Fill-in image
    cy.root()
      .getFormGroupInputFor("Container Image *")
      .type("nginx");

    cy.get(".menu-tabbed-item")
      .contains("Container")
      .click();

    cy.root()
      .get("label")
      .contains("Docker Engine")
      .click();

    cy.root()
      .get("label")
      .contains("Force Pull Image On Launch")
      .click();

    cy.root()
      .get("label")
      .contains("Grant Runtime Privileges")
      .click();

    // Check JSON mode
    cy.contains("JSON Editor").click();

    // Check contents of the JSON editor
    cy.get("#brace-editor")
      .contents()
      .asJson()
      .should("deep.equal", [
        {
          job: {
            id: fullJobName,
            description: "",
            run: {
              cpus: 1,
              mem: 32,
              disk: 0,
              cmd: cmdline,
              docker: {
                image: "nginx",
                forcePullImage: true,
                privileged: true
              }
            }
          }
        }
      ]);
  });

  it("renders proper JSON for a job using Docker with parameters", () => {
    const jobName = "job-with-docker-config";
    const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";
    const dockerParam = {
      key: "key",
      value: "value"
    };

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
    cy.root()
      .getFormGroupInputFor("Mem (MiB) *")
      .type("{selectall}32");
    cy.root()
      .getFormGroupInputFor("Command *")
      .type(cmdline);

    cy.root()
      .get("label")
      .contains("Container Image")
      .click();

    // Fill-in image
    cy.root()
      .getFormGroupInputFor("Container Image *")
      .type("nginx");

    cy.get(".menu-tabbed-item")
      .contains("Container")
      .click();

    cy.root()
      .get("label")
      .contains("Docker Engine")
      .click();

    cy.root()
      .get("label")
      .contains("Force Pull Image On Launch")
      .click();

    cy.root()
      .get("label")
      .contains("Grant Runtime Privileges")
      .click();

    cy.root()
      .get(".button")
      .contains("Add Parameter")
      .click();

    cy.root()
      .getFormGroupInputFor("Parameter Name")
      .type(dockerParam.key);

    cy.root()
      .getFormGroupInputFor("Parameter Value")
      .type(dockerParam.value);

    // Check JSON mode
    cy.contains("JSON Editor").click();

    // Check contents of the JSON editor
    cy.get("#brace-editor")
      .contents()
      .asJson()
      .should("deep.equal", [
        {
          job: {
            id: fullJobName,
            description: "",
            run: {
              cpus: 1,
              mem: 32,
              disk: 0,
              cmd: cmdline,
              docker: {
                image: "nginx",
                forcePullImage: true,
                privileged: true,
                parameters: [dockerParam]
              }
            }
          }
        }
      ]);
  });

  it("renders proper JSON for a job using Docker with args", () => {
    const jobName = "job-with-docker-config";
    const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";
    const arg = "arg";

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
    cy.root()
      .getFormGroupInputFor("Mem (MiB) *")
      .type("{selectall}32");
    cy.root()
      .getFormGroupInputFor("Command *")
      .type(cmdline);

    cy.root()
      .get("label")
      .contains("Container Image")
      .click();

    // Fill-in image
    cy.root()
      .getFormGroupInputFor("Container Image *")
      .type("nginx");

    cy.get(".menu-tabbed-item")
      .contains("Container")
      .click();

    cy.root()
      .get("label")
      .contains("Docker Engine")
      .click();

    cy.root()
      .get("label")
      .contains("Force Pull Image On Launch")
      .click();

    cy.root()
      .get("label")
      .contains("Grant Runtime Privileges")
      .click();

    cy.root()
      .get(".button")
      .contains("Add Arg")
      .click();

    cy.root()
      .getFormGroupInputFor("Arg")
      .type(arg);

    // Check JSON mode
    cy.contains("JSON Editor").click();

    // Check contents of the JSON editor
    cy.get("#brace-editor")
      .contents()
      .asJson()
      .should("deep.equal", [
        {
          job: {
            id: fullJobName,
            description: "",
            run: {
              args: [arg],
              cpus: 1,
              mem: 32,
              disk: 0,
              cmd: cmdline,
              docker: {
                image: "nginx",
                forcePullImage: true,
                privileged: true
              }
            }
          }
        }
      ]);
  });

  it("renders proper JSON for a job with a schedule", () => {
    const jobName = "job-with-schedule";
    const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";
    const scheduleId = "schedule-id";
    const cron = "0 0 4 * *";
    const startingDeadline = 1;
    const timezone = "UTC";

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
    cy.root()
      .getFormGroupInputFor("Mem (MiB) *")
      .type("{selectall}32");
    cy.root()
      .getFormGroupInputFor("Command *")
      .type(cmdline);

    cy.get(".menu-tabbed-item")
      .contains("Schedule")
      .click();

    cy.root()
      .get("label")
      .contains("Enable schedule")
      .click();

    // Toggle Concurrency policy
    cy.root()
      .get("label")
      .contains("Allow")
      .click();

    cy.root()
      .getFormGroupInputFor("Schedule ID *")
      .type(`{selectall}${scheduleId}`);

    cy.root()
      .getFormGroupInputFor("CRON Schedule *")
      .type(`{selectall}${cron}`);

    cy.root()
      .getFormGroupInputFor("Time Zone")
      .type(`{selectall}${timezone}`);

    cy.root()
      .getFormGroupInputFor("Starting Deadline")
      .type(`{selectall}${startingDeadline}`);

    // Check JSON mode
    cy.contains("JSON Editor").click();

    // Check contents of the JSON editor
    cy.get("#brace-editor")
      .contents()
      .asJson()
      .should("deep.equal", [
        {
          job: {
            id: fullJobName,
            description: "",
            run: {
              cpus: 1,
              mem: 32,
              disk: 0,
              cmd: cmdline
            }
          },
          schedule: {
            enabled: true,
            startingDeadlineSeconds: startingDeadline,
            id: scheduleId,
            timezone,
            cron,
            concurrencyPolicy: "ALLOW"
          }
        }
      ]);
  });
});
