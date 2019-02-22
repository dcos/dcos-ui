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

  it("renders proper JSON for a job with container image", function() {
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
});
