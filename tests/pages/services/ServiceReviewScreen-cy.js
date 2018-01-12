require("../../_support/utils/ServicesUtil");

describe("Services", function() {
  /**
   * Test the applications
   */
  describe("Applications", function() {
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

    function selectMesosRuntime() {
      cy.contains("More Settings").click();
      cy.get("label").contains("Universal Container Runtime (UCR)").click();
    }

    it("renders proper review screen and JSON for a simple app", function() {
      const serviceName = "app-with-inline-shell-script";
      const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.5');
      //
      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Select Universal Container Runtime (UCR)
      selectMesosRuntime();

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${serviceName}`,
          cmd: cmdline,
          cpus: 0.1,
          mem: 10,
          instances: 1,
          portDefinitions: [],
          container: {
            type: "MESOS",
            volumes: []
          },
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
        .contains("10 MiB");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Configured");
    });

    it("renders proper review screen and JSON for an app with artifacts", function() {
      const serviceName = "app-with-artifacts";
      const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .root()
      //   .getFormGroupInputFor('CPUs *')
      //   .type('{selectall}0.1');
      //
      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Select Universal Container Runtime (UCR)
      selectMesosRuntime();

      // Use some artifacts
      cy.contains("Add Artifact").click();
      cy
        .get('input[name="fetch.0.uri"]')
        .type("http://lorempicsum.com/simpsons/600/400/1");
      cy.contains("Add Artifact").click();
      cy
        .get('input[name="fetch.1.uri"]')
        .type("http://lorempicsum.com/simpsons/600/400/2");
      cy.contains("Add Artifact").click();
      cy
        .get('input[name="fetch.2.uri"]')
        .type("http://lorempicsum.com/simpsons/600/400/3");

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${serviceName}`,
          cmd: cmdline,
          cpus: 0.1,
          mem: 10,
          instances: 1,
          portDefinitions: [],
          container: {
            type: "MESOS",
            volumes: []
          },
          requirePorts: false,
          networks: [],
          healthChecks: [],
          fetch: [
            {
              uri: "http://lorempicsum.com/simpsons/600/400/1"
            },
            {
              uri: "http://lorempicsum.com/simpsons/600/400/2"
            },
            {
              uri: "http://lorempicsum.com/simpsons/600/400/3"
            }
          ],
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
        .contains("10 MiB");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Configured");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Container Image")
        .contains("Not Supported");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Command")
        .contains(cmdline);
      cy
        .root()
        .configurationSection("Container Artifacts")
        .children("table")
        .getTableColumn("Artifact URI")
        .contents()
        .should("deep.equal", [
          "http://lorempicsum.com/simpsons/600/400/1",
          "http://lorempicsum.com/simpsons/600/400/2",
          "http://lorempicsum.com/simpsons/600/400/3"
        ]);
    });

    it("renders proper review screen and JSON for an app with command health check", function() {
      const serviceName = "app-with-command-health-check";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);
      cy.root().getFormGroupInputFor("Container Image").type("nginx");
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.5');
      //
      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}32");

      // Select Networking section
      cy.root().get(".menu-tabbed-item").contains("Networking").click();

      // Select "Bridge"
      cy.root().getFormGroupInputFor("Network Type").select("Bridge");

      // Click "Add Service Endpoint"
      cy.contains("Add Service Endpoint").click();
      cy.root().getFormGroupInputFor("Container Port").type("80");

      // Switch to health checks
      cy.contains("Health Checks").click();

      // Add a health check
      cy.contains("Add Health Check").click();
      cy.root().getFormGroupInputFor("Protocol").select("Command");
      cy.root().getFormGroupInputFor("Command").type("sleep 5; exit 0");

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${serviceName}`,
          instances: 1,
          container: {
            type: "DOCKER",
            volumes: [],
            docker: {
              image: "nginx"
            },
            portMappings: [
              {
                containerPort: 80,
                hostPort: 0,
                protocol: "tcp"
              }
            ]
          },
          cpus: 0.1,
          mem: 32,
          healthChecks: [
            {
              protocol: "COMMAND",
              command: {
                value: "sleep 5; exit 0"
              }
            }
          ],
          requirePorts: false,
          networks: [
            {
              mode: "container/bridge"
            }
          ],
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
        .contains("Docker Engine");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("CPU")
        .contains("0.1");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains("32 MiB");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Configured");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Container Image")
        .contains("nginx");
      cy
        .root()
        .configurationSection("Network")
        .configurationMapValue("Network Mode")
        .contains("container/bridge");

      cy
        .root()
        .configurationSection("Service Endpoints")
        .getTableRowThatContains("80")
        .should("exist");

      cy
        .root()
        .configurationSection("Command Health Checks")
        .getTableRowThatContains("sleep 5; exit 0")
        .should("exist");
    });

    it("renders proper review screen and JSON for an app with docker config", function() {
      const serviceName = "app-with-docker-config";
      const cmdline = "python3 -m http.server 8080";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);
      cy.root().getFormGroupInputFor("Container Image").type("python:3");
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.5');
      //
      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}32");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Select Networking section
      cy.root().get(".menu-tabbed-item").contains("Networking").click();

      // Select "Bridge"
      cy.root().getFormGroupInputFor("Network Type").select("Bridge");

      // Click "Add Service Endpoint"
      cy.contains("Add Service Endpoint").click();

      // Setup HTTP endpoint
      cy.root().getFormGroupInputFor("Container Port").type("8080");
      cy.root().getFormGroupInputFor("Service Endpoint Name").type("http");

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${serviceName}`,
          cmd: cmdline,
          cpus: 0.1,
          instances: 1,
          mem: 32,
          container: {
            type: "DOCKER",
            volumes: [],
            docker: {
              image: "python:3"
            },
            portMappings: [
              {
                containerPort: 8080,
                hostPort: 0,
                protocol: "tcp",
                name: "http"
              }
            ]
          },
          requirePorts: false,
          networks: [
            {
              mode: "container/bridge"
            }
          ],
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
        .contains("Docker Engine");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("CPU")
        .contains("0.1");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains("32 MiB");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Configured");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Container Image")
        .contains("python:3");

      cy
        .root()
        .configurationSection("Network")
        .configurationMapValue("Network Mode")
        .contains("container/bridge");
      cy
        .root()
        .configurationSection("Service Endpoints")
        .getTableRowThatContains("http")
        .should("exist");
      cy
        .root()
        .configurationSection("Service Endpoints")
        .getTableRowThatContains("8080")
        .should("exist");
    });

    it("renders proper review screen and JSON for an app with ucr config and docker container", function() {
      const serviceName = "app-with-ucr-config-and-docker-container";
      const cmdline = "python3 -m http.server 8080";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);
      cy.root().getFormGroupInputFor("Container Image").type("python:3");

      // Hack to allow entering decimals in number fields
      cy.root().getFormGroupInputFor("CPUs *").invoke("attr", "type", "text");
      cy.root().getFormGroupInputFor("CPUs *").type("{selectall}0.5");
      cy.root().getFormGroupInputFor("CPUs *").invoke("attr", "type", "number");

      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}32");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Select Universal Container Runtime (UCR)
      selectMesosRuntime();

      // Select Networking section
      cy.root().get(".menu-tabbed-item").contains("Networking").click();

      // Select "Bridge"
      cy.root().getFormGroupInputFor("Network Type").select("Bridge");

      // Click "Add Service Endpoint"
      cy.contains("Add Service Endpoint").click();

      // Setup HTTP endpoint
      cy.root().getFormGroupInputFor("Container Port").type("8080");
      cy.root().getFormGroupInputFor("Service Endpoint Name").type("http");

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${serviceName}`,
          cmd: cmdline,
          cpus: 0.5,
          instances: 1,
          mem: 32,
          container: {
            type: "MESOS",
            volumes: [],
            docker: {
              image: "python:3"
            },
            portMappings: [
              {
                containerPort: 8080,
                hostPort: 0,
                protocol: "tcp",
                name: "http"
              }
            ]
          },
          requirePorts: false,
          networks: [
            {
              mode: "container/bridge"
            }
          ],
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
        .contains("0.5");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains("32 MiB");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Configured");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Container Image")
        .contains("python:3");

      cy
        .root()
        .configurationSection("Network")
        .configurationMapValue("Network Mode")
        .contains("container/bridge");
      cy
        .root()
        .configurationSection("Service Endpoints")
        .getTableRowThatContains("http")
        .should("exist");
      cy
        .root()
        .configurationSection("Service Endpoints")
        .getTableRowThatContains("8080")
        .should("exist");
    });

    it("renders proper review screen and JSON for app with ucr config and command", function() {
      const serviceName = "app-with-ucr-config-and-command";
      const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);

      // Hack to allow entering decimals in number fields
      cy.root().getFormGroupInputFor("CPUs *").invoke("attr", "type", "text");
      cy.root().getFormGroupInputFor("CPUs *").type("{selectall}0.5");
      cy.root().getFormGroupInputFor("CPUs *").invoke("attr", "type", "number");

      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}32");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Select Universal Container Runtime (UCR)
      selectMesosRuntime();

      // Select Networking section
      cy.root().get(".menu-tabbed-item").contains("Networking").click();

      // Select "Bridge"
      cy.root().getFormGroupInputFor("Network Type").select("Bridge");

      // Click "Add Service Endpoint"
      cy.contains("Add Service Endpoint").click();

      // Setup HTTP endpoint
      cy.root().getFormGroupInputFor("Container Port").type("8080");
      cy.root().getFormGroupInputFor("Service Endpoint Name").type("http");

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${serviceName}`,
          cmd: cmdline,
          cpus: 0.5,
          instances: 1,
          mem: 32,
          container: {
            type: "MESOS",
            volumes: [],
            portMappings: [
              {
                containerPort: 8080,
                hostPort: 0,
                protocol: "tcp",
                name: "http"
              }
            ]
          },
          requirePorts: false,
          networks: [
            {
              mode: "container/bridge"
            }
          ],
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
        .contains("0.5");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains("32 MiB");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Configured");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Container Image")
        .contains("Not Supported");

      cy
        .root()
        .configurationSection("Network")
        .configurationMapValue("Network Mode")
        .contains("container/bridge");
      cy
        .root()
        .configurationSection("Service Endpoints")
        .getTableRowThatContains("http")
        .should("exist");
      cy
        .root()
        .configurationSection("Service Endpoints")
        .getTableRowThatContains("8080")
        .should("exist");
    });

    it("renders proper review screen and JSON for an app with environment variables", function() {
      const serviceName = "app-with-environment-variables";
      const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.5');
      //
      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Select Universal Container Runtime (UCR)
      selectMesosRuntime();

      // Select Environment section
      cy.root().get(".menu-tabbed-item").contains("Environment").click();

      // Add an environment variable
      cy.contains("Add Environment Variable").click();
      cy.get('input[name="env.0.key"]').type("camelCase");
      cy.get('input[name="env.0.value"]').type("test");

      // Add an environment variable
      cy.contains("Add Environment Variable").click();
      cy.get('input[name="env.1.key"]').type("snake_case");
      cy.get('input[name="env.1.value"]').type("test");

      // Add an environment variable
      cy.contains("Add Environment Variable").click();
      cy.get('input[name="env.2.key"]').type("lowercase");
      cy.get('input[name="env.2.value"]').type("test");

      // Add an environment variable
      cy.contains("Add Environment Variable").click();
      cy.get('input[name="env.3.key"]').type("UPPERCASE");
      cy.get('input[name="env.3.value"]').type("test");

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${serviceName}`,
          cmd: cmdline,
          cpus: 0.1,
          mem: 10,
          instances: 1,
          env: {
            camelCase: "test",
            snake_case: "test",
            lowercase: "test",
            UPPERCASE: "test"
          },
          portDefinitions: [],
          container: {
            type: "MESOS",
            volumes: []
          },
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
        .contains("10 MiB");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Configured");

      cy
        .root()
        .configurationSection("Environment Variables")
        .children("table")
        .getTableColumn("Key")
        .contents()
        .should("deep.equal", [
          "camelCase",
          "snake_case",
          "lowercase",
          "UPPERCASE"
        ]);
      cy
        .root()
        .configurationSection("Environment Variables")
        .children("table")
        .getTableColumn("Value")
        .contents()
        .should("deep.equal", ["test", "test", "test", "test"]);
    });

    it("renders proper review screen and JSON for an app with HTTP health check", function() {
      const serviceName = "app-with-http-health-check";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.5');
      //
      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}32");
      cy.root().getFormGroupInputFor("Container Image").type("nginx");

      // Select Networking section
      cy.root().get(".menu-tabbed-item").contains("Networking").click();

      // Select "Bridge"
      cy.root().getFormGroupInputFor("Network Type").select("Bridge");

      // Click "Add Service Endpoint"
      cy.contains("Add Service Endpoint").click();

      // Setup HTTP endpoint
      cy.root().getFormGroupInputFor("Container Port").type("80");
      cy.root().getFormGroupInputFor("Service Endpoint Name").type("http");

      // Switch to health checks
      cy.contains("Health Checks").click();

      // Add a health check
      cy.contains("Add Health Check").click();
      cy.root().getFormGroupInputFor("Protocol").select("HTTP");
      cy.root().getFormGroupInputFor("Service Endpoint").select("http");
      cy.root().getFormGroupInputFor("Path").type("/");

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${serviceName}`,
          cpus: 0.1,
          mem: 32,
          instances: 1,
          healthChecks: [
            {
              portIndex: 0,
              protocol: "MESOS_HTTP",
              path: "/"
            }
          ],
          container: {
            type: "DOCKER",
            docker: {
              image: "nginx"
            },
            portMappings: [
              {
                name: "http",
                hostPort: 0,
                containerPort: 80,
                protocol: "tcp"
              }
            ],
            volumes: []
          },
          requirePorts: false,
          networks: [
            {
              mode: "container/bridge"
            }
          ],
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
        .contains("Docker Engine");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("CPU")
        .contains("0.1");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains("32 MiB");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Configured");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Container Image")
        .contains("nginx");

      cy
        .root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Name")
        .contents()
        .should("deep.equal", ["http"]);
      cy
        .root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Protocol")
        .contents()
        .should("deep.equal", ["tcp"]);
      cy
        .root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Container Port")
        .contents()
        .should("deep.equal", ["80"]);
      cy
        .root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Host Port")
        .contents()
        .should("deep.equal", ["Auto Assigned"]);
    });

    it("renders proper review screen and JSON for an app with labels", function() {
      const serviceName = "app-with-labels";
      const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.5');
      //
      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Select Universal Container Runtime (UCR)
      selectMesosRuntime();

      // Select Environment section
      cy.root().get(".menu-tabbed-item").contains("Environment").click();

      // Add an environment variable
      cy.contains("Add Label").click();
      cy.get('input[name="labels.0.key"]').type("camelCase");
      cy.get('input[name="labels.0.value"]').type("test");

      // Add an environment variable
      cy.contains("Add Label").click();
      cy.get('input[name="labels.1.key"]').type("snake_case");
      cy.get('input[name="labels.1.value"]').type("test");

      // Add an environment variable
      cy.contains("Add Label").click();
      cy.get('input[name="labels.2.key"]').type("lowercase");
      cy.get('input[name="labels.2.value"]').type("test");

      // Add an environment variable
      cy.contains("Add Label").click();
      cy.get('input[name="labels.3.key"]').type("UPPERCASE");
      cy.get('input[name="labels.3.value"]').type("test");

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${serviceName}`,
          cmd: cmdline,
          cpus: 0.1,
          mem: 10,
          instances: 1,
          labels: {
            camelCase: "test",
            snake_case: "test",
            lowercase: "test",
            UPPERCASE: "test"
          },
          portDefinitions: [],
          container: {
            type: "MESOS",
            volumes: []
          },
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
        .contains("10 MiB");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Configured");

      cy
        .root()
        .configurationSection("Labels")
        .children("table")
        .getTableColumn("Key")
        .contents()
        .should("deep.equal", [
          "camelCase",
          "snake_case",
          "lowercase",
          "UPPERCASE"
        ]);
      cy
        .root()
        .configurationSection("Labels")
        .children("table")
        .getTableColumn("Value")
        .contents()
        .should("deep.equal", ["test", "test", "test", "test"]);
    });

    it("renders proper review screen and JSON for an app with persistent volume", function() {
      const serviceName = "app-with-persistent-volume";
      const cmdline =
        "while true ; do echo 'test' > test/echo ; sleep 100 ; done";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.5');
      //
      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Select Universal Container Runtime (UCR)
      selectMesosRuntime();

      // Select Volumes section
      cy.root().get(".menu-tabbed-item").contains("Volumes").click();

      // Add an environment variable
      cy.contains("Add Volume").click();
      cy.root().getFormGroupInputFor("Volume Type").select("Persistent Volume");
      cy.root().getFormGroupInputFor("Size (MiB)").type("128");
      cy.root().getFormGroupInputFor("Container Path").type("test");

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${serviceName}`,
          cmd: cmdline,
          cpus: 0.1,
          mem: 10,
          instances: 1,
          container: {
            volumes: [
              {
                persistent: {
                  size: 128
                },
                mode: "RW",
                containerPath: "test"
              }
            ],
            type: "MESOS"
          },
          residency: {
            relaunchEscalationTimeoutSeconds: 10,
            taskLostBehavior: "WAIT_FOREVER"
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
        .contains("10 MiB");
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
        .should("deep.equal", ["Persistent Local"]);
      cy
        .root()
        .configurationSection("Storage")
        .children("table")
        .getTableColumn("Size")
        .contents()
        .should("deep.equal", ["128 MiB"]);
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

    it("renders proper review screen and JSON for an app with service address", function() {
      const serviceName = "app-with-service-address";
      const command = "python3 -m http.server 8080";
      const containerImage = "python:3";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);

      // Hack to allow entering decimals in number fields
      cy.root().getFormGroupInputFor("CPUs *").invoke("attr", "type", "text");
      cy.root().getFormGroupInputFor("CPUs *").type("{selectall}0.5");
      cy.root().getFormGroupInputFor("CPUs *").invoke("attr", "type", "number");

      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}32");

      cy.root().getFormGroupInputFor("Container Image").type(containerImage);

      cy.root().getFormGroupInputFor("Command").type(command);

      cy.get(".menu-tabbed-item").contains("Networking").click();

      cy
        .root()
        .getFormGroupInputFor("Network Type")
        .select("Virtual Network: dcos-1");

      cy.get(".button").contains("Add Service Endpoint").click();

      cy.root().getFormGroupInputFor("Container Port").type("8080");

      cy.root().getFormGroupInputFor("Service Endpoint Name").type("http");

      cy
        .get('input[name="portDefinitions.0.loadBalanced"]')
        .parents(".form-control-toggle")
        .click();

      cy.get("label").contains("JSON Editor").click();

      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${serviceName}`,
          cmd: command,
          cpus: 0.5,
          mem: 32,
          instances: 1,
          container: {
            type: "DOCKER",
            docker: {
              image: containerImage
            },
            portMappings: [
              {
                name: "http",
                containerPort: 8080,
                labels: {
                  VIP_0: `/${serviceName}:8080`
                }
              }
            ],
            volumes: []
          },
          requirePorts: false,
          networks: [
            {
              mode: "container",
              name: "dcos-1"
            }
          ],
          fetch: [],
          constraints: [],
          healthChecks: []
        }
      ]);

      cy.get("button").contains("Review & Run").click();

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Service ID")
        .contains(`/${serviceName}`);

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Instances")
        .contains("1");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("CPU")
        .contains("0.5");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains("32 MiB");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Configured");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Container Runtime")
        .contains("Docker Engine");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Command")
        .contains(command);

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Container Image")
        .contains(containerImage);

      cy
        .root()
        .configurationSection("Network")
        .configurationMapValue("Network Mode")
        .contains("container");

      cy
        .root()
        .configurationSection("Network")
        .configurationMapValue("Network Name")
        .contains("dcos");

      cy
        .root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Name")
        .contents()
        .should("deep.equal", ["http"]);

      cy
        .root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Protocol")
        .contents()
        .should("deep.equal", ["Not Configured"]);

      cy
        .root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Container Port")
        .contents()
        .should("deep.equal", ["8080"]);

      cy
        .root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Host Port")
        .contents()
        .should("deep.equal", ["Auto Assigned"]);

      cy
        .root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Load Balanced Address")
        .contents()
        .should("deep.equal", [
          `${serviceName}.marathon.l4lb.thisdcos.directory:8080`
        ]);
    });

    it("renders proper review screen and JSON for an app with virtual network", function() {
      const serviceName = "app-with-virtual-network";
      const command = "python3 -m http.server 8080";
      const containerImage = "python:3";

      cy.contains("Single Container").click();

      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);

      // Hack to allow entering decimals in number fields
      cy.root().getFormGroupInputFor("CPUs *").invoke("attr", "type", "text");
      cy.root().getFormGroupInputFor("CPUs *").type("{selectall}0.5");
      cy.root().getFormGroupInputFor("CPUs *").invoke("attr", "type", "number");

      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}32");
      cy.root().getFormGroupInputFor("Container Image").type(containerImage);
      cy.root().getFormGroupInputFor("Command").type(command);

      cy.get(".menu-tabbed-item").contains("Networking").click();

      cy
        .root()
        .getFormGroupInputFor("Network Type")
        .select("Virtual Network: dcos-1");

      cy.get(".button").contains("Add Service Endpoint").click();
      cy.get('input[name="portDefinitions.0.containerPort"]').type("8080");
      cy.get('input[name="portDefinitions.0.name"]').type("http");

      cy.get(".button").contains("Add Service Endpoint").click();
      cy.get('input[name="portDefinitions.1.containerPort"]').type("8080");
      cy.get('input[name="portDefinitions.1.name"]').type("mapped");

      cy
        .get('input[name="portDefinitions.1.portMapping"]')
        .parents(".form-control-toggle")
        .click();

      cy
        .get('input[name="portDefinitions.1.automaticPort"]')
        .parents(".form-control-toggle")
        .click();

      cy.root().getFormGroupInputFor("Host Port").type("4200");

      cy.get("label").contains("JSON Editor").click();

      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${serviceName}`,
          cmd: command,
          cpus: 0.5,
          mem: 32,
          instances: 1,
          container: {
            type: "DOCKER",
            volumes: [],
            docker: {
              image: containerImage
            },
            portMappings: [
              {
                name: "http",
                containerPort: 8080
              },
              {
                name: "mapped",
                hostPort: 4200,
                containerPort: 8080,
                protocol: "tcp"
              }
            ]
          },
          networks: [
            {
              name: "dcos-1",
              mode: "container"
            }
          ],
          requirePorts: false,
          healthChecks: [],
          fetch: [],
          constraints: []
        }
      ]);

      cy.get("button").contains("Review & Run").click();

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Service ID")
        .contains(`/${serviceName}`);

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Container Runtime")
        .contains("Docker Engine");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Instances")
        .contains(1);

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("CPU")
        .contains("0.5");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains("32 MiB");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Container Image")
        .contains(containerImage);

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Command")
        .contains(command);

      cy
        .root()
        .configurationSection("Network")
        .configurationMapValue("Network Node")
        .contains("container");

      cy
        .root()
        .configurationSection("Network")
        .configurationMapValue("Network Name")
        .contains("dcos");

      cy
        .root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Name")
        .contents()
        .should("deep.equal", ["http", "mapped"]);

      cy
        .root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Protocol")
        .contents()
        .should("deep.equal", ["Not Configured", "tcp"]);

      cy
        .root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Container Port")
        .contents()
        .should("deep.equal", ["8080", "8080"]);

      cy
        .root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Host Port")
        .contents()
        .should("deep.equal", ["Auto Assigned", "Auto Assigned"]);

      cy
        .root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Load Balanced Address")
        .contents()
        .should("deep.equal", ["Not Enabled", "Not Enabled"]);
    });
  });
});
