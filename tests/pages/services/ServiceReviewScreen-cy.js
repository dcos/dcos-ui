const verifyReviewScreen = (config) => {
  Object.entries(config).forEach(([section, c]) => {
    Object.entries(c).forEach(([field, value]) => {
      cy.root()
        .configurationSection(section)
        .configurationMapValue(field)
        .contains(value);
    });
  });
};

describe("Services", () => {
  /**
   * Test the applications
   */
  describe("Applications", () => {
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

    function selectMesosRuntime() {
      cy.contains("More Settings").click();
      cy.get("label").contains("Universal Container Runtime (UCR)").click();
    }

    it("renders proper review screen and JSON for a simple app", () => {
      const serviceName = "app-with-inline-shell-script";
      const cmdline = "exit 0";
      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Select Universal Container Runtime (UCR)
      selectMesosRuntime();

      // Fill-in the input elements
      cy.getFormGroupInputFor("Service ID *").type(
        `{selectall}{rightarrow}${serviceName}`
      );

      cy.get("input[name=cpus]").retype("0.1");
      cy.getFormGroupInputFor("Memory (MiB) *").retype("10");
      cy.getFormGroupInputFor("Command").type(cmdline);

      // Check JSON view
      cy.contains("JSON Editor").click();
      // Check contents of the JSON editor
      cy.get("#brace-editor")
        .contents()
        .asJson()
        .should("deep.equal", [
          {
            id: `/${serviceName}`,
            cmd: cmdline,
            cpus: 0.1,
            mem: 10,
            instances: 1,
            portDefinitions: [],
            container: {
              type: "MESOS",
              volumes: [],
            },
            requirePorts: false,
            networks: [],
            healthChecks: [],
            fetch: [],
            constraints: [],
          },
        ]);

      // Click Review and Run
      cy.contains("Review & Run").click();

      verifyReviewScreen({
        Service: {
          "Service ID": `/${serviceName}`,
        },
        General: {
          "Container Runtime": "Universal Container Runtime (UCR)",
          Disk: "\u2014",
        },
        Resources: {
          CPU: "0.1",
          Memory: "10 MiB",
        },
      });
    });

    it("renders proper review screen and JSON for an app with artifacts", () => {
      const serviceName = "app-with-artifacts";
      const cmdline = "exit 0";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Select Universal Container Runtime (UCR)
      selectMesosRuntime();

      // Fill-in the input elements
      cy.getFormGroupInputFor("Service ID *").type(
        `{selectall}{rightarrow}${serviceName}`
      );

      cy.getFormGroupInputFor("CPUs *").retype("0.1");
      cy.getFormGroupInputFor("Memory (MiB) *").retype("10");
      cy.getFormGroupInputFor("Command").type(cmdline);

      // Use some artifacts
      cy.contains("Add Artifact").click();
      cy.get('input[name="fetch.0.uri"]').type("http://l.com/1");
      cy.contains("Add Artifact").click();
      cy.get('input[name="fetch.1.uri"]').type("http://l.com/2");
      cy.contains("Add Artifact").click();
      cy.get('input[name="fetch.2.uri"]').type("http://l.com/3");

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor")
        .contents()
        .asJson()
        .should("deep.equal", [
          {
            id: `/${serviceName}`,
            cmd: cmdline,
            cpus: 0.1,
            mem: 10,
            instances: 1,
            portDefinitions: [],
            container: {
              type: "MESOS",
              volumes: [],
            },
            requirePorts: false,
            networks: [],
            healthChecks: [],
            fetch: [
              { uri: "http://l.com/1" },
              { uri: "http://l.com/2" },
              { uri: "http://l.com/3" },
            ],
            constraints: [],
          },
        ]);

      // Click Review and Run
      cy.contains("Review & Run").click();

      // Verify the review screen
      cy.root()
        .configurationSection("Container Artifacts")
        .children("table")
        .getTableColumn("Artifact URI")
        .contents()
        .should("deep.equal", [
          "http://l.com/1",
          "http://l.com/2",
          "http://l.com/3",
        ]);
    });

    it("renders proper review screen and JSON for an app with command health check", () => {
      const serviceName = "app-with-command-health-check";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Fill-in the input elements
      cy.getFormGroupInputFor("Service ID *").type(
        `{selectall}{rightarrow}${serviceName}`
      );

      cy.getFormGroupInputFor("Container Image").type("nginx");
      cy.get("input[name=cpus]").retype("0.1");
      cy.getFormGroupInputFor("Memory (MiB) *").retype("32");

      // Select Networking section
      cy.get(".menu-tabbed-item").contains("Networking").click();

      // Select "Bridge"
      cy.getFormGroupInputFor("Network Type").select("Bridge");

      // Click "Add Service Endpoint"
      cy.contains("Add Service Endpoint").click();
      cy.getFormGroupInputFor("Container Port").type("80");

      // Switch to health checks
      cy.contains("Health Checks").click();

      // Add a health check
      cy.contains("Add Health Check").click();
      cy.getFormGroupInputFor("Protocol").select("Command");
      cy.getFormGroupInputFor("Command").type("sleep 5; exit 0");

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
            container: {
              type: "MESOS",
              volumes: [],
              docker: { image: "nginx" },
              portMappings: [
                { containerPort: 80, hostPort: 0, protocol: "tcp" },
              ],
            },
            cpus: 0.1,
            mem: 32,
            healthChecks: [
              { protocol: "COMMAND", command: { value: "sleep 5; exit 0" } },
            ],
            requirePorts: false,
            networks: [{ mode: "container/bridge" }],
            fetch: [],
            constraints: [],
          },
        ]);

      // Click Review and Run
      cy.contains("Review & Run").click();

      // Verify the review screen
      verifyReviewScreen({
        Network: {
          "Network Mode": "container/bridge",
        },
      });

      cy.root()
        .configurationSection("Service Endpoints")
        .getTableRowThatContains("80");

      cy.root()
        .configurationSection("Command Health Checks")
        .getTableRowThatContains("sleep 5; exit 0");
    });

    it("renders proper review screen and JSON for an app with docker config", () => {
      const serviceName = "app-with-docker-config";
      const cmdline = "python3 -m http.server 8080";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Fill-in the input elements
      cy.getFormGroupInputFor("Service ID *").type(
        `{selectall}{rightarrow}${serviceName}`
      );

      cy.getFormGroupInputFor("Container Image").type("python:3");
      cy.get("input[name=cpus]").retype("0.1");

      cy.getFormGroupInputFor("Memory (MiB) *").retype("32");
      cy.getFormGroupInputFor("Command").type(cmdline);

      // Select Networking section
      cy.get(".menu-tabbed-item").contains("Networking").click();

      // Select "Bridge"
      cy.getFormGroupInputFor("Network Type").select("Bridge");

      // Click "Add Service Endpoint"
      cy.contains("Add Service Endpoint").click();

      // Setup HTTP endpoint
      cy.getFormGroupInputFor("Container Port").type("8080");
      cy.getFormGroupInputFor("Service Endpoint Name").type("http");

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor")
        .contents()
        .asJson()
        .should("deep.equal", [
          {
            id: `/${serviceName}`,
            cmd: cmdline,
            cpus: 0.1,
            instances: 1,
            mem: 32,
            container: {
              type: "MESOS",
              volumes: [],
              docker: { image: "python:3" },
              portMappings: [
                {
                  containerPort: 8080,
                  hostPort: 0,
                  protocol: "tcp",
                  name: "http",
                },
              ],
            },
            requirePorts: false,
            networks: [{ mode: "container/bridge" }],
            healthChecks: [],
            fetch: [],
            constraints: [],
          },
        ]);

      // Click Review and Run
      cy.contains("Review & Run").click();

      // Verify the review screen
      cy.root()
        .configurationSection("Network")
        .configurationMapValue("Network Mode")
        .contains("container/bridge");
      cy.root()
        .configurationSection("Service Endpoints")
        .getTableRowThatContains("http");
      cy.root()
        .configurationSection("Service Endpoints")
        .getTableRowThatContains("8080");
    });

    it("renders proper review screen and JSON for an app with ucr config and docker container", () => {
      const serviceName = "app-with-ucr-config-and-docker-container";
      const cmdline = "python3 -m http.server 8080";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Select Universal Container Runtime (UCR)
      selectMesosRuntime();

      // Fill-in the input elements
      cy.getFormGroupInputFor("Service ID *").type(
        `{selectall}{rightarrow}${serviceName}`
      );

      cy.getFormGroupInputFor("Container Image").type("python:3");

      cy.getFormGroupInputFor("CPUs *").retype("0.5");

      cy.getFormGroupInputFor("Memory (MiB) *").retype("32");
      cy.getFormGroupInputFor("Command").type(cmdline);

      // Select Networking section
      cy.get(".menu-tabbed-item").contains("Networking").click();

      // Select "Bridge"
      cy.getFormGroupInputFor("Network Type").select("Bridge");

      // Click "Add Service Endpoint"
      cy.contains("Add Service Endpoint").click();

      // Setup HTTP endpoint
      cy.getFormGroupInputFor("Container Port").type("8080");
      cy.getFormGroupInputFor("Service Endpoint Name").type("http");

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor")
        .contents()
        .asJson()
        .should("deep.equal", [
          {
            id: `/${serviceName}`,
            cmd: cmdline,
            cpus: 0.5,
            instances: 1,
            mem: 32,
            container: {
              type: "MESOS",
              volumes: [],
              docker: { image: "python:3" },
              portMappings: [
                {
                  containerPort: 8080,
                  hostPort: 0,
                  protocol: "tcp",
                  name: "http",
                },
              ],
            },
            requirePorts: false,
            networks: [{ mode: "container/bridge" }],
            healthChecks: [],
            fetch: [],
            constraints: [],
          },
        ]);

      // Click Review and Run
      cy.contains("Review & Run").click();

      // Verify the review screen
      cy.root()
        .configurationSection("Network")
        .configurationMapValue("Network Mode")
        .contains("container/bridge");
      cy.root()
        .configurationSection("Service Endpoints")
        .getTableRowThatContains("http");
      cy.root()
        .configurationSection("Service Endpoints")
        .getTableRowThatContains("8080");
    });

    it("renders proper review screen and JSON for app with ucr config and command", () => {
      const serviceName = "app-with-ucr-config-and-command";
      const cmdline = "exit 0";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Select Universal Container Runtime (UCR)
      selectMesosRuntime();

      // Fill-in the input elements
      cy.getFormGroupInputFor("Service ID *").type(
        `{selectall}{rightarrow}${serviceName}`
      );

      cy.getFormGroupInputFor("CPUs *").retype("0.5");

      cy.getFormGroupInputFor("Memory (MiB) *").retype("32");
      cy.getFormGroupInputFor("Command").type(cmdline);

      // Select Networking section
      cy.get(".menu-tabbed-item").contains("Networking").click();

      // Select "Bridge"
      cy.getFormGroupInputFor("Network Type").select("Bridge");

      // Click "Add Service Endpoint"
      cy.contains("Add Service Endpoint").click();

      // Setup HTTP endpoint
      cy.getFormGroupInputFor("Container Port").type("8080");
      cy.getFormGroupInputFor("Service Endpoint Name").type("http");

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor")
        .contents()
        .asJson()
        .should("deep.equal", [
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
                  name: "http",
                },
              ],
            },
            requirePorts: false,
            networks: [{ mode: "container/bridge" }],
            healthChecks: [],
            fetch: [],
            constraints: [],
          },
        ]); // Click Review and Run
      cy.contains("Review & Run").click();

      // Verify the review screen
      cy.root()
        .configurationSection("Network")
        .configurationMapValue("Network Mode")
        .contains("container/bridge");
      cy.root()
        .configurationSection("Service Endpoints")
        .getTableRowThatContains("http");
      cy.root()
        .configurationSection("Service Endpoints")
        .getTableRowThatContains("8080");
    });

    it("renders proper review screen and JSON for an app with environment variables", () => {
      const serviceName = "app-with-environment-variables";
      const cmdline = "exit 0";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Select Universal Container Runtime (UCR)
      selectMesosRuntime();

      // Fill-in the input elements
      cy.getFormGroupInputFor("Service ID *").type(
        `{selectall}{rightarrow}${serviceName}`
      );

      cy.get("input[name=cpus]").retype("0.1");
      cy.getFormGroupInputFor("Memory (MiB) *").retype("10");
      cy.getFormGroupInputFor("Command").type(cmdline);

      // Select Environment section
      cy.get(".menu-tabbed-item").contains("Environment").click();

      // Add an environment variable
      cy.contains("Add Environment Variable").click();
      cy.get('input[name="env.0.key"]').type("camelCase");
      cy.get('input[name="env.0.value"]').type("test");

      // Add an environment variable
      cy.contains("Add Environment Variable").click();
      cy.get('input[name="env.1.key"]').type("snake_case");
      cy.get('input[name="env.1.value"]').type("test");

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor")
        .contents()
        .asJson()
        .should("deep.equal", [
          {
            id: `/${serviceName}`,
            cmd: cmdline,
            cpus: 0.1,
            mem: 10,
            instances: 1,
            env: { camelCase: "test", snake_case: "test" },
            portDefinitions: [],
            container: { type: "MESOS", volumes: [] },
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
        .configurationSection("Environment Variables")
        .children("table")
        .getTableColumn("Key")
        .contents()
        .should("deep.equal", ["camelCase", "snake_case"]);
      cy.root()
        .configurationSection("Environment Variables")
        .children("table")
        .getTableColumn("Value")
        .contents()
        .should("deep.equal", ["test", "test"]);
    });

    it("renders proper review screen and JSON for an app with HTTP health check", () => {
      const serviceName = "app-with-http-health-check";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Fill-in the input elements
      cy.getFormGroupInputFor("Service ID *").type(
        `{selectall}{rightarrow}${serviceName}`
      );

      cy.get("input[name=cpus]").retype("0.1");
      cy.getFormGroupInputFor("Memory (MiB) *").retype("32");
      cy.getFormGroupInputFor("Container Image").type("nginx");

      // Select Networking section
      cy.get(".menu-tabbed-item").contains("Networking").click();

      // Select "Bridge"
      cy.getFormGroupInputFor("Network Type").select("Bridge");

      // Click "Add Service Endpoint"
      cy.contains("Add Service Endpoint").click();

      // Setup HTTP endpoint
      cy.getFormGroupInputFor("Container Port").type("80");
      cy.getFormGroupInputFor("Service Endpoint Name").type("http");

      // Switch to health checks
      cy.contains("Health Checks").click();

      // Add a health check
      cy.contains("Add Health Check").click();
      cy.getFormGroupInputFor("Protocol").select("HTTP");
      cy.getFormGroupInputFor("Service Endpoint").select("http (tcp/$PORT0)");
      cy.getFormGroupInputFor("Path").type("/");

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor")
        .contents()
        .asJson()
        .should("deep.equal", [
          {
            id: `/${serviceName}`,
            cpus: 0.1,
            mem: 32,
            instances: 1,
            healthChecks: [{ portIndex: 0, protocol: "MESOS_HTTP", path: "/" }],
            container: {
              type: "MESOS",
              docker: { image: "nginx" },
              portMappings: [
                {
                  name: "http",
                  hostPort: 0,
                  containerPort: 80,
                  protocol: "tcp",
                },
              ],
              volumes: [],
            },
            requirePorts: false,
            networks: [{ mode: "container/bridge" }],
            fetch: [],
            constraints: [],
          },
        ]);

      // Click Review and Run
      cy.contains("Review & Run").click();

      // Verify the review screen
      cy.root()
        .configurationSection("General")
        .configurationMapValue("Container Image")
        .contains("nginx");

      cy.root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Name")
        .contents()
        .should("deep.equal", ["http"]);
      cy.root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Protocol")
        .contents()
        .should("deep.equal", ["tcp"]);
      cy.root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Container Port")
        .contents()
        .should("deep.equal", ["80"]);
      cy.root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Host Port")
        .contents()
        .should("deep.equal", ["Auto Assigned"]);
    });

    it("renders proper review screen and JSON for an app with labels", () => {
      const serviceName = "app-with-labels";
      const cmdline = "exit 0";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Select Universal Container Runtime (UCR)
      selectMesosRuntime();

      // Fill-in the input elements
      cy.getFormGroupInputFor("Service ID *").type(
        `{selectall}{rightarrow}${serviceName}`
      );

      cy.get("input[name=cpus]").retype("0.1");
      cy.getFormGroupInputFor("Memory (MiB) *").retype("10");
      cy.getFormGroupInputFor("Command").type(cmdline);

      // Select Environment section
      cy.get(".menu-tabbed-item").contains("Environment").click();

      // Add an environment variable
      cy.contains("Add Label").click();
      cy.get('input[name="labels.0.key"]').type("camelCase");
      cy.get('input[name="labels.0.value"]').type("test");

      // Add an environment variable
      cy.contains("Add Label").click();
      cy.get('input[name="labels.1.key"]').type("snake_case");
      cy.get('input[name="labels.1.value"]').type("test");

      // Add an environment variable

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor")
        .contents()
        .asJson()
        .should("deep.equal", [
          {
            id: `/${serviceName}`,
            cmd: cmdline,
            cpus: 0.1,
            mem: 10,
            instances: 1,
            labels: { camelCase: "test", snake_case: "test" },
            portDefinitions: [],
            container: { type: "MESOS", volumes: [] },
            requirePorts: false,
            networks: [],
            healthChecks: [],
            fetch: [],
            constraints: [],
          },
        ]);

      // Click Review and Run
      cy.contains("Review & Run").click();

      cy.root()
        .configurationSection("Labels")
        .children("table")
        .getTableColumn("Key")
        .contents()
        .should("deep.equal", ["camelCase", "snake_case"]);
      cy.root()
        .configurationSection("Labels")
        .children("table")
        .getTableColumn("Value")
        .contents()
        .should("deep.equal", ["test", "test"]);
    });

    it("renders proper review screen and JSON for an app with persistent volume", () => {
      const serviceName = "app-with-persistent-volume";
      const cmdline = "exit 0";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Select Universal Container Runtime (UCR)
      selectMesosRuntime();

      // Fill-in the input elements
      cy.getFormGroupInputFor("Service ID *").type(
        `{selectall}{rightarrow}${serviceName}`
      );

      cy.get("input[name=cpus]").retype("0.1");
      cy.getFormGroupInputFor("Memory (MiB) *").retype("10");
      cy.getFormGroupInputFor("Command").type(cmdline);

      // Select Volumes section
      cy.get(".menu-tabbed-item").contains("Volumes").click();

      // Add an environment variable
      cy.contains("Add Volume").click();
      cy.get(".button.dropdown-toggle").click();
      cy.contains(
        ".dropdown-select-item-title",
        "Local Persistent Volume"
      ).click();
      cy.getFormGroupInputFor("Size (MiB)").type("128");
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
            portDefinitions: [],
            container: {
              type: "MESOS",
              volumes: [
                {
                  persistent: {
                    size: 128,
                  },
                  mode: "RW",
                  containerPath: "test",
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
          },
        ]);

      // Click Review and Run
      cy.contains("Review & Run").click();

      cy.root()
        .configurationSection("Local Persistent Volume")
        .configurationMapValue("Container Path")
        .contains("test");

      cy.root()
        .configurationSection("Local Persistent Volume")
        .configurationMapValue("Size")
        .contains("128 MiB");
    });

    it("renders proper review screen and JSON for an app with service address", () => {
      const serviceName = "app-with-service-address";
      const command = "python3 -m http.server 8080";
      const containerImage = "python:3";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      cy.getFormGroupInputFor("Service ID *").type(
        `{selectall}{rightarrow}${serviceName}`
      );

      cy.getFormGroupInputFor("CPUs *").retype("0.5");

      cy.getFormGroupInputFor("Memory (MiB) *").retype("32");

      cy.getFormGroupInputFor("Container Image").type(containerImage);

      cy.getFormGroupInputFor("Command").type(command);

      cy.get(".menu-tabbed-item").contains("Networking").click();

      cy.getFormGroupInputFor("Network Type").select("Virtual Network: dcos-1");

      cy.get(".button").contains("Add Service Endpoint").click();

      cy.getFormGroupInputFor("Container Port").type("8080");

      cy.getFormGroupInputFor("Service Endpoint Name").type("http");

      cy.get('input[name="portDefinitions.0.loadBalanced"]')
        .parents(".form-control-toggle")
        .click();

      cy.get("label").contains("JSON Editor").click();

      cy.get("#brace-editor")
        .contents()
        .asJson()
        .should("deep.equal", [
          {
            id: `/${serviceName}`,
            cmd: command,
            cpus: 0.5,
            mem: 32,
            instances: 1,
            container: {
              type: "MESOS",
              docker: { image: containerImage },
              portMappings: [
                {
                  name: "http",
                  containerPort: 8080,
                  labels: { VIP_0: `/${serviceName}:8080` },
                },
              ],
              volumes: [],
            },
            requirePorts: false,
            networks: [{ mode: "container", name: "dcos-1" }],
            fetch: [],
            constraints: [],
            healthChecks: [],
          },
        ]);

      cy.get("button").contains("Review & Run").click();

      cy.root()
        .configurationSection("General")
        .configurationMapValue("Container Image")
        .contains(containerImage);

      cy.root()
        .configurationSection("Network")
        .configurationMapValue("Network Mode")
        .contains("container");

      cy.root()
        .configurationSection("Network")
        .configurationMapValue("Network Name")
        .contains("dcos");

      cy.root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Name")
        .contents()
        .should("deep.equal", ["http"]);

      cy.root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Protocol")
        .contents()
        .should("deep.equal", ["\u2014"]);

      cy.root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Container Port")
        .contents()
        .should("deep.equal", ["8080"]);

      cy.root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Host Port")
        .contents()
        .should("deep.equal", ["—"]);

      cy.root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Load Balanced Address")
        .contents()
        .should("deep.equal", [
          `${serviceName}.marathon.l4lb.thisdcos.directory:8080`,
        ]);
    });

    it("renders proper review screen and JSON for an app with virtual network", () => {
      const serviceName = "app-with-virtual-network";
      const command = "python3 -m http.server 8080";
      const containerImage = "python:3";

      cy.contains("Single Container").click();

      cy.getFormGroupInputFor("Service ID *").type(
        `{selectall}{rightarrow}${serviceName}`
      );

      cy.getFormGroupInputFor("CPUs *").retype("0.5");

      cy.getFormGroupInputFor("Memory (MiB) *").retype("32");
      cy.getFormGroupInputFor("Container Image").type(containerImage);
      cy.getFormGroupInputFor("Command").type(command);

      cy.get(".menu-tabbed-item").contains("Networking").click();

      cy.getFormGroupInputFor("Network Type").select("Virtual Network: dcos-1");

      cy.get(".button").contains("Add Service Endpoint").click();
      cy.get('input[name="portDefinitions.0.containerPort"]').type("8080");
      cy.get('input[name="portDefinitions.0.name"]').type("http");

      cy.get(".button").contains("Add Service Endpoint").click();
      cy.get('input[name="portDefinitions.1.containerPort"]').type("8080");
      cy.get('input[name="portDefinitions.1.name"]').type("mapped");

      cy.get('input[name="portDefinitions.1.portMapping"]')
        .parents(".form-control-toggle")
        .click();

      cy.get('input[name="portDefinitions.1.automaticPort"]')
        .parents(".form-control-toggle")
        .click();

      cy.getFormGroupInputFor("Host Port").retype("4200");

      cy.get("label").contains("JSON Editor").click();

      cy.get("#brace-editor")
        .contents()
        .asJson()
        .should("deep.equal", [
          {
            id: `/${serviceName}`,
            cmd: command,
            cpus: 0.5,
            mem: 32,
            instances: 1,
            container: {
              type: "MESOS",
              volumes: [],
              docker: { image: containerImage },
              portMappings: [
                { name: "http", containerPort: 8080 },
                {
                  name: "mapped",
                  hostPort: 4200,
                  containerPort: 8080,
                  protocol: "tcp",
                },
              ],
            },
            networks: [{ name: "dcos-1", mode: "container" }],
            requirePorts: false,
            healthChecks: [],
            fetch: [],
            constraints: [],
          },
        ]);

      cy.get("button").contains("Review & Run").click();

      cy.root()
        .configurationSection("Network")
        .configurationMapValue("Network Mode")
        .contains("container");

      cy.root()
        .configurationSection("Network")
        .configurationMapValue("Network Name")
        .contains("dcos");

      cy.root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Name")
        .contents()
        .should("deep.equal", ["http", "mapped"]);

      cy.root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Protocol")
        .contents()
        .should("deep.equal", ["\u2014", "tcp"]);

      cy.root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Container Port")
        .contents()
        .should("deep.equal", ["8080", "8080"]);

      cy.root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Host Port")
        .contents()
        .should("deep.equal", ["—", "4200"]);

      cy.root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Load Balanced Address")
        .contents()
        .should("deep.equal", ["Not Enabled", "Not Enabled"]);
    });
    describe("Vertical Bursting", () => {
      it("Limits appear in the review screen", () => {
        const serviceName = "app-with-resource-limits";
        const command = "python3 -m http.server 8080";
        const containerImage = "python:3";

        cy.contains("Single Container").click();
        cy.getFormGroupInputFor("Service ID *").type(
          `{selectall}{rightarrow}${serviceName}`
        );

        cy.getFormGroupInputFor("CPUs *").retype("0.5");

        cy.getFormGroupInputFor("Memory (MiB) *").retype("32");
        cy.getFormGroupInputFor("Container Image").type(containerImage);
        cy.getFormGroupInputFor("Command").type(command);

        cy.contains("More Settings").click();
        cy.getFormGroupInputFor("CPUs")
          .filter("input[name='limits.cpus']")
          .retype("1");
        cy.getFormGroupInputFor("Memory (MiB)")
          .filter("input[name='limits.mem']")
          .retype("42");

        cy.get("button").contains("Review & Run").click();

        [
          { section: "CPUs Limit", value: "1" },
          { section: "Memory Limit", value: "42" },
        ].map((test) => {
          cy.root()
            .configurationSection(test.section)
            .configurationMapValue(test.value);
        });
      });
    });
  });
});
