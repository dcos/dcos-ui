describe("Services", () => {
  const SECRET_NAME = `${Cypress.env("TEST_UUID")}-secret`;

  /**
   * Test the secrets creation
   */
  describe("Secrets", () => {
    beforeEach(() => {
      cy.visitUrl("secrets");
    });

    it("Creates a secret", () => {
      // Select '+'
      cy.get(".button.button-primary-link.button-narrow").click();

      // Wait for the 'Create New Secret' dialog to appear
      cy.get(".modal-header").contains("Create New Secret");

      // Fill-in the secret details
      cy.getFormGroupInputFor("ID *").type(SECRET_NAME);
      cy.getFormGroupInputFor("Value *").type("something super secret here");

      // Create it
      cy.get(".modal-footer button.button-primary").contains("Create").click();

      // Wait for it to appear in the list
      cy.get(".page-body-content .table-wrapper").contains(SECRET_NAME);
    });
  });

  /**
   * Test the applications
   */
  describe("Applications", () => {
    beforeEach(() => {
      cy.visitUrl(`services/overview/%2F${Cypress.env("TEST_UUID")}/create`);
    });

    function selectUcrRuntime() {
      cy.contains("More Settings").click();
      cy.get("label").contains("Universal Container Runtime (UCR)").click();
    }

    it("Create an app with secrets", () => {
      const serviceName = "app-with-secret";
      const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Fill-in the input elements
      cy.getFormGroupInputFor("Service ID *").type(
        `{selectall}{rightarrow}${serviceName}`
      );
      cy.getFormGroupInputFor("Memory (MiB) *").retype("10");
      cy.getFormGroupInputFor("Command").type(cmdline);

      // Select Universal Container Runtime (UCR)
      selectUcrRuntime();

      // Select Secrets section
      cy.get(".menu-tabbed-item").contains("Secrets").click();

      // Wait for a sec to populate the secrets
      cy.wait(500);

      // Add an a secret
      cy.contains("Add Secret").click();
      cy.get('input[name="secrets.0.value"]').type(SECRET_NAME);
      // Select expose as EnvVar
      cy.get('select[name="secrets.0.exposures.0.type"]').select(
        "Environment Variable"
      );
      // Fill the variable name
      cy.get('input[name="secrets.0.exposures.0.value"]').type("TEST_SECRET");

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor")
        .contents()
        .asJson()
        .should("deep.equal", [
          {
            id: `/${Cypress.env("TEST_UUID")}/${serviceName}`,
            cmd: cmdline,
            container: {
              type: "MESOS",
              volumes: [],
            },
            requirePorts: false,
            cpus: 0.1,
            mem: 10,
            networks: [],
            healthChecks: [],
            fetch: [],
            constraints: [],
            portDefinitions: [],
            instances: 1,
            secrets: {
              secret0: {
                source: SECRET_NAME,
              },
            },
            env: {
              TEST_SECRET: {
                secret: "secret0",
              },
            },
          },
        ]);

      // Click Review and Run
      cy.contains("Review & Run").click();

      // Verify the review screen
      cy.contains(`/${Cypress.env("TEST_UUID")}/${serviceName}`);
      cy.contains("Universal Container Runtime (UCR)");
      cy.contains("0.1");
      cy.contains("10 MiB");
      cy.contains("\u2014");
      cy.contains("TEST_SECRET");

      // Run service
      cy.get("button.button-primary").contains("Run Service").click();

      // Wait for the table and the service to appear
      cy.get(".service-table").contains(serviceName);
    });

    it("Create an app with a file secret", () => {
      const serviceName = "app-with-file-secret";
      const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Fill-in the input elements
      cy.getFormGroupInputFor("Service ID *").type(
        `{selectall}{rightarrow}${serviceName}`
      );
      cy.getFormGroupInputFor("Memory (MiB) *").retype("10");
      cy.getFormGroupInputFor("Command").type(cmdline);

      // Select Universal Container Runtime (UCR)
      selectUcrRuntime();

      // Select Secrets section
      cy.get(".menu-tabbed-item").contains("Secrets").click();

      // Wait for a sec to populate the secrets
      cy.wait(500);

      // Add an a secret
      cy.contains("Add Secret").click();
      cy.get('input[name="secrets.0.value"]').type(SECRET_NAME);
      // Select expose as EnvVar
      cy.get('select[name="secrets.0.exposures.0.type"]').select("File");
      // Fill the container path
      cy.get('input[name="secrets.0.exposures.0.value"]').type("secrets/test");

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor")
        .contents()
        .asJson()
        .should("deep.equal", [
          {
            id: `/${Cypress.env("TEST_UUID")}/${serviceName}`,
            instances: 1,
            portDefinitions: [],
            container: {
              type: "MESOS",
              volumes: [
                {
                  containerPath: "secrets/test",
                  secret: "secret0",
                },
              ],
            },
            cpus: 0.1,
            mem: 10,
            requirePorts: false,
            networks: [],
            healthChecks: [],
            fetch: [],
            constraints: [],
            cmd: cmdline,
            secrets: {
              secret0: {
                source: SECRET_NAME,
              },
            },
          },
        ]);

      // Click Review and Run
      cy.contains("Review & Run").click();

      // Verify the review screen
      cy.contains(`/${Cypress.env("TEST_UUID")}/${serviceName}`);
      cy.contains("Universal Container Runtime (UCR)");
      cy.contains("0.1");
      cy.contains("10 MiB");
      cy.contains("\u2014");
      cy.contains("secrets/test");

      // Run service
      cy.get("button.button-primary").contains("Run Service").click();

      // Wait for the table and the service to appear
      cy.get(".service-table").contains(serviceName);
    });

    it("Create a pod with a file secret", () => {
      cy.visitUrl(`services/overview/%2F${Cypress.env("TEST_UUID")}/create`);

      const serviceName = "pod-with-file-secret";
      const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

      // Select 'Mutli-container'
      cy.contains("Multi-container (Pod)").click();

      // Fill-in the input elements
      cy.getFormGroupInputFor("Service ID *").type(
        `{selectall}{rightarrow}${serviceName}`
      );

      cy.get(".panel").contains("container-1").click();
      cy.getFormGroupInputFor("Memory (MiB) *").retype("10");
      cy.getFormGroupInputFor("Command").type(cmdline);

      // Select Secrets section
      cy.get(".menu-tabbed-item").contains("Secrets").click();

      // Wait for a sec to populate the secrets
      cy.wait(500);

      // Add an a secret
      cy.contains("Add Secret").click();
      cy.get('input[name="secrets.0.value"]').type(SECRET_NAME);
      // Select expose as EnvVar
      cy.get('select[name="secrets.0.exposures.0.type"]').select("File");
      // Fill the container path
      cy.get('input[name="secrets.0.exposures.0.mounts.0"]').type(
        "secrets/test"
      );

      // Click Review and Run
      cy.contains("Review & Run").click();

      // Run service
      cy.get("button.button-primary").contains("Run Service").click();

      // Wait for the table and the service to appear
      cy.get(".service-table").contains(serviceName).click();

      // Open the configuration tab
      cy.get(".menu-tabbed-item").contains("Configuration").click();

      cy.get(".menu-tabbed-item .active").contains("Configuration");
    });
  });
});
