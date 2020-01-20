require("./formChildCommands");

/**
 * Visit the specified (Routed) URL
 *
 * This function will automatically inject the authentication cookies from the
 * environment variables and visit the correct cluster URL.
 *
 * @param {String} visitUrl - The URL to visit
 */
Cypress.Commands.add("visitUrl", { prevSubject: false }, visitUrl => {
  const clusterDomain = new URL(Cypress.env("CLUSTER_URL")).host.split(":")[0];

  const url = Cypress.env("CLUSTER_URL") + "/#" + visitUrl;

  cy.setCookie("dcos-acs-auth-cookie", Cypress.env("CLUSTER_AUTH_TOKEN"), {
    httpOnly: true,
    domain: clusterDomain
  })
    .setCookie("dcos-acs-info-cookie", Cypress.env("CLUSTER_AUTH_INFO"), {
      domain: clusterDomain
    })
    .visit(url);
});
