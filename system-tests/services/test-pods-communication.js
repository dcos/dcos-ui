require("../_support/utils/ServicesUtil");

describe("Services", function() {
  /**
   * Test the pods
   */
  describe("Pods", function() {
    afterEach(() => {
      cy.window().then(win => {
        win.location.href = "about:blank";
      });
    });

    it("should be able to communicate with eachother", function() {
      const serviceName = 'pods-communication-simple'
      cy.visitUrl(
        `services/overview/%2F${Cypress.env("TEST_UUID")}/create`
      );

      cy
        .contains("JSON Configuration")
        .click();

      cy.get("#brace-editor").setJSON(`{
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
        "id": "nginx:latest",
        "forcePull": false
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
  ]
}`);

      cy.contains("Review & Run").click();
      cy.contains("button", "Run Service").click();

      cy.visitUrl(
        `services/overview/%2F${Cypress.env("TEST_UUID")}%2F${serviceName}`
      );

      // link is partly covered by another one, so we have to force it.
      cy
        .contains(`${Cypress.env("TEST_UUID")}_${serviceName}`)
        .click({ force: true });

      cy.contains("http-client").click({force:true});

      cy.contains("Logs").click();

      cy.contains("Thank you for using nginx").should('exist');
    });
  });
});
