const compareVersions = require("compare-versions");

// strict will make this function fail in case there's no app to delete.
function deleteApp(name, { strict = true } = {}) {
  cy.visitUrl(`services/detail/%2F${name}/tasks`);
  cy.contains(name);
  cy.wait(2000);

  cy.get("body").then(($body) => {
    if (!strict && $body.text().includes("Service not found")) {
      return;
    }

    cy.get(".page-header-actions .dropdown").click();
    cy.contains("Delete").click();
    cy.get(".modal-body input").type(name);
    cy.get(".modal-footer").contains("Delete Service").click();

    // we've got a race condition here: when the deletion finished, it'll send us to the table view.
    // we thus just wait for 2 seconds for the deletion to be done here.
    cy.wait(2000);
    cy.visitUrl(`services/detail/%2F${name}/tasks`);
    cy.contains("Service not found");
  });
}

function configureApp({
  cmd = "while true; do echo 'test' ; sleep 100 ; done",
  cpus = "0.5",
  mem = "128",
  image = "python:3",
  serviceName,
}) {
  cy.visitUrl(`services/overview/create`);
  cy.contains("Run a Service");
  cy.contains("Single Container").click();
  cy.contains("More Settings").click();

  cy.get("input[name=cpus]").retype(cpus);
  cy.get("input[name=id]").retype(serviceName);
  cy.get("input[name=mem]").retype(mem);
  cy.get("textarea[name=cmd]").retype(cmd);
  cy.getFormGroupInputFor("Container Image").type(image);
}

