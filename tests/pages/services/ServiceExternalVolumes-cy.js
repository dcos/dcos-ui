describe("Services", () => {
  /**
   * Test the external volumes
   *
   * --- IMPORTANT NOTICE ---
   *
   * REMEMBER TO UPDATE num_vols_delete IN external-volumes/teardown
   * WHENEVER YOU ADD OR REMOVE A TEST CASE
   */
  describe("External Volumes", () => {
    beforeEach(() => {
      cy.configureCluster({
        jobDetails: true,
        mesos: "1-for-each-health",
        nodeHealth: true,
      });
      cy.visitUrl({
        url: `services/overview/create`,
      });
    });

    it("renders proper review screen and JSON for an app with external volume", () => {
      const serviceName = "app-with-external-volume";
      const cmdline =
        "while true ; do echo 'test' > test/echo ; sleep 100 ; done";
      const volumeName = `dcos-system-test-${Cypress.env(
        "TEST_UUID"
      )}-${serviceName}`;

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Fill-in the input elements
      cy.getFormGroupInputFor("Service ID *").type(
        `{selectall}{rightarrow}${serviceName}`
      );

      cy.getFormGroupInputFor("Memory (MiB) *").retype("64");
      cy.getFormGroupInputFor("Command").type(cmdline);

      // Select Universal Container Runtime (UCR)
      cy.contains("More Settings").click();
      cy.get("label").contains("Universal Container Runtime (UCR)").click();

      // Select Volumes section
      cy.get(".menu-tabbed-item").contains("Volumes").click();

      // Add an environment variable
      cy.contains("Add Volume").click();
      cy.get(".button.dropdown-toggle").click();
      cy.contains(
        ".dropdown-select-item-title",
        "External Persistent Volume"
      ).click();
      cy.getFormGroupInputFor("Name").type(volumeName);
      cy.getFormGroupInputFor("Size (GiB)").type("1");
      cy.getFormGroupInputFor("Container Path").type("test");

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor")
        .contents()
        .asJson()
        .should("deep.equal", [
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
                      "dvdi/driver": "rexray",
                    },
                    size: 1,
                  },
                  mode: "RW",
                },
              ],
              type: "MESOS",
            },
            portDefinitions: [],
            requirePorts: false,
            networks: [],
            healthChecks: [],
            fetch: [],
            constraints: [],
          },
        ]);

      // Click Review and Run
      cy.contains("Review & Run").click();

      // Verify the review screen
      cy.root()
        .configurationSection("Service")
        .configurationMapValue("Service ID")
        .contains(`/${serviceName}`);
      cy.root()
        .configurationSection("General")
        .configurationMapValue("Container Runtime")
        .contains("Universal Container Runtime (UCR)");
      cy.root()
        .configurationSection("Resources")
        .configurationMapValue("CPU")
        .contains("0.1");
      cy.root()
        .configurationSection("Resources")
        .configurationMapValue("Memory")
        .contains("64 MiB");
      cy.root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("\u2014");

      cy.root()
        .configurationSection("External Persistent Volume")
        .configurationMapValue("Name")
        .contains(`${volumeName}`);

      cy.root()
        .configurationSection("External Persistent Volume")
        .configurationMapValue("Container Path")
        .contains("test");

      cy.root()
        .configurationSection("External Persistent Volume")
        .configurationMapValue("Size")
        .contains("1 GiB");
    });
  });
});
