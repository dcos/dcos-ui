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

    it("Create a simple pod", function() {
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
          ]
        }
      ]);

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
          ]
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

      cy
        .root()
        .configurationSection("Containers")
        .configurationMapValue("CPUs")
        .contains("0.1");

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
        .should("exist");
    });

    it("Create a pod with multiple containers", function() {
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
          ]
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
      //
      // TODO: Uncomment this when this gets merged
      //
      // cy
      //   .root()
      //   .configurationSection('General')
      //   .configurationMapValue('CPU')
      //   .contains('0.2 (0.1 first-container, 0.1 second-container)');
      // cy
      //   .root()
      //   .configurationSection('General')
      //   .configurationMapValue('Memory')
      //   .contains('20 MiB (10 MiB first-container, 10 MiB second-container)');
      //

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
        .should("exist");
    });

    it("Create a pod with service address", function() {
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
          ]
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
        .then(function($serviceEndpoitnsSection) {
          // Ensure the section itself exists.
          expect($serviceEndpoitnsSection.get().length).to.equal(1);

          const $tableCells = $serviceEndpoitnsSection.find(
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
        .should("exist");
    });

    it("Create a pod with artifacts", function() {
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
          ]
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
        .should("exist");
    });
  });
});
