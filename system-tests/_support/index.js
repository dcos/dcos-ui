const { Timeouts } = require("./constants");
require("./formChildCommands");
/**
 * Visit the specified (Routed) URL
 *
 * This function will automatically inject the authentication cookies from the
 * environment variables and visit the correct cluster URL.
 *
 * @param {String} visitUrl - The URL to visit
 */
Cypress.Commands.add("visitUrl", { prevSubject: false }, function(visitUrl) {
  var clusterDomain = new URL(Cypress.env("CLUSTER_URL")).host.split(":")[0];
  var url = Cypress.env("CLUSTER_URL") + "/#" + visitUrl;

  cy
    .setCookie("dcos-acs-auth-cookie", Cypress.env("CLUSTER_AUTH_TOKEN"), {
      httpOnly: true,
      domain: clusterDomain
    })
    .setCookie("dcos-acs-info-cookie", Cypress.env("CLUSTER_AUTH_INFO"), {
      domain: clusterDomain
    })
    .visit(url);
});
/**
 * Checks that a service id abides by format: /<test-UUID>/service-name
 *
 * @param {String} id - serviceId to validate
 *
 */
function validateServiceId(id) {
  if (!id.startsWith("/")) {
    throw new Error("Must include leading slash in service id");
  }
  const idParts = id.split("/");
  if (idParts[1] !== Cypress.env("TEST_UUID")) {
    throw new Error("Service must be in the TEST_UUID group");
  }
  if (idParts.length !== 3) {
    throw new Error("Must deploy service directly in TEST_UUID group");
  }
}

/**
 * Launches a new service using the dcos CLI. Service must be created
 * directly in the TEST_UUID group. Ex: /<TEST-UUID>/test-service
 *
 * @param {Object} serviceDefinition - The service JSON definition file
 *
 */
export function createService(serviceDefinition) {
  validateServiceId(serviceDefinition.id);
  const serviceName = serviceDefinition.id.split("/").pop();

  cy.exec(
    `echo '${JSON.stringify(serviceDefinition)}' | dcos marathon app add`
  );
  cy.visitUrl(`services/overview/%2F${Cypress.env("TEST_UUID")}`);
  cy
    .get(".page-body-content table", {
      timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT
    })
    .contains(serviceName, {
      timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT
    })
    .should("exist");
  cy
    .get(".page-body-content table")
    .getTableRowThatContains(serviceName)
    .contains("Running", { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
    .should("exist");
}

/**
 * Deletes a service from group TEST_UUID using the dcos CLI.
 *
 * @param {String} serviceId - The service id which it will delete
 *
 */
export function deleteService(serviceId) {
  validateServiceId(serviceId);
  const serviceName = serviceId.split("/").pop();

  cy.exec(`dcos marathon app remove ${serviceId}`);
  cy.visitUrl(`services/overview/%2F${Cypress.env("TEST_UUID")}`);
  cy.get(".page-body-content table").contains(serviceName).should("not.exist");
}