describe("Services", () => {
  /**
   * Test the applications
   */
  describe("Applications", () => {
    it("creates a reasonably complex app", () => {
      const serviceName = "my-app";
      deleteApp(serviceName, { strict: false });
      configureApp({ serviceName });

      // ARTIFACTS
      cy.contains("Add Artifact").click();
      cy.get('input[name="fetch.0.uri"]').type(
        "http://lorempicsum.com/simpsons/600/400/1"
      );
      cy.contains("Add Artifact").click();
      cy.get('input[name="fetch.1.uri"]').type(
        "http://lorempicsum.com/simpsons/600/400/2"
      );

      // Click "Add Service Endpoint"
      cy.get(".menu-tabbed-item").contains("Networking").click();
      cy.getFormGroupInputFor("Network Type").select("Bridge");
      cy.contains("Add Service Endpoint").click();
      cy.getFormGroupInputFor("Container Port").type("8080");
      cy.getFormGroupInputFor("Service Endpoint Name").type("http");

      // Add an environment variables
      cy.get(".menu-tabbed-item").contains("Environment").click();
      cy.contains("Add Environment Variable").click();
      cy.get('input[name="env.0.key"]').type("camelCase");
      cy.get('input[name="env.0.value"]').type("test");
      cy.contains("Add Environment Variable").click();
      cy.get('input[name="env.1.key"]').type("snake_case");
      cy.get('input[name="env.1.value"]').type("test");
      cy.contains("Add Environment Variable").click();
      cy.get('input[name="env.2.key"]').type("lowercase");
      cy.get('input[name="env.2.value"]').type("test");
      cy.contains("Add Environment Variable").click();
      cy.get('input[name="env.3.key"]').type("UPPERCASE");
      cy.get('input[name="env.3.value"]').type("test");

      cy.contains("Add Label").click();
      cy.get('input[name="labels.0.key"]').type("camelCase");
      cy.get('input[name="labels.0.value"]').type("test");

      // Select Volumes section
      cy.get(".menu-tabbed-item").contains("Volumes").click();
      cy.contains("Add Volume").click();
      cy.get(".button.dropdown-toggle").click();
      cy.contains(
        ".dropdown-select-item-title",
        "Local Persistent Volume"
      ).click();
      cy.getFormGroupInputFor("Size (MiB)").type("128");
      cy.getFormGroupInputFor("Container Path").type("test");

      // Check JSON view (it could crash due to JS-errors)
      cy.contains("JSON Editor").click();

      // Run service
      cy.get("button.button-primary").contains("Review & Run").click();
      cy.get("button.button-primary").contains("Run Service").click();

      // Wait for the table and the service to appear
      cy.get(".page-body-content .service-table").contains(serviceName);
      cy.get("a.table-cell-link-primary").contains(serviceName).click();

      // open edit screen
      cy.get(".page-header-actions .dropdown").click();
      cy.get(".dropdown-menu-items").contains("Edit").click();

      // //////////////////////////////////////////////////////////////////////
      //                             CHECK VALUES                            //
      // //////////////////////////////////////////////////////////////////////
      cy.getFormGroupInputFor("Service ID *").should(
        "have.value",
        `/${serviceName}`
      );

      cy.getFormGroupInputFor("CPUs *").contents("equal", "0.5");
      cy.getFormGroupInputFor("Memory (MiB) *").should("have.value", "128");
      cy.getFormGroupInputFor("Container Image").should(
        "have.value",
        "python:3"
      );

      cy.get('input[name="fetch.0.uri"]').should(
        "have.value",
        "http://lorempicsum.com/simpsons/600/400/1"
      );

      cy.get('input[name="fetch.1.uri"]').should(
        "have.value",
        "http://lorempicsum.com/simpsons/600/400/2"
      );

      // Check Networking section
      cy.get(".menu-tabbed-item").contains("Networking").click();
      cy.getFormGroupInputFor("Network Type").should("have.value", "BRIDGE");
      cy.getFormGroupInputFor("Container Port").should("have.value", "8080");
      cy.getFormGroupInputFor("Service Endpoint Name").should(
        "have.value",
        "http"
      );

      // Check Environment section
      cy.get(".menu-tabbed-item").contains("Environment").click();
      cy.get('input[name="env.0.key"]').should("have.value", "camelCase");
      cy.get('input[name="env.0.value"]').should("have.value", "test");
      cy.get('input[name="env.1.key"]').should("have.value", "snake_case");
      cy.get('input[name="env.1.value"]').should("have.value", "test");
      cy.get('input[name="env.2.key"]').should("have.value", "lowercase");
      cy.get('input[name="env.2.value"]').should("have.value", "test");
      cy.get('input[name="env.3.key"]').should("have.value", "UPPERCASE");
      cy.get('input[name="env.3.value"]').should("have.value", "test");

      cy.get('input[name="labels.0.key"]').should("have.value", "camelCase");
      cy.get('input[name="labels.0.value"]').should("have.value", "test");

      // Check volumes section
      cy.get(".menu-tabbed-item").contains("Volumes").click();
      cy.getFormGroupInputFor("Volume Type").should("have.value", "PERSISTENT");
      cy.getFormGroupInputFor("Size (MiB)").should("have.value", "128");
      cy.getFormGroupInputFor("Container Path").should("have.value", "test");

      // //////////////////////////////////////////////////////////////////////
      //                    FAILS TO CREATE SAME APP AGAIN                   //
      // //////////////////////////////////////////////////////////////////////
      configureApp({ serviceName });
      cy.get("button.button-primary").contains("Review & Run").click();
      cy.get("button.button-primary").contains("Run Service").click();
      cy.contains(`An app with id [/${serviceName}] already exists.`);

      // shut down app
      deleteApp(serviceName);
    });

    it("creates an app with virtual network", () => {
      const serviceName = "app-with-virtual-network";
      deleteApp(serviceName, { strict: false });
      const cmd = "python3 -m http.server 8080";

      configureApp({ serviceName, cmd });

      cy.get(".menu-tabbed-item").contains("Networking").click();
      cy.getFormGroupInputFor("Network Type").select("Virtual Network: dcos");
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
      cy.getFormGroupInputFor("Host Port").type("4200");

      cy.get("button").contains("Review & Run").click();
      cy.get("button").contains("Run Service").click();

      cy.get(".page-body-content .service-table").contains(serviceName);

      deleteApp(serviceName);
    });
    describe("Vertical Bursting", () => {
      if (compareVersions(Cypress.env("CLUSTER_VERSION"), "2.1.0") > 0) {
        it("persists resource limits settings", () => {
          const serviceName = "resource-limit";
          deleteApp(serviceName, { strict: false });
          configureApp({
            serviceName,
            image: "alpine",
            cmd: "while true; do sleep 10000; done;",
          });

          cy.get("[name='limits.cpus']").type("1");
          cy.get("[name='limits.mem']").type("256");

          cy.get("label").contains("JSON Editor").click();

          cy.get("button").contains("Review & Run").click();
          cy.get("button").contains("Run Service").click();

          cy.get(".page-body-content .service-table").contains(serviceName);
          cy.contains(serviceName).click();
          cy.contains("Edit").click();

          cy.get("[name='limits.cpus']").should("have.value", "1");
          cy.get("[name='limits.mem']").should("have.value", "256");
        });
      } else {
        it("is not present", () => {
          cy.visitUrl(`services/overview/create`);
          cy.contains("Run a Service");
          cy.contains("Single Container").click();
          cy.contains("More Settings").click();
          cy.contains("Limits").should("not.exist");
        });
      }
    });
  });
});
