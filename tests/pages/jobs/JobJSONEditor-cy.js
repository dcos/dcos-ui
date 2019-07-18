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
    const jobName = "simple";
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
      .type(cmdline);

    // Check JSON mode
    cy.contains("JSON Editor").click();

    // Check contents of the JSON editor
    cy.get("#brace-editor")
      .contents()
      .asJson()
      .should("deep.equal", [
        {
          id: fullJobName,
          description: "",
          run: {
            cpus: 0.1,
            mem: 32,
            disk: 0,
            cmd: cmdline
          }
        }
      ]);
  });

  it("renders proper JSON for a job with default container image", function() {
    const jobName = "default";
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
          id: fullJobName,
          description: "",
          run: {
            cpus: 0.1,
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
      ]);
  });

  it("shows disabled inputs in Container tab when Command Only is chosen", () => {
    // Click 'Create a job'
    // Note: The current group contains the previous job
    cy.get(".button.button-primary-link.button-narrow").click();

    cy.root()
      .get("label")
      .contains("Command Only")
      .click();

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
    const jobName = "ucr";
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
      .get("label")
      .contains("Container Image")
      .click();

    cy.root()
      .getFormGroupInputFor("Command")
      .type(cmdline);

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
      .get("label")
      .contains("On Failure")
      .click();

    cy.root()
      .getFormGroupInputFor("Keep Trying Time")
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
              policy: "ON_FAILURE",
              activeDeadlineSeconds: 3
            }
          }
        }
      ]);
  });

  it("renders proper JSON for a job using Docker with advanced options", () => {
    const jobName = "docker";
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
      .get("label")
      .contains("Container Image")
      .click();
    cy.root()
      .getFormGroupInputFor("Command")
      .type(cmdline);

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
      ]);
  });

  it("renders proper JSON for a job using Docker with parameters", () => {
    const jobName = "params";
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
      .get("label")
      .contains("Container Image")
      .click();
    cy.root()
      .getFormGroupInputFor("Command")
      .type(cmdline);

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
      .get("[name='key.0.dockerParams']")
      .type(dockerParam.key);

    cy.root()
      .get("[name='value.0.dockerParams']")
      .type(dockerParam.value);

    // Check JSON mode
    cy.contains("JSON Editor").click();

    // Check contents of the JSON editor
    cy.get("#brace-editor")
      .contents()
      .asJson()
      .should("deep.equal", [
        {
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
      ]);
  });

  it("renders proper JSON for a job using Docker with args", () => {
    const jobName = "args";
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
      .get("label")
      .contains("Container Image")
      .click();
    cy.root()
      .getFormGroupInputFor("Command")
      .type(cmdline);

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
      .contains("Add Argument")
      .click();

    cy.root()
      .getFormGroupInputFor("Arguments")
      .type(arg);

    // Check JSON mode
    cy.contains("JSON Editor").click();

    // Check contents of the JSON editor
    cy.get("#brace-editor")
      .contents()
      .asJson()
      .should("deep.equal", [
        {
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
      ]);
  });

  it("renders proper JSON for a job with a schedule", () => {
    const jobName = "schedule";
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
      .get("label")
      .contains("Command Only")
      .click();
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
          id: fullJobName,
          description: "",
          run: {
            cpus: 1,
            mem: 32,
            disk: 0,
            cmd: cmdline
          },
          schedules: [
            {
              enabled: true,
              startingDeadlineSeconds: startingDeadline,
              id: scheduleId,
              timezone,
              cron,
              concurrencyPolicy: "ALLOW"
            }
          ]
        }
      ]);
  });

  it("renders proper JSON for a job using environment variables", () => {
    const jobName = "env";
    const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";
    const envVar = {
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
      .get("label")
      .contains("Command Only")
      .click();
    cy.root()
      .getFormGroupInputFor("Command *")
      .type(cmdline);

    cy.get(".menu-tabbed-item")
      .contains("Environment")
      .click();

    cy.root()
      .get(".button")
      .contains("Add Environment Variable")
      .click();

    cy.root()
      .get("[name='0.0.env']")
      .type(envVar.key);

    cy.root()
      .get("[name='1.0.env']")
      .type(envVar.value);

    // Check JSON mode
    cy.contains("JSON Editor").click();

    // Check contents of the JSON editor
    cy.get("#brace-editor")
      .contents()
      .asJson()
      .should("deep.equal", [
        {
          id: fullJobName,
          description: "",
          run: {
            cpus: 1,
            mem: 32,
            disk: 0,
            cmd: cmdline,
            env: {
              [envVar.key]: envVar.value
            }
          }
        }
      ]);
  });

  it("renders proper JSON for a job with volumes", () => {
    const jobName = "volume";
    const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";
    const volume = {
      containerPath: "cp",
      hostPath: "hp",
      mode: "RO"
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
      .get("label")
      .contains("Command Only")
      .click();

    cy.root()
      .getFormGroupInputFor("Command *")
      .type(cmdline);

    cy.get(".menu-tabbed-item")
      .contains("Volumes")
      .click();

    cy.root()
      .get(".button")
      .contains("Add Volume")
      .click();

    cy.root()
      .get("[name='containerPath.0.volumes']")
      .type(volume.containerPath);

    cy.root()
      .get("[name='hostPath.0.volumes']")
      .type(volume.hostPath);

    cy.get('select[name="mode.0.volumes"]').select(volume.mode);

    // Check JSON mode
    cy.contains("JSON Editor").click();

    // Check contents of the JSON editor
    cy.get("#brace-editor")
      .contents()
      .asJson()
      .should("deep.equal", [
        {
          id: fullJobName,
          description: "",
          run: {
            cpus: 1,
            mem: 32,
            disk: 0,
            cmd: cmdline,
            volumes: [volume]
          }
        }
      ]);
  });

  it("renders proper JSON for a job with a constraint", () => {
    const jobName = "constraint";
    const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";
    const constraint = {
      attribute: "a",
      operator: "IS",
      value: "b"
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
      .get("label")
      .contains("Command Only")
      .click();
    cy.root()
      .getFormGroupInputFor("Command *")
      .type(cmdline);

    cy.get(".menu-tabbed-item")
      .contains("Placement")
      .click();

    cy.root()
      .get(".button")
      .contains("Add Placement Constraint")
      .click();

    cy.root()
      .getFormGroupInputFor("Field")
      .type(constraint.attribute);

    cy.root()
      .getFormGroupInputFor("Value")
      .type(constraint.value);

    cy.get(".button.dropdown-toggle").click();

    cy.contains(".dropdown-menu-list-item", "Is").click();

    // Check JSON mode
    cy.contains("JSON Editor").click();

    // Check contents of the JSON editor
    cy.get("#brace-editor")
      .contents()
      .asJson()
      .should("deep.equal", [
        {
          id: fullJobName,
          description: "",
          run: {
            cpus: 1,
            mem: 32,
            disk: 0,
            cmd: cmdline,
            placement: {
              constraints: [constraint]
            }
          }
        }
      ]);
  });
});
