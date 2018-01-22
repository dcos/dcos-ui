require("../../../tests/_support/utils/ServicesUtil");

describe("Services", function() {
  /**
   * Test the external volumes
   *
   * --- IMPORTANT NOTICE ---
   *
   * REMEMBER TO UPDATE num_vols_delete IN external-volumes/teardown
   * WHENEVER YOU ADD OR REMOVE A TEST CASE
   */
  describe("External Volumes", function() {
    beforeEach(function() {
      cy.configureCluster({
        jobDetails: true,
        mesos: "1-for-each-health",
        nodeHealth: true
      });
      cy.visitUrl({
        url: `services/overview/create`
      });
    });

    it("renders proper review screen and JSON for an app with external volume", function() {
      const serviceName = "app-with-external-volume";
      const cmdline =
        "while true ; do echo 'test' > test/echo ; sleep 100 ; done";
      const volumeName = `dcos-system-test-${Cypress.env("TEST_UUID")}-${serviceName}`;

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);

      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}64");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Select Universal Container Runtime (UCR)
      cy.contains("More Settings").click();
      cy.get("label").contains("Universal Container Runtime (UCR)").click();

      // Select Volumes section
      cy.root().get(".menu-tabbed-item").contains("Volumes").click();

      // Add an environment variable
      cy.contains("Add Volume").click();
      cy.get(".button.dropdown-toggle").click();
      cy
        .root()
        .contains(".dropdown-select-item-title", "External Persistent Volume")
        .click();
      cy.root().getFormGroupInputFor("Name").type(volumeName);
      cy.root().getFormGroupInputFor("Size (GiB)").type("1");
      cy.root().getFormGroupInputFor("Container Path").type("test");

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${serviceName}`,
          instances: 1,
          cpus: 0.1,
          mem: 64,
          cmd: cmdline,
          container: {
            volumes: [
              {
                containerPath: "test",
                external: {
                  name: volumeName,
                  provider: "dvdi",
                  options: {
                    "dvdi/driver": "rexray"
                  },
                  size: 1
                },
                mode: "RW"
              }
            ],
            type: "MESOS"
          },
          portDefinitions: [],
          requirePorts: false,
          networks: [],
          healthChecks: [],
          fetch: [],
          constraints: []
        }
      ]);

      // Click Review and Run
      cy.contains("Review & Run").click();

      // Verify the review screen
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Service ID")
        .contains(`/${serviceName}`);
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Container Runtime")
        .contains("Universal Container Runtime (UCR)");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("CPU")
        .contains("0.1");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains("64 MiB");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Configured");

      cy
        .root()
        .configurationSection("Storage")
        .children("table")
        .getTableColumn("Volume")
        .contents()
        .should("deep.equal", [`External (${volumeName})`]);
      cy
        .root()
        .configurationSection("Storage")
        .children("table")
        .getTableColumn("Size")
        .contents()
        .should("deep.equal", ["1 GiB"]);
      cy
        .root()
        .configurationSection("Storage")
        .children("table")
        .getTableColumn("Mode")
        .contents()
        .should("deep.equal", ["RW"]);
      cy
        .root()
        .configurationSection("Storage")
        .children("table")
        .getTableColumn("Container Mount Path")
        .contents()
        .should("deep.equal", ["test"]);
    });
  });
});
