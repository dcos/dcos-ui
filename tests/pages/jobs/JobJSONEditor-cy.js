const _ = require("lodash");

const cmd = "exit 0";
const fillInDefaults = (name) => {
  cy.get(".button.button-primary-link.button-narrow").click();
  cy.get(".modal-header").contains("New Job");
  cy.getFormGroupInputFor("Job ID *").retype(name);
  cy.getFormGroupInputFor("Command").type(cmd);
};

const checkJson = (opts) => {
  cy.contains("JSON Editor").click();
  cy.get("#brace-editor")
    .contents()
    .asJson()
    .should("deep.equal", [
      _.merge(
        // fillInDefaults
        { description: "", run: { cpus: 1, mem: 128, disk: 0, cmd } },
        opts
      ),
    ]);
};

describe("Job JSON Editor", () => {
  beforeEach(() => {
    cy.configureCluster({
      jobDetails: true,
      mesos: "1-for-each-health",
      nodeHealth: true,
    });
    cy.visitUrl({ url: "/jobs/overview" });
  });

  it("renders proper JSON for a job with default container image", () => {
    const jobName = `${Cypress.env("TEST_UUID")}.default`;
    fillInDefaults(jobName);

    cy.contains("Container Image").click();
    cy.getFormGroupInputFor("Container Image*").type("nginx");
    cy.getFormGroupInputFor("Mem (Mib) *").retype("129");
    cy.getFormGroupInputFor("Disk (Mib) *").retype("128");
    cy.getFormGroupInputFor("GPUs").retype("1");
    cy.getFormGroupInputFor("GPUs").retype("1");

    checkJson({
      id: jobName,
      run: {
        mem: 129,
        disk: 128,
        gpus: 1,
        ucr: { image: { id: "nginx", kind: "docker" } },
      },
    });
  });

  it("shows disabled inputs in Container tab when Command Only is chosen", () => {
    // Click 'Create a job'
    // Note: The current group contains the previous job
    cy.get(".button.button-primary-link.button-narrow").click();

    cy.get("label").contains("Command Only").click();

    cy.get(".menu-tabbed-item").contains("Container").click();

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
    const jobName = `${Cypress.env("TEST_UUID")}.ucr`;
    fillInDefaults(jobName);

    cy.getFormGroupInputFor("Container Image*").type("nginx");
    cy.getFormGroupInputFor("GPUs").retype("1");

    cy.get(".menu-tabbed-item").contains("Container").click();
    cy.get("label").contains("Force Pull Image On Launch").click();
    cy.get(".menu-tabbed-item").contains("Run Config").click();
    cy.getFormGroupInputFor("Max Launch Delay").retype("1");
    cy.getFormGroupInputFor("Kill Grace Period").retype("2");
    cy.getFormGroupInputFor("Username").retype("user1");
    cy.get("label").contains("On Failure").click();
    cy.getFormGroupInputFor("Keep Trying Time").retype("3");

    checkJson({
      id: jobName,
      run: {
        gpus: 1,
        ucr: { image: { id: "nginx", kind: "docker", forcePull: true } },
        maxLaunchDelay: 1,
        taskKillGracePeriodSeconds: 2,
        user: "user1",
        restart: {
          policy: "ON_FAILURE",
          activeDeadlineSeconds: 3,
        },
      },
    });
  });

  it("renders proper JSON for a job using Docker with parameters and args", () => {
    const jobName = `${Cypress.env("TEST_UUID")}.params`;
    const dockerParam = { key: "key", value: "value" };
    const arg = "arg";

    fillInDefaults(jobName);

    cy.get("label").contains("Container Image").click();
    cy.getFormGroupInputFor("Container Image*").type("nginx");

    cy.get(".menu-tabbed-item").contains("Container").click();
    cy.get("label").contains("Docker Engine").click();
    cy.get("label").contains("Force Pull Image On Launch").click();
    cy.get("label").contains("Grant Runtime Privileges").click();
    cy.get(".button").contains("Add Parameter").click();
    cy.get("[name='key.0.dockerParams']").type(dockerParam.key);
    cy.get("[name='value.0.dockerParams']").type(dockerParam.value);

    cy.root().get(".button").contains("Add Argument").click();
    cy.getFormGroupInputFor("Arguments").type(arg);

    checkJson({
      id: jobName,
      run: {
        args: [arg],
        docker: {
          image: "nginx",
          forcePullImage: true,
          privileged: true,
          parameters: [dockerParam],
        },
      },
    });
  });

  it("renders proper JSON using envvars, volumes, constraints, schedules", () => {
    const jobName = `${Cypress.env("TEST_UUID")}.env`;
    const envVar = { key: "key", value: "value" };
    const volume = { containerPath: "cp", hostPath: "hp", mode: "RO" };
    const constraint = { attribute: "a", operator: "IS", value: "b" };
    const scheduleId = "schedule-id";
    const cron = "0 0 4 * *";
    const startingDeadline = 1;
    const timezone = "UTC";

    fillInDefaults(jobName);
    cy.get("label").contains("Command Only").click();

    cy.get(".menu-tabbed-item").contains("Environment").click();
    cy.get(".button").contains("Add Environment Variable").click();
    cy.get("[name='0.0.env']").type(envVar.key);
    cy.get("[name='1.0.env']").type(envVar.value);

    cy.get(".menu-tabbed-item").contains("Volumes").click();
    cy.get(".button").contains("Add Volume").click();
    cy.get("[name='containerPath.0.volumes']").type(volume.containerPath);
    cy.get("[name='hostPath.0.volumes']").type(volume.hostPath);
    cy.get('select[name="mode.0.volumes"]').select(volume.mode);

    cy.get(".menu-tabbed-item").contains("Placement").click();
    cy.get(".button").contains("Add Placement Constraint").click();
    cy.getFormGroupInputFor("Field").type(constraint.attribute);
    cy.getFormGroupInputFor("Value").type(constraint.value);
    cy.get(".button.dropdown-toggle").click();
    cy.contains(".dropdown-menu-list-item", "Is").click();

    cy.get(".menu-tabbed-item").contains("Schedule").click();
    cy.get("label").contains("Enable schedule").click();
    cy.get("label").contains("Allow").click();
    cy.getFormGroupInputFor("Schedule ID *").retype(scheduleId);
    cy.getFormGroupInputFor("CRON Schedule *").retype(cron);
    cy.getFormGroupInputFor("Time Zone").retype(timezone);
    cy.getFormGroupInputFor("Starting Deadline").retype(startingDeadline);

    checkJson({
      id: jobName,
      schedules: [
        {
          enabled: true,
          startingDeadlineSeconds: startingDeadline,
          id: scheduleId,
          timezone,
          cron,
          concurrencyPolicy: "ALLOW",
        },
      ],
      run: {
        env: { [envVar.key]: envVar.value },
        volumes: [volume],
        placement: { constraints: [constraint] },
      },
    });
  });
});
