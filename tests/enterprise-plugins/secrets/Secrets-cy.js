describe("Secrets", () => {
  context("Secrets Table", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy",
        plugins: "secrets",
      });
      cy.route(
        /secrets\/v1\/store(\?_timestamp=[0-9]+)?$/,
        "fx:secrets/stores"
      ).route(
        /secrets\/v1\/secret\/default\/\?list=true/,
        "fx:secrets/secrets"
      );
    });

    it("shows a link for each secret in table", () => {
      cy.visitUrl({ url: "/secrets" });
      cy.get(".table-cell-link-primary").should("have.length", 3);
    });

    it("shows a delete option when opening the actions dropdown", () => {
      cy.visitUrl({ url: "/secrets" });
      cy.get(".dropdown").eq(0).click();
      cy.get("li.is-selectable").contains("Delete");
    });

    it("shows a link for each secret in table when user has limited permissions", () => {
      cy.route({
        method: "GET",
        url: /secrets\/v1\/store(\?_timestamp=[0-9]+)?$/,
        status: 403,
        response: {
          message: "Not authorized to perform that action",
        },
      });
      cy.visitUrl({ url: "/secrets" });
      cy.get(".table-cell-link-primary").should("have.length", 3);
    });

    describe("shows error if the secret id is invalid", () => {
      beforeEach(() => {
        cy.visitUrl({ url: "/secrets" });
        cy.get(".button-primary-link").click();
        cy.get('.form-control[name="textValue"]').type("value");
      });

      it("shows error for empty ID", () => {
        cy.get(".button-primary").contains("Create Secret").click();
        cy.get(".form-control-feedback").contains("This field is required.");
      });

      it("shows error for slash at the beginning", () => {
        cy.get('input.form-control[name="path"]').type("/123");
        cy.get(".button-primary").contains("Create Secret").click();
        cy.get(".form-control-feedback").contains(
          "Invalid syntax. Cannot use slashes at the beginning or end."
        );
      });

      it("shows error for invalid symbols", () => {
        cy.get('input.form-control[name="path"]').type("@");
        cy.get(".button-primary").contains("Create Secret").click();
        cy.get(".form-control-feedback").contains(
          "Alphanumerical, dashes, underscores and slashes are allowed."
        );
      });
    });

    it("shows permissions error on secret click if insufficient permissions", () => {
      cy.route({
        method: "GET",
        url: /secrets\/v1\/secret\/default\/a\/list/,
        status: 403,
        response: {
          message: "Not authorized to perform that action",
        },
      });
      cy.visitUrl({ url: "/secrets" });
      cy.contains("a/list").click();
      cy.contains("Permission denied");
    });

    it("shows an error if we submit a secret with no value", () => {
      cy.visitUrl({ url: "/secrets" });
      cy.get(".button-primary-link").click();
      cy.get(".form-group").find('.form-control[name="path"]').type("id");
      cy.get(".button-primary").contains("Create Secret").click();
      cy.get(".form-control-feedback").contains("This field is required.");
    });

    it("shows a non-persisting error if we submit a secret with insufficient permissions", () => {
      cy.visitUrl({ url: "/secrets" });
      cy.get(".button-primary-link").click();
      cy.get(".form-group").find('.form-control[name="path"]').type("id");

      cy.get(".form-group")
        .find('.form-control[name="textValue"]')
        .type("value");
      cy.get(".button-primary").contains("Create Secret").click();
      cy.get("div").contains("An error has occurred."); // Error message.

      cy.get(".button").contains("Cancel").click(); // Close the modal.
      cy.get(".button-primary-link").click(); // Open it again.
      cy.get(".form-control-feedback").should("not.exist"); // No error is visible.
    });
    it("shows error when trying to delete a secret with insufficient permissions", () => {
      cy.visitUrl({ url: "/secrets" });
      cy.get(".dropdown").eq(0).click();
      cy.get("li.is-selectable").contains("Delete").click();
      cy.get(".button-danger").contains("Delete").click();
      cy.contains("An error has occurred.");
    });
  });

  context("Service Secrets", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy",
        plugins: "auth-secrets", // fixture that enables auth, org and secrets plugins
      });

      // Forge a cookie for the auth plugin
      cy.setCookie(
        "dcos-acs-info-cookie",
        btoa(
          `{"uid": "ui-bot", "description": "Bootstrap superuser", "is_remote": false}`
        )
      );

      cy.route(
        /secrets\/v1\/store(\?_timestamp=[0-9]+)?$/,
        "fx:secrets/stores"
      ).route(
        /secrets\/v1\/secret\/default\/\?list=true/,
        "fx:secrets/secrets"
      );

      cy.route(
        /acs\/api\/v1\/users\/ui-bot\/permissions(\?_timestamp=[0-9]+)?$/,
        "fx:acl/superuser"
      );

      // Stub every other route that could give 401
      cy.route(/navstar\/lashup\/key/, "")
        .route(/service\/marathon\/v2\/queue/, "")
        .route("POST", /package\/search/, "");
    });

    it("Shows an error in Secrets > Add a Secret, if only the variable name is filled out", () => {
      // Create Service
      cy.visitUrl({ url: "/services/overview/%2F/create" });

      // Select 'Single Container'
      cy.get(".create-service-modal-service-picker-option")
        .contains("Single Container")
        .click();

      // Select Environment section
      cy.root().get(".menu-tabbed-item").contains("Secrets").click();

      // Add a secret
      cy.contains("Add Secret").click();

      // Enter Secret
      cy.get('input[name="secrets.0.value"]').type("TEST");

      // Select expose as EnvVar
      cy.get('select[name="secrets.0.exposures.0.type"]').select(
        "Environment Variable"
      );

      // Fill the variable name
      cy.get('input[name="secrets.0.exposures.0.value"]').type("TEST_SECRET");

      // Remove secret
      cy.get('input[name="secrets.0.value"]').clear();

      // Click Review & Run
      cy.get(".modal-full-screen-actions-primary > .button").click();

      // An error is shown
      cy.get(".menu-tabbed-view").contains("The secret cannot be empty");
    });

    it("Shows an error in Secrets > Add a Secret, if only the container path is filled out", () => {
      // Create Service
      cy.visitUrl({ url: "/services/overview/%2F/create" });

      // Select 'Single Container'
      cy.get(".create-service-modal-service-picker-option")
        .contains("Single Container")
        .click();

      // Select Environment section
      cy.root().get(".menu-tabbed-item").contains("Secrets").click();

      // Add a secret
      cy.contains("Add Secret").click();

      // Enter Secret
      cy.get('input[name="secrets.0.value"]').type("TEST");

      // Select expose as EnvVar
      cy.get('select[name="secrets.0.exposures.0.type"]').select("File");

      // Fill the variable name
      cy.get('input[name="secrets.0.exposures.0.value"]').type("secret/test");

      // Remove secret
      cy.get('input[name="secrets.0.value"]').clear();

      // Click Review & Run
      cy.get(".modal-full-screen-actions-primary > .button").click();

      // An error is shown
      cy.get(".menu-tabbed-view").contains("The secret cannot be empty");
    });
  });
  context("Pod Secrets", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy",
        plugins: "auth-secrets", // fixture that enables auth, org and secrets plugins
      });

      // Forge a cookie for the auth plugin
      cy.setCookie(
        "dcos-acs-info-cookie",
        btoa(
          `{"uid": "ui-bot", "description": "Bootstrap superuser", "is_remote": false}`
        )
      );

      cy.route(
        /secrets\/v1\/store(\?_timestamp=[0-9]+)?$/,
        "fx:secrets/stores"
      ).route(
        /secrets\/v1\/secret\/default\/\?list=true/,
        "fx:secrets/secrets"
      );

      cy.route(
        /acs\/api\/v1\/users\/ui-bot\/permissions(\?_timestamp=[0-9]+)?$/,
        "fx:acl/superuser"
      );

      // Stub every other route that could give 401
      cy.route(/navstar\/lashup\/key/, "")
        .route(/service\/marathon\/v2\/queue/, "")
        .route("POST", /package\/search/, "");
    });

    it("Shows an error in Secrets > Add a Secret, if only the variable name is filled out", () => {
      // Create Service
      cy.visitUrl({ url: "/services/overview/%2F/create" });

      // Select 'Single Container'
      cy.get(".create-service-modal-service-picker-option")
        .contains("Multi-container (Pod)")
        .click();

      // Select Environment section
      cy.root().get(".menu-tabbed-item").contains("Secrets").click();

      // Add a secret
      cy.contains("Add Secret").click();

      // Enter Secret
      cy.get('input[name="secrets.0.value"]').type("TEST");

      // Select expose as EnvVar
      cy.get('select[name="secrets.0.exposures.0.type"]').select(
        "Environment Variable"
      );

      // Fill the variable name
      cy.get('input[name="secrets.0.exposures.0.value"]').type("TEST_SECRET");

      // Remove secret
      cy.get('input[name="secrets.0.value"]').clear();

      // Click Review & Run
      cy.get(".modal-full-screen-actions-primary > .button").click();

      // An error is shown
      cy.get(".menu-tabbed-view").contains("The secret cannot be empty");
    });
  });
  context("Job Secrets", () => {
    beforeEach(() => {
      cy.configureCluster({
        jobDetails: true,
        mesos: "1-for-each-health",
        nodeHealth: true,
        plugins: "auth-secrets", // fixture that enables auth, org and secrets plugins
      });

      // Forge a cookie for the auth plugin
      cy.setCookie(
        "dcos-acs-info-cookie",
        btoa(
          `{"uid": "ui-bot", "description": "Bootstrap superuser", "is_remote": false}`
        )
      );

      cy.route(
        /secrets\/v1\/store(\?_timestamp=[0-9]+)?$/,
        "fx:secrets/stores"
      ).route(
        /secrets\/v1\/secret\/default\/\?list=true/,
        "fx:secrets/secrets"
      );

      cy.route(
        /acs\/api\/v1\/users\/ui-bot\/permissions(\?_timestamp=[0-9]+)?$/,
        "fx:acl/superuser"
      );

      // Stub every other route that could give 401
      cy.route(/navstar\/lashup\/key/, "")
        .route(/service\/marathon\/v2\/queue/, "")
        .route("POST", /package\/search/, "");

      cy.visitUrl({ url: "/jobs/overview" });
    });

    it("adds a job with secrets", () => {
      const jobName = "secret";
      const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;
      const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

      // Click 'Create a job'
      // Note: The current group contains the previous job
      cy.get(".button.button-primary-link.button-narrow").click();

      // Wait for the 'New Job' dialog to appear
      cy.get(".modal-header").contains("New Job");

      // Fill-in the input elements
      cy.root()
        .getFormGroupInputFor("Job ID *")
        .type(`{selectall}${fullJobName}`);
      cy.root().getFormGroupInputFor("Mem (MiB) *").type("{selectall}32");
      cy.root().get("label").contains("Command Only").click();
      cy.root().getFormGroupInputFor("Command *").type(cmdline);

      cy.get(".menu-tabbed-item").contains("Secrets").click();

      // Add environment variable secret
      cy.contains("Add Secret").click();

      // Fill the variable name
      cy.get('input[name="job.run.secrets.0.secretPath"]').type("TEST_SECRET");

      // Select Environment Variable from the dropdown
      cy.get('select[name="job.run.secrets.0.exposureType"]').select(
        "Environment Variable"
      );

      // Choose the environment variable
      cy.get('input[name="job.run.secrets.0.exposureValue"]').type(
        "environment"
      );

      // Add file-based secret
      cy.contains("Add Secret").click();

      // Fill the variable name
      cy.get('input[name="job.run.secrets.1.secretPath"]').type("TEST_SECRET2");

      // Select File from the dropdown
      cy.get('select[name="job.run.secrets.1.exposureType"]').select("File");

      // Choose the container path and filename
      cy.get('input[name="job.run.secrets.1.exposureValue"]').type(
        "test/file-based-secret"
      );

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
              secrets: {
                secret0: {
                  source: "TEST_SECRET",
                },
                secret1: {
                  source: "TEST_SECRET2",
                },
              },
              env: {
                environment: {
                  secret: "secret0",
                },
              },
              volumes: [
                {
                  containerPath: "test/file-based-secret",
                  secret: "secret1",
                },
              ],
            },
          },
        ]);
    });
  });
});
