const cmd = "exit 0";

const checkJson = (opts) => {
  cy.contains("JSON Editor").click();
  cy.get("#brace-editor").contents().asJson().should("deep.equal", [opts]);
};

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

describe("Pods", () => {
  beforeEach(() => {
    cy.configureCluster({
      jobDetails: true,
      mesos: "1-for-each-health",
      nodeHealth: true,
    });
    cy.visitUrl({ url: `services/overview/create` });
  });

  it("renders proper review screen and JSON for a pod with multiple containers", () => {
    cy.contains("Multi-container").click();
    cy.getFormGroupInputFor("Service ID *").retype(
      "/pod-with-multiple-containers"
    );

    cy.get(".menu-tabbed-item").contains("container-1").click();
    cy.getFormGroupInputFor("Container Name").retype("first-container");
    cy.getFormGroupInputFor("Container Image").type("nginx");
    cy.getFormGroupInputFor("Command").type(cmd);
    cy.get(".menu-tabbed-item").contains("Networking").click();
    cy.getFormGroupInputFor("Network Type").select("Virtual Network: dcos-1");
    cy.get(".button").contains("Add Service Endpoint").click();
    cy.getFormGroupInputFor("Container Port").type("8080");
    cy.getFormGroupInputFor("Service Endpoint Name").type("http");
    cy.get('input[name="containers.0.endpoints.0.loadBalanced"]')
      .parents(".form-control-toggle")
      .click();

    cy.get(".menu-tabbed-item").contains("Service").click();
    cy.contains("Add Container").click();
    cy.get(".menu-tabbed-item").contains("Services");

    cy.get(".menu-tabbed-item").contains("container-2").click();
    cy.getFormGroupInputFor("Container Name").retype("second-container");
    cy.getFormGroupInputFor("Container Image").type("nginx");
    cy.getFormGroupInputFor("Command").type(cmd);

    checkJson({
      id: "/pod-with-multiple-containers",
      containers: [
        {
          name: "first-container",
          resources: { cpus: 0.1, mem: 128 },
          image: { id: "nginx", kind: "DOCKER" },
          exec: { command: { shell: cmd } },
          endpoints: [
            {
              name: "http",
              containerPort: 8080,
              hostPort: 0,
              protocol: ["tcp"],
              labels: { VIP_0: "/pod-with-multiple-containers:8080" },
            },
          ],
        },
        {
          name: "second-container",
          resources: { cpus: 0.1, mem: 128 },
          exec: { command: { shell: cmd } },
          image: { id: "nginx", kind: "DOCKER" },
        },
      ],
      scaling: { kind: "fixed", instances: 1 },
      networks: [{ name: "dcos-1", mode: "container" }],
      volumes: [],
      fetch: [],
      scheduling: { placement: { constraints: [] } },
    });

    cy.contains("Review & Run").click();

    verifyReviewScreen({
      Service: {
        "Service ID": "/pod-with-multiple-containers",
        CPU: "0.2 (0.1 first-container, 0.1 second-container)",
        Memory: "256 MiB (128 MiB first-container, 128 MiB second-container)",
      },
      "first-container": {
        "Container Image": "nginx",
        CPUs: "0.1",
        Memory: "128 MiB",
        Command: cmd,
      },
      "second-container": {
        "Container Image": "nginx",
        CPUs: "0.1",
        Memory: "128 MiB",
        Command: cmd,
      },
      Networking: { "Network Type": "Container" },
    });
    cy.root()
      .configurationSection("Service Endpoints")
      .then(($serviceEndpointsSection) => {
        const $tableRows = $serviceEndpointsSection.find("tbody tr:visible");
        const $tableCells = $tableRows.find("td");
        const cellValues = [
          "http",
          "tcp",
          "8080",
          "pod-with-service-address.marathon.l4lb.thisdcos.directory:8080",
          "container-1",
          "Edit",
        ];

        $tableCells.each(function (index) {
          expect(this.textContent.trim()).to.equal(cellValues[index]);
        });
      });
  });

  it("renders proper review screen and JSON for a pod with two containers, ephemeral volume, env vars, labels", () => {
    cy.contains("Multi-container (Pod)").click();

    cy.getFormGroupInputFor("Service ID *").retype(
      "/pod-with-ephemeral-volume"
    );

    cy.get(".menu-tabbed-item").contains("container-1").click();
    cy.getFormGroupInputFor("Memory (MiB) *").retype("10");
    cy.getFormGroupInputFor("Command").type(cmd);

    cy.get(".advanced-section").contains("More Settings").click();
    cy.get(".button").contains("Add Artifact").click();
    cy.get('input[name="containers.0.artifacts.0.uri"]').type("http://l.com/1");
    cy.get(".button").contains("Add Artifact").click();
    cy.get('input[name="containers.0.artifacts.1.uri"]').type("http://l.com/2");

    cy.get(".menu-tabbed-item").contains("Environment").click();
    cy.get(".button").contains("Add Environment Variable").click();
    cy.get('[data-cy="env"] [name="0.key"]').type("camelCase");
    cy.get('[data-cy="env"] [name="0.value"]').type("test");
    cy.get(".button").contains("Add Environment Variable").click();
    cy.get('[data-cy="env"] [name="1.key"]').type("snake_case");
    cy.get('[data-cy="env"] [name="1.value"]').type("test");

    cy.contains("Add Label").click();
    cy.get('[data-cy="labels"] [name="0.key"]').type("camelCase");
    cy.get('[data-cy="labels"] [name="0.value"]').type("test");
    cy.contains("Add Label").click();
    cy.get('[data-cy="labels"] [name="1.key"]').type("snake_case");
    cy.get('[data-cy="labels"] [name="1.value"]').type("test");
    cy.contains("Add Label").click();

    cy.get(".menu-tabbed-item").contains("Service").click();
    cy.contains("Add Container").click();
    cy.get(".menu-tabbed-item").contains("Services");

    cy.get(".menu-tabbed-item").contains("container-2").click();
    cy.getFormGroupInputFor("Container Name").retype("second-container");
    cy.getFormGroupInputFor("Container Image").retype("nginx");
    cy.getFormGroupInputFor("Memory (MiB) *").retype("10");
    cy.getFormGroupInputFor("Command").type(cmd);

    cy.get(".menu-tabbed-item").contains("Volumes").click();
    cy.get(".button").contains("Add Volume").click();
    cy.get(".button.dropdown-toggle").click();
    cy.contains(".dropdown-select-item-title", "Ephemeral Storage").click();
    cy.getFormGroupInputFor("Name").type("test");
    cy.getFormGroupInputFor("Container Path").type("test");
    cy.get('input[name="volumeMounts.0.mountPath.1"]').type("/etc/test");

    checkJson({
      id: "/pod-with-ephemeral-volume",
      containers: [
        {
          name: "container-1",
          resources: { cpus: 0.1, mem: 10 },
          exec: { command: { shell: cmd } },
          volumeMounts: [{ name: "test", mountPath: "test" }],
          artifacts: [{ uri: "http://l.com/1" }, { uri: "http://l.com/2" }],
        },
        {
          name: "second-container",
          resources: { cpus: 0.1, mem: 10 },
          exec: { command: { shell: cmd } },
          image: { id: "nginx", kind: "DOCKER" },
          volumeMounts: [{ name: "test", mountPath: "/etc/test" }],
        },
      ],
      scaling: { kind: "fixed", instances: 1 },
      networks: [{ mode: "host" }],
      volumes: [{ name: "test" }],
      fetch: [],
      environment: {
        camelCase: "test",
        snake_case: "test",
      },
      labels: {
        camelCase: "test",
        snake_case: "test",
      },
      scheduling: { placement: { constraints: [] } },
    });

    cy.get("button").contains("Review & Run").click();

    verifyReviewScreen({
      Service: {
        Instances: "1",
        "Service ID": "/pod-with-ephemeral-volume",

        CPU: "0.2 (0.1 container-1, 0.1 second-container)",
        Memory: "20 MiB (10 MiB container-1, 10 MiB second-container)",
        Disk: "\u2014",
        GPU: "\u2014",
      },
      "container-1": {
        "Container Image": "\u2014",
        "Force Pull On Launch": "\u2014",
        CPUs: "0.1",
        Memory: "10 MiB",
        Command: cmd,
      },
      "second-container": {
        "Container Image": "nginx",
        CPUs: "0.1",
        Memory: "10 MiB",
        Command: cmd,
      },
    });

    cy.root()
      .configurationSection("Volumes")
      .then(($storageSection) => {
        const $tableRow = $storageSection
          .find("tbody tr")
          .filter((index, row) => row.style.display !== "none");
        const $tableCells = $tableRow.find("td");
        const cellValues = [
          "test",
          "EPHEMERAL",
          "FALSE",
          "test",
          "container-1",
          "Edit",
          "test",
          "EPHEMERAL",
          "FALSE",
          "/etc/test",
          "second-container",
          "Edit",
        ];

        expect($tableCells.length).to.equal(12);

        $tableCells.each(function (index) {
          expect(this.textContent.trim()).to.equal(cellValues[index]);
        });
      });
    cy.root()
      .configurationSection("Container Artifacts")
      .then(($containerArtifacts) => {
        // Ensure the section itself exists.
        expect($containerArtifacts.get().length).to.equal(1);
        const $tableRows = $containerArtifacts.find("tbody tr");
        expect($tableRows.length).to.equal(2);

        const cellValues = [
          ["http://l.com/1", "Edit"],
          ["http://l.com/2", "Edit"],
        ];

        $tableRows.each((rowIndex, row) => {
          const $tableCells = Cypress.$(row).find("td");
          $tableCells.each(function (cellIndex) {
            expect(this.textContent.trim()).to.equal(
              cellValues[rowIndex][cellIndex]
            );
          });
        });
      });

    cy.root()
      .configurationSection("Environment Variables")
      .then(($envSection) => {
        expect($envSection.get().length).to.equal(1);
        const $tableRows = $envSection.find("tbody tr:visible");
        const cellValues = [
          ["camelCase", "test", "Shared", "Edit"],
          ["snake_case", "test", "Shared", "Edit"],
        ];

        $tableRows.each((rowIndex, row) => {
          const $tableCells = Cypress.$(row).find("td");
          $tableCells.each(function (cellIndex) {
            expect(this.textContent.trim()).to.equal(
              cellValues[rowIndex][cellIndex]
            );
          });
        });
      });
    cy.root()
      .configurationSection("Labels")
      .then(($section) => {
        expect($section.get().length).to.equal(1);
        const $tableRows = $section.find("tbody tr:visible");
        const cellValues = [
          ["camelCase", "test", "Shared", "Edit"],
          ["snake_case", "test", "Shared", "Edit"],
        ];

        $tableRows.each((rowIndex, row) => {
          const $tableCells = Cypress.$(row).find("td");
          $tableCells.each(function (cellIndex) {
            expect(this.textContent.trim()).to.equal(
              cellValues[rowIndex][cellIndex]
            );
          });
        });
      });
  });

  describe("Vertical Bursting", () => {
    it("Limits appear in the review screen", () => {
      // Select 'Multi-container (Pod)'
      cy.contains("Multi-container (Pod)").click();
      cy.getFormGroupInputFor("Service ID *").retype(
        "pod-with-resource-limits"
      );
      cy.get(".menu-tabbed-item").contains("container-1").click();
      cy.contains("More Settings").click();
      cy.get("input[name='containers.0.limits.cpus']").retype("1");
      cy.get("input[name='containers.0.limits.mem.unlimited']").check({
        force: true,
      });

      cy.get("button").contains("Review & Run").click();
      verifyReviewScreen({
        "container-1": {
          "CPUs Limit": "1",
          "Memory Limit": "unlimited",
        },
      });
    });
  });
});
