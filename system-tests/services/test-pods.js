require("../_support/utils/ServicesUtil");
const { Timeouts } = require("../_support/constants");

describe("Services", function() {
  /**
   * Test the pods
   */
  describe("Pods", function() {
    beforeEach(function() {
      cy.visitUrl(`services/overview/%2F${Cypress.env("TEST_UUID")}/create`);
    });

    afterEach(() => {
      cy.window().then(win => {
        win.location.href = "about:blank";
      });
    });

    it("should create a simple pod", function() {
      const serviceName = "pod-with-inline-shell-script";
      const command = "while true ; do echo 'test' ; sleep 100 ;";

      cy.contains("Multi-container (Pod)").click();

      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);

      cy.get(".menu-tabbed-item").contains("container-1").click();

      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .root()
      //   .getFormGroupInputFor('CPUs *')
      //   .type('{selectall}0.1');

      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");

      cy.root().getFormGroupInputFor("Command").type(command);

      cy.get("label").contains("JSON Editor").click();

      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${Cypress.env("TEST_UUID")}/${serviceName}`,
          containers: [
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 10
              },
              exec: {
                command: {
                  shell: command
                }
              }
            }
          ],
          scaling: {
            kind: "fixed",
            instances: 1
          },
          networks: [
            {
              mode: "host"
            }
          ],
          volumes: [],
          fetch: [],
          scheduling: {
            placement: {
              constraints: []
            }
          }
        }
      ]);

      cy.get("button").contains("Review & Run").click();

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Service ID")
        .contains(`/${Cypress.env("TEST_UUID")}/${serviceName}`);

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("CPU")
        .contains("0.1 (0.1 container-1)");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains("10 MiB (10 MiB container-1)");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Supported");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("GPU")
        .contains("Not Supported");

      // per container details

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Container Image")
        .contains("Not Configured");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Force Pull On Launch")
        .contains("Not Configured");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("CPUs")
        .contains("0.1");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Memory")
        .contains("10 MiB");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Command")
        .contains(command);

      cy.get("button").contains("Run Service").click();

      cy
        .get(".page-body-content table")
        .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist");

      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .get("a.table-cell-link-primary")
        .contains(`${serviceName}`)
        .click();

      // open edit screen
      cy
        .get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Edit")
        .click();

      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .should("have.value", `/${Cypress.env("TEST_UUID")}/${serviceName}`);

      cy.get(".menu-tabbed-item").contains("container-1").click();

      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .root()
      //   .getFormGroupInputFor('CPUs *')
      //   .type('{selectall}0.1');

      cy
        .root()
        .getFormGroupInputFor("Memory (MiB) *")
        .should("have.value", "10");

      cy.root().getFormGroupInputFor("Command").contains(command);
    });

    it("should create a pod with multiple containers", function() {
      const serviceName = "pod-with-multiple-containers";
      const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

      // Select 'Multi-container (Pod)'
      cy.contains("Multi-container").click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);

      // Select first container
      cy.root().get(".menu-tabbed-item").contains("container-1").click();

      // Configure container
      cy
        .root()
        .getFormGroupInputFor("Container Name")
        .type("{selectall}first-container");
      cy.root().getFormGroupInputFor("Container Image").type("nginx");
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .root()
      //   .getFormGroupInputFor('CPUs')
      //   .type('{selectall}0.1');
      //
      cy
        .root()
        .getFormGroupInputFor("Memory (MiB) *")
        .type("{backspace}{backspace}{backspace}{backspace}10");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Go back to Service
      cy.root().get(".menu-tabbed-item").contains("Service").click();

      // Add a container
      cy.contains("Add Container").click();

      // Ensure the name changes to 'Services'
      cy.root().get(".menu-tabbed-item").contains("Services").should("exist");

      // Select second container
      cy.root().get(".menu-tabbed-item").contains("container-2").click();

      // Configure container
      cy
        .root()
        .getFormGroupInputFor("Container Name")
        .type("{selectall}second-container");
      cy.root().getFormGroupInputFor("Container Image").type("nginx");
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .root()
      //   .getFormGroupInputFor('CPUs')
      //   .type('{selectall}0.1');
      //
      cy
        .root()
        .getFormGroupInputFor("Memory (MiB) *")
        .type("{backspace}{backspace}{backspace}{backspace}10");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${Cypress.env("TEST_UUID")}/${serviceName}`,
          containers: [
            {
              name: "first-container",
              resources: {
                cpus: 0.1,
                mem: 10
              },
              image: {
                id: "nginx",
                kind: "DOCKER"
              },
              exec: {
                command: {
                  shell: cmdline
                }
              }
            },
            {
              name: "second-container",
              resources: {
                cpus: 0.1,
                mem: 10
              },
              exec: {
                command: {
                  shell: cmdline
                }
              },
              image: {
                id: "nginx",
                kind: "DOCKER"
              }
            }
          ],
          scaling: {
            kind: "fixed",
            instances: 1
          },
          networks: [
            {
              mode: "host"
            }
          ],
          volumes: [],
          fetch: [],
          scheduling: {
            placement: {
              constraints: []
            }
          }
        }
      ]);

      // Click Review and Run
      cy.contains("Review & Run").click();

      // Verify the review screen
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Service ID")
        .contains(`/${Cypress.env("TEST_UUID")}/${serviceName}`);

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("CPU")
        .contains("0.2 (0.1 first-container, 0.1 second-container)");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains("20 MiB (10 MiB first-container, 10 MiB second-container)");

      cy
        .root()
        .configurationSection("first-container")
        .configurationMapValue("Container Image")
        .contains("nginx");
      cy
        .root()
        .configurationSection("first-container")
        .configurationMapValue("CPUs")
        .contains("0.1");
      cy
        .root()
        .configurationSection("first-container")
        .configurationMapValue("Memory")
        .contains("10 MiB");
      cy
        .root()
        .configurationSection("first-container")
        .configurationMapValue("Command")
        .contains(cmdline);

      cy
        .root()
        .configurationSection("second-container")
        .configurationMapValue("Container Image")
        .contains("nginx");
      cy
        .root()
        .configurationSection("second-container")
        .configurationMapValue("CPUs")
        .contains("0.1");
      cy
        .root()
        .configurationSection("second-container")
        .configurationMapValue("Memory")
        .contains("10 MiB");
      cy
        .root()
        .configurationSection("second-container")
        .configurationMapValue("Command")
        .contains(cmdline);

      // Run service
      cy.get("button.button-primary").contains("Run Service").click();

      // Wait for the table and the service to appear
      cy
        .get(".page-body-content table")
        .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .get("a.table-cell-link-primary")
        .contains(`${serviceName}`)
        .click();

      // open edit screen
      cy
        .get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Edit")
        .click();

      // check
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .should("have.value", `/${Cypress.env("TEST_UUID")}/${serviceName}`);

      // Select first container
      cy.root().get(".menu-tabbed-item").contains("first-container").click();

      // Configure container
      cy
        .root()
        .getFormGroupInputFor("Container Name")
        .should("have.value", "first-container");

      cy
        .root()
        .getFormGroupInputFor("Container Image")
        .should("have.value", "nginx");
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .root()
      //   .getFormGroupInputFor('CPUs')
      //   .type('{selectall}0.1');
      //
      cy
        .root()
        .getFormGroupInputFor("Memory (MiB) *")
        .should("have.value", "10");

      cy.root().getFormGroupInputFor("Command").contains(cmdline);

      // Go back to Service
      cy.root().get(".menu-tabbed-item").contains("Service").click();

      // Ensure the name changes to 'Services'
      cy.root().get(".menu-tabbed-item").contains("Services").should("exist");

      // Select second container
      cy
        .root()
        .get(".menu-tabbed-item")
        .contains("second-container")
        .click({ force: true });

      // Configure container
      cy
        .root()
        .getFormGroupInputFor("Container Name")
        .should("have.value", "second-container");

      cy
        .root()
        .getFormGroupInputFor("Container Image")
        .should("have.value", "nginx");
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .root()
      //   .getFormGroupInputFor('CPUs')
      //   .type('{selectall}0.1');
      //
      cy
        .root()
        .getFormGroupInputFor("Memory (MiB) *")
        .should("have.value", "10");

      cy.root().getFormGroupInputFor("Command").contains(cmdline);
    });

    it("should create a pod with service address", function() {
      const serviceName = "pod-with-service-address";
      const command = "python3 -m http.server 8080";
      const containerImage = "python:3";

      cy.contains("Multi-container (Pod)").click();

      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);

      cy.get(".menu-tabbed-item").contains("container-1").click();

      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .root()
      //   .getFormGroupInputFor('CPUs *')
      //   .type('{selectall}0.5');

      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}32");

      cy.root().getFormGroupInputFor("Container Image").type(containerImage);

      cy.root().getFormGroupInputFor("Command").type(command);

      cy.get(".menu-tabbed-item").contains("Networking").click();

      cy
        .root()
        .getFormGroupInputFor("Network Type")
        .select("Virtual Network: dcos");

      cy.get(".button").contains("Add Service Endpoint").click();

      cy.root().getFormGroupInputFor("Container Port").type("8080");

      cy.root().getFormGroupInputFor("Service Endpoint Name").type("http");

      cy
        .get('input[name="containers.0.endpoints.0.loadBalanced"]')
        .parents(".form-control-toggle")
        .click();

      cy.get("label").contains("JSON Editor").click();

      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${Cypress.env("TEST_UUID")}/${serviceName}`,
          containers: [
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 32
              },
              endpoints: [
                {
                  name: "http",
                  containerPort: 8080,
                  hostPort: 0,
                  protocol: ["tcp"],
                  labels: {
                    VIP_0: `/${Cypress.env("TEST_UUID")}/pod-with-service-address:8080`
                  }
                }
              ],
              image: {
                id: containerImage,
                kind: "DOCKER"
              },
              exec: {
                command: {
                  shell: command
                }
              }
            }
          ],
          scaling: {
            kind: "fixed",
            instances: 1
          },
          networks: [
            {
              name: "dcos",
              mode: "container"
            }
          ],
          volumes: [],
          fetch: [],
          scheduling: {
            placement: {
              constraints: []
            }
          }
        }
      ]);

      cy.get("button").contains("Review & Run").click();

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Service ID")
        .contains(`/${Cypress.env("TEST_UUID")}/${serviceName}`);

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Instances")
        .contains("1");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("CPU")
        .contains("0.1 (0.1 container-1)");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains("32 MiB (32 MiB container-1)");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Supported");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("GPU")
        .contains("Not Supported");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Container Image")
        .contains("Not Configured");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Force Pull On Launch")
        .contains("Not Configured");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("CPUs")
        .contains("0.1");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Memory")
        .contains("32 MiB");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Command")
        .contains(command);

      cy
        .root()
        .configurationSection("Network")
        .configurationMapValue("Network Type")
        .contains("Container");

      cy
        .root()
        .configurationSection("Service Endpoints")
        .then(function($serviceEndpointsSection) {
          // Ensure the section itself exists.
          expect($serviceEndpointsSection.get().length).to.equal(1);

          const $tableCells = $serviceEndpointsSection.find(
            "tbody tr:visible td"
          );
          const cellValues = [
            "http",
            "tcp",
            "8080",
            `${Cypress.env("TEST_UUID")}${serviceName}.marathon.l4lb.thisdcos.directory:8080`,
            "container-1",
            "Edit"
          ];

          $tableCells.each(function(index) {
            expect(this.textContent.trim()).to.equal(cellValues[index]);
          });
        });

      cy.get("button").contains("Run Service").click();

      cy
        .get(".page-body-content table")
        .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist");

      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .get("a.table-cell-link-primary")
        .contains(`${serviceName}`)
        .click();

      // open edit screen
      cy
        .get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Edit")
        .click();

      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .should("have.value", `/${Cypress.env("TEST_UUID")}/${serviceName}`);

      cy.get(".menu-tabbed-item").contains("container-1").click();

      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .root()
      //   .getFormGroupInputFor('CPUs *')
      //   .type('{selectall}0.5');

      cy
        .root()
        .getFormGroupInputFor("Memory (MiB) *")
        .should("have.value", "32");

      cy
        .root()
        .getFormGroupInputFor("Container Image")
        .should("have.value", containerImage);

      cy.root().getFormGroupInputFor("Command").contains(command);

      cy.get(".menu-tabbed-item").contains("Networking").click();

      cy
        .root()
        .getFormGroupInputFor("Network Type")
        .should("have.value", "CONTAINER.dcos"); // Virtual Network: dcos

      cy
        .root()
        .getFormGroupInputFor("Container Port")
        .should("have.value", "8080");

      cy
        .root()
        .getFormGroupInputFor("Service Endpoint Name")
        .should("have.value", "http");

      // cy
      //   .get('input[name="containers.0.endpoints.0.loadBalanced"]')
      //   .parents(".form-control-toggle")
      //   .click();
    });

    it("should create a pod with artifacts", function() {
      const serviceName = "pod-with-artifacts";
      const command = "while true ; do echo 'test' ; sleep 100 ; done";

      cy.contains("Multi-container (Pod)").click();

      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);

      cy.get(".menu-tabbed-item").contains("container-1").click();

      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");

      cy.root().getFormGroupInputFor("Command").type(command);

      cy.get(".advanced-section").contains("More Settings").click();

      cy.get(".button").contains("Add Artifact").click();

      cy
        .get('input[name="containers.0.artifacts.0.uri"]')
        .type("http://lorempicsum.com/simpsons/600/400/1");

      cy.get(".button").contains("Add Artifact").click();

      cy
        .get('input[name="containers.0.artifacts.1.uri"]')
        .type("http://lorempicsum.com/simpsons/600/400/2");

      cy.get(".button").contains("Add Artifact").click();

      cy
        .get('input[name="containers.0.artifacts.2.uri"]')
        .type("http://lorempicsum.com/simpsons/600/400/3");

      cy.get("label").contains("JSON Editor").click();

      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${Cypress.env("TEST_UUID")}/${serviceName}`,
          containers: [
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 10
              },
              exec: {
                command: {
                  shell: command
                }
              },
              artifacts: [
                {
                  uri: "http://lorempicsum.com/simpsons/600/400/1"
                },
                {
                  uri: "http://lorempicsum.com/simpsons/600/400/2"
                },
                {
                  uri: "http://lorempicsum.com/simpsons/600/400/3"
                }
              ]
            }
          ],
          scaling: {
            kind: "fixed",
            instances: 1
          },
          networks: [
            {
              mode: "host"
            }
          ],
          volumes: [],
          fetch: [],
          scheduling: {
            placement: {
              constraints: []
            }
          }
        }
      ]);

      cy.get("button").contains("Review & Run").click();

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Service ID")
        .contains(`/${Cypress.env("TEST_UUID")}/${serviceName}`);

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Instances")
        .contains("1");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("CPU")
        .contains("0.1 (0.1 container-1)");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains("10 MiB (10 MiB container-1)");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Supported");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("GPU")
        .contains("Not Supported");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Container Image")
        .contains("Not Configured");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Force Pull On Launch")
        .contains("Not Configured");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("CPUs")
        .contains("0.1");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Memory")
        .contains("10 MiB");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Command")
        .contains(command);

      cy
        .root()
        .configurationSection("Container Artifacts")
        .then(function($containerArtifacts) {
          // Ensure the section itself exists.
          expect($containerArtifacts.get().length).to.equal(1);

          const $tableRows = $containerArtifacts.find("tbody tr:visible");

          expect($tableRows.get().length).to.equal(3);

          const cellValues = [
            ["http://lorempicsum.com/simpsons/600/400/1", "Edit"],
            ["http://lorempicsum.com/simpsons/600/400/2", "Edit"],
            ["http://lorempicsum.com/simpsons/600/400/3", "Edit"]
          ];

          $tableRows.each(function(rowIndex) {
            const $tableCells = cy.$(this).find("td");

            $tableCells.each(function(cellIndex) {
              expect(this.textContent.trim()).to.equal(
                cellValues[rowIndex][cellIndex]
              );
            });
          });
        });

      cy.get("button").contains("Run Service").click();

      cy.get(".page-body-content table").contains(serviceName).should("exist");

      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .get("a.table-cell-link-primary")
        .contains(`${serviceName}`)
        .click();

      // open edit screen
      cy
        .get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Edit")
        .click();

      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .should("have.value", `/${Cypress.env("TEST_UUID")}/${serviceName}`);

      cy.get(".menu-tabbed-item").contains("container-1").click();

      cy
        .root()
        .getFormGroupInputFor("Memory (MiB) *")
        .should("have.value", "10");

      cy.root().getFormGroupInputFor("Command").contains(command);

      cy.get(".advanced-section").contains("More Settings").click();

      cy
        .get('input[name="containers.0.artifacts.0.uri"]')
        .should("have.value", "http://lorempicsum.com/simpsons/600/400/1");

      cy
        .get('input[name="containers.0.artifacts.1.uri"]')
        .should("have.value", "http://lorempicsum.com/simpsons/600/400/2");

      cy
        .get('input[name="containers.0.artifacts.2.uri"]')
        .should("have.value", "http://lorempicsum.com/simpsons/600/400/3");
    });

    it("should create a pod with virtual network", function() {
      const serviceName = "pod-with-virtual-network";
      const command = "python3 -m http.server 8080";
      const containerImage = "python:3";

      cy.contains("Multi-container (Pod)").click();

      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);

      cy.get(".menu-tabbed-item").contains("container-1").click();

      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .root()
      //   .getFormGroupInputFor('CPUs *')
      //   .type('{selectall}0.5');

      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}32");

      cy.root().getFormGroupInputFor("Container Image").type(containerImage);

      cy.root().getFormGroupInputFor("Command").type(command);

      cy.get(".menu-tabbed-item").contains("Networking").click();

      cy
        .root()
        .getFormGroupInputFor("Network Type")
        .select("Virtual Network: dcos");

      cy.get(".button").contains("Add Service Endpoint").click();

      cy.root().getFormGroupInputFor("Container Port").type("8080");

      cy.root().getFormGroupInputFor("Service Endpoint Name").type("http");

      cy.get("label").contains("JSON Editor").click();

      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${Cypress.env("TEST_UUID")}/${serviceName}`,
          containers: [
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 32
              },
              endpoints: [
                {
                  name: "http",
                  containerPort: 8080,
                  hostPort: 0,
                  protocol: ["tcp"]
                }
              ],
              image: {
                id: "python:3",
                kind: "DOCKER"
              },
              exec: {
                command: {
                  shell: "python3 -m http.server 8080"
                }
              }
            }
          ],
          scaling: {
            kind: "fixed",
            instances: 1
          },
          networks: [
            {
              name: "dcos",
              mode: "container"
            }
          ],
          volumes: [],
          fetch: [],
          scheduling: {
            placement: {
              constraints: []
            }
          }
        }
      ]);

      cy.get("button").contains("Review & Run").click();

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Service ID")
        .contains(`/${Cypress.env("TEST_UUID")}/${serviceName}`);

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("CPU")
        .contains("0.1 (0.1 container-1)");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains("32 MiB (32 MiB container-1)");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Supported");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("GPU")
        .contains("Not Supported");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Container Image")
        .contains("python:3");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Force Pull On Launch")
        .contains("Not Configured");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("CPUs")
        .contains("0.1");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Memory")
        .contains("32 MiB");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Command")
        .contains(command);

      cy
        .root()
        .configurationSection("Network")
        .configurationMapValue("Network Type")
        .contains("Container");

      cy
        .root()
        .configurationSection("Service Endpoints")
        .then(function($serviceEndpointsSection) {
          const $tableRow = $serviceEndpointsSection.find("tr:visible");
          const $tableCells = $tableRow.find("td");
          const cellValues = ["http", "tcp", "8080", "container-1", "Edit"];

          expect($tableCells.length).to.equal(5);

          $tableCells.each(function(index) {
            expect(this.textContent.trim()).to.equal(cellValues[index]);
          });
        });

      cy.get("button").contains("Run Service").click();

      cy.get(".page-body-content table").contains(serviceName).should("exist");

      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .get("a.table-cell-link-primary")
        .contains(`${serviceName}`)
        .click();

      // open edit screen
      cy
        .get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Edit")
        .click();

      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .should("have.value", `/${Cypress.env("TEST_UUID")}/${serviceName}`);

      cy.get(".menu-tabbed-item").contains("container-1").click();

      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .root()
      //   .getFormGroupInputFor('CPUs *')
      //   .type('{selectall}0.5');

      cy
        .root()
        .getFormGroupInputFor("Memory (MiB) *")
        .should("have.value", "32");

      cy
        .root()
        .getFormGroupInputFor("Container Image")
        .should("have.value", containerImage);

      cy.root().getFormGroupInputFor("Command").contains(command);

      cy.get(".menu-tabbed-item").contains("Networking").click();

      // Virtual Network: dcos
      cy
        .root()
        .getFormGroupInputFor("Network Type")
        .should("have.value", "CONTAINER.dcos");

      cy
        .root()
        .getFormGroupInputFor("Container Port")
        .should("have.value", "8080");

      cy
        .root()
        .getFormGroupInputFor("Service Endpoint Name")
        .should("have.value", "http");
    });

    it("should create a pod with ephemeral volume", function() {
      const serviceName = "pod-with-ephemeral-volume";
      const command = "`while true ; do echo 'test' ; sleep 100 ; done";

      cy.contains("Multi-container (Pod)").click();

      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);

      cy.get(".menu-tabbed-item").contains("container-1").click();

      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .root()
      //   .getFormGroupInputFor('CPUs *')
      //   .type('{selectall}0.1');

      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");

      cy.root().getFormGroupInputFor("Command").type(command);

      cy.get(".menu-tabbed-item").contains("Volumes").click();

      cy.get(".button").contains("Add Volume").click();
      cy.get(".button.dropdown-toggle").click();
      cy
        .root()
        .contains(".dropdown-select-item-title", "Ephemeral Volume")
        .click();
      cy.root().getFormGroupInputFor("Name").type("test");
      cy.root().getFormGroupInputFor("Container Path").type("test");

      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${Cypress.env("TEST_UUID")}/${serviceName}`,
          containers: [
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 10
              },
              exec: {
                command: {
                  shell: command
                }
              },
              volumeMounts: [
                {
                  name: "test",
                  mountPath: "test"
                }
              ]
            }
          ],
          scaling: {
            kind: "fixed",
            instances: 1
          },
          networks: [
            {
              mode: "host"
            }
          ],
          volumes: [
            {
              name: "test"
            }
          ],
          fetch: [],
          scheduling: {
            placement: {
              constraints: []
            }
          }
        }
      ]);

      cy.get("button").contains("Review & Run").click();

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Service ID")
        .contains(`/${Cypress.env("TEST_UUID")}/${serviceName}`);

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Instances")
        .contains("1");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("CPU")
        .contains("0.1 (0.1 container-1)");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains("10 MiB (10 MiB container-1)");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Supported");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("GPU")
        .contains("Not Supported");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Container Image")
        .contains("Not Configured");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Force Pull On Launch")
        .contains("Not Configured");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("CPUs")
        .contains("0.1");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Memory")
        .contains("10 MiB");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Command")
        .contains(command);

      cy.root().configurationSection("Storage").then(function($storageSection) {
        const $tableRow = $storageSection.find("tbody tr:visible");
        const $tableCells = $tableRow.find("td");
        const cellValues = [
          "test",
          "EPHEMERAL",
          "FALSE",
          "test",
          "container-1",
          "Edit"
        ];

        expect($tableCells.length).to.equal(6);

        $tableCells.each(function(index) {
          expect(this.textContent.trim()).to.equal(cellValues[index]);
        });
      });

      cy.get("button").contains("Run Service").click();

      cy.get(".page-body-content table").contains(serviceName).should("exist");

      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .get("a.table-cell-link-primary")
        .contains(`${serviceName}`)
        .click();

      // open edit screen
      cy
        .get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Edit")
        .click();

      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .should("have.value", `/${Cypress.env("TEST_UUID")}/${serviceName}`);

      cy.get(".menu-tabbed-item").contains("container-1").click();

      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .root()
      //   .getFormGroupInputFor('CPUs *')
      //   .type('{selectall}0.1');

      cy
        .root()
        .getFormGroupInputFor("Memory (MiB) *")
        .should("have.value", "10");

      cy.root().getFormGroupInputFor("Command").should("have.value", command);

      cy.get(".menu-tabbed-item").contains("Volumes").click();

      cy.root().getFormGroupInputFor("Name").should("have.value", "test");

      cy
        .root()
        .getFormGroupInputFor("Container Path")
        .should("have.value", "test");
    });

    it("should create a pod with environment variable", function() {
      const serviceName = "pod-with-environment-variable";
      const command = "`while true ; do echo 'test' ; sleep 100 ; done";

      cy.contains("Multi-container (Pod)").click();

      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);

      cy.get(".menu-tabbed-item").contains("container-1").click();

      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .root()
      //   .getFormGroupInputFor('CPUs *')
      //   .type('{selectall}0.1');

      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");

      cy.root().getFormGroupInputFor("Command").type(command);

      cy.get(".menu-tabbed-item").contains("Environment").click();

      cy.get(".button").contains("Add Environment Variable").click();

      cy.root().get('input[name="env.0.key"]').type("camelCase");

      cy.root().get('input[name="env.0.value"]').type("test");

      cy.get(".button").contains("Add Environment Variable").click();

      cy.root().get('input[name="env.1.key"]').type("snake_case");

      cy.root().get('input[name="env.1.value"]').type("test");

      cy.get(".button").contains("Add Environment Variable").click();

      cy.root().get('input[name="env.2.key"]').type("lowercase");

      cy.root().get('input[name="env.2.value"]').type("test");

      cy.get(".button").contains("Add Environment Variable").click();

      cy.root().get('input[name="env.3.key"]').type("UPPERCASE");

      cy.root().get('input[name="env.3.value"]').type("test");

      cy.get("label").contains("JSON Editor").click();

      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${Cypress.env("TEST_UUID")}/${serviceName}`,
          containers: [
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 10
              },
              exec: {
                command: {
                  shell: command
                }
              }
            }
          ],
          scaling: {
            kind: "fixed",
            instances: 1
          },
          networks: [
            {
              mode: "host"
            }
          ],
          environment: {
            camelCase: "test",
            snake_case: "test",
            lowercase: "test",
            UPPERCASE: "test"
          },
          volumes: [],
          fetch: [],
          scheduling: {
            placement: {
              constraints: []
            }
          }
        }
      ]);

      cy.get("button").contains("Review & Run").click();

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Service ID")
        .contains(`/${Cypress.env("TEST_UUID")}/${serviceName}`);

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Instances")
        .contains("1");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("CPU")
        .contains("0.1 (0.1 container-1)");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains("10 MiB (10 MiB container-1)");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Supported");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("GPU")
        .contains("Not Supported");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Container Image")
        .contains("Not Configured");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Force Pull On Launch")
        .contains("Not Configured");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("CPUs")
        .contains("0.1");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Memory")
        .contains("10 MiB");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Command")
        .contains(command);

      cy
        .root()
        .configurationSection("Environment Variables")
        .then(function($envSection) {
          expect($envSection.get().length).to.equal(1);

          const $tableRows = $envSection.find("tbody tr:visible");
          const cellValues = [
            ["camelCase", "test", "Shared", "Edit"],
            ["snake_case", "test", "Shared", "Edit"],
            ["lowercase", "test", "Shared", "Edit"],
            ["UPPERCASE", "test", "Shared", "Edit"]
          ];

          $tableRows.each(function(rowIndex) {
            const $tableCells = cy.$(this).find("td");

            expect($tableCells.length).to.equal(4);

            $tableCells.each(function(cellIndex) {
              expect(this.textContent.trim()).to.equal(
                cellValues[rowIndex][cellIndex]
              );
            });
          });
        });

      cy.get("button").contains("Run Service").click();

      cy.get(".page-body-content table").contains(serviceName).should("exist");

      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .get("a.table-cell-link-primary")
        .contains(`${serviceName}`)
        .click();

      // open edit screen
      cy
        .get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Edit")
        .click();

      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .should("have.value", `/${Cypress.env("TEST_UUID")}/${serviceName}`);

      cy.get(".menu-tabbed-item").contains("container-1").click();

      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .root()
      //   .getFormGroupInputFor('CPUs *')
      //   .type('{selectall}0.1');

      cy
        .root()
        .getFormGroupInputFor("Memory (MiB) *")
        .should("have.value", "10");

      cy.root().getFormGroupInputFor("Command").should("have.value", command);

      cy.get(".menu-tabbed-item").contains("Environment").click();

      cy
        .root()
        .get('input[name="env.0.key"]')
        .should("have.value", "camelCase");

      cy.root().get('input[name="env.0.value"]').should("have.value", "test");

      cy
        .root()
        .get('input[name="env.1.key"]')
        .should("have.value", "snake_case");

      cy.root().get('input[name="env.1.value"]').should("have.value", "test");

      cy
        .root()
        .get('input[name="env.2.key"]')
        .should("have.value", "lowercase");

      cy.root().get('input[name="env.2.value"]').should("have.value", "test");

      cy
        .root()
        .get('input[name="env.3.key"]')
        .should("have.value", "UPPERCASE");

      cy.root().get('input[name="env.3.value"]').should("have.value", "test");
    });

    it("should create a pod with labels", function() {
      const serviceName = "pod-with-labels";
      const cmdline = "while true; do echo 'test' ; sleep 100 ; done";
      const containerName = "container-1";

      // Select 'Multi-container (Pod)'
      cy.contains("Multi-container (Pod)").click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);

      cy.get(".menu-tabbed-item").contains(containerName).click();

      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

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
          id: `/${Cypress.env("TEST_UUID")}/${serviceName}`,
          containers: [
            {
              name: containerName,
              resources: {
                cpus: 0.1,
                mem: 10
              },
              exec: {
                command: {
                  shell: cmdline
                }
              }
            }
          ],
          scaling: {
            kind: "fixed",
            instances: 1
          },
          networks: [
            {
              mode: "host"
            }
          ],
          labels: {
            camelCase: "test",
            snake_case: "test",
            lowercase: "test",
            UPPERCASE: "test"
          },
          volumes: [],
          fetch: [],
          scheduling: {
            placement: {
              constraints: []
            }
          }
        }
      ]);

      // Click Review and Run
      cy.contains("Review & Run").click();

      // Verify the review screen
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Service ID")
        .contains(`/${Cypress.env("TEST_UUID")}/${serviceName}`);

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Instances")
        .contains("1");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("CPU")
        .contains(`0.1 (0.1 ${containerName})`);

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains(`10 MiB (10 MiB ${containerName})`);

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Supported");

      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("GPU")
        .contains("Not Supported");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Container Image")
        .contains("Not Configured");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Force Pull On Launch")
        .contains("Not Configured");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("CPUs")
        .contains("0.1");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Memory")
        .contains("10 MiB");

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("Command")
        .contains(cmdline);

      cy.root().configurationSection("Labels").then(function($section) {
        expect($section.get().length).to.equal(1);

        const $tableRows = $section.find("tbody tr:visible");
        const cellValues = [
          ["camelCase", "test", "Shared", "Edit"],
          ["snake_case", "test", "Shared", "Edit"],
          ["lowercase", "test", "Shared", "Edit"],
          ["UPPERCASE", "test", "Shared", "Edit"]
        ];

        $tableRows.each(function(rowIndex) {
          const $tableCells = cy.$(this).find("td");

          expect($tableCells.length).to.equal(4);

          $tableCells.each(function(cellIndex) {
            expect(this.textContent.trim()).to.equal(
              cellValues[rowIndex][cellIndex]
            );
          });
        });
      });

      // Run service
      cy.get("button.button-primary").contains("Run Service").click();

      cy.get(".page-body-content table").contains(serviceName).should("exist");

      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .should("exist");

      // Now click on the name
      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .get("a.table-cell-link-primary")
        .contains(serviceName)
        .click();

      // open edit screen
      cy
        .get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Edit")
        .click();

      // check if values are as expected
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .should("have.value", `/${Cypress.env("TEST_UUID")}/${serviceName}`);

      cy.get(".menu-tabbed-item").contains(containerName).click();

      cy
        .root()
        .getFormGroupInputFor("Memory (MiB) *")
        .should("have.value", "10");

      cy.root().getFormGroupInputFor("Command").should("have.value", cmdline);

      // Select Environment section
      cy.root().get(".menu-tabbed-item").contains("Environment").click();

      // Check labels
      cy.get('input[name="labels.0.key"]').should("have.value", "camelCase");
      cy.get('input[name="labels.0.value"]').should("have.value", "test");

      cy.get('input[name="labels.1.key"]').should("have.value", "snake_case");
      cy.get('input[name="labels.1.value"]').should("have.value", "test");

      cy.get('input[name="labels.2.key"]').should("have.value", "lowercase");
      cy.get('input[name="labels.2.value"]').should("have.value", "test");

      cy.get('input[name="labels.3.key"]').should("have.value", "UPPERCASE");
      cy.get('input[name="labels.3.value"]').should("have.value", "test");
    });

    it.skip("should create a pod with communicating services", function() {
      const serviceName = "pod-with-communicating-services";
      const searchString = "Thank you for using nginx";

      cy.visitUrl(`services/overview/%2F${Cypress.env("TEST_UUID")}/create`);

      cy.contains("JSON Configuration").click();

      cy.get("#brace-editor").setJSON(
        `{
          "id": "/${Cypress.env("TEST_UUID")}/${serviceName}",
          "networks": [
            {
              "mode": "host"
            }
          ],
          "containers": [
            {
              "name": "nginx",
              "resources": {
                "cpus": 1.0,
                "mem": 128
              },
              "image": {
                "kind": "DOCKER",
                "id": "nginx:latest"
              }
            },
            {
              "name": "http-client",
              "resources": {
                "cpus": 1.0,
                "mem": 16
              },
              "exec": {
                "command": {
                  "shell": "while true; do curl http://localhost; sleep 3; done"
                }
              }
            }
          ],
          "volumes": [],
          "fetch": [],
          "scheduling": {
            "placement": {
              "constraints": []
            }
          }
        }`
      );

      cy.contains("Review & Run").click();
      cy.contains("button", "Run Service").click();

      cy
        .get(".page-body-content table")
        .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist")
        .as("serviceName");

      cy
        .get("@serviceName")
        .parents("tr")
        .first()
        .contains("Running", { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist");

      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .should("exist");

      cy.contains(serviceName).click();

      cy
        .contains(`${Cypress.env("TEST_UUID")}_${serviceName}`)
        .parents(".collapsing-string")
        .click();

      cy.contains("http-client").click({ force: true });

      cy.get(".menu-tabbed-item").contains("Logs").click();

      cy.contains("button", "Output (stdout)").click();

      cy.contains(searchString).should("exist");
    });
  });
});
