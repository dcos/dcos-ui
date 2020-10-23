describe("Placement", () => {
  context("Jobs form placement section", () => {
    beforeEach(() => {
      cy.configureCluster({
        jobDetails: true,
        mesos: "1-for-each-health",
        nodeHealth: true,
        plugins: "placement",
      });

      // Forge a cookie for the auth plugin
      cy.setCookie(
        "dcos-acs-info-cookie",
        btoa(
          `{"uid": "ui-bot", "description": "Bootstrap superuser", "is_remote": false}`
        )
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

    it("renders proper JSON for a job with a region constraint and regular constraint", () => {
      const jobName = "constraints";
      const fullJobName = `${Cypress.env("TEST_UUID")}.${jobName}`;
      const cmdline = "while true; do echo 'test' ; sleep 100 ; done";
      const constraint = {
        attribute: "a",
        operator: "IS",
        value: "b",
      };

      // Click 'Create a job'
      // Note: The current group contains the previous job
      cy.get(".button.button-primary-link.button-narrow").click();

      // Wait for the 'New Job' dialog to appear
      cy.get(".modal-header").contains("New Job");

      // Fill-in the input elements
      cy.getFormGroupInputFor("Job ID *").retype(fullJobName);
      cy.getFormGroupInputFor("Mem (MiB) *").retype("32");
      cy.get("label").contains("Command Only").click();
      cy.getFormGroupInputFor("Command *").type(cmdline);

      cy.get(".menu-tabbed-item").contains("Placement").click();

      // Add a region constraint
      cy.get('select[name="0.regionConstraint"]').select("eu-central-1");

      cy.get(".button").contains("Add Constraint").click();

      cy.getFormGroupInputFor("Field").type(constraint.attribute);

      cy.getFormGroupInputFor("Value").type(constraint.value);

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
                constraints: [
                  {
                    attribute: "@region",
                    operator: "IS",
                    value: "eu-central-1",
                  },
                  constraint,
                ],
              },
            },
          },
        ]);
    });
  });
});
