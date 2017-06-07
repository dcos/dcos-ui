require("../_support/utils/ServicesUtil");

describe("Services", function() {
  /**
   * Test the pods
   */
  describe("External Volumes", function() {
    afterEach(() => {
      cy.window().then(win => {
        win.location.href = "about:blank";
      });
    });

    it("should be persistent after suspension in single container services", function() {
      cy.visitUrl(
        `services/detail/%2F${Cypress.env("TEST_UUID")}%2Fexternal-volumes-single`
      );

      // link is partly covered by another one, so we have to force it.
      cy
        .contains(`${Cypress.env("TEST_UUID")}_external-volumes-single`)
        .click({ force: true });

      cy.contains("Logs").click();

      cy.contains(`TEST_OUTPUT_${Cypress.env("TEST_UUID")}`);

      cy.visitUrl(
        `services/detail/%2F${Cypress.env("TEST_UUID")}%2Fexternal-volumes-single`
      );

      cy
        .get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Suspend")
        .click();

      cy.root().contains("button", "Suspend Service").click();

      cy
        .get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Resume")
        .click();

      cy.contains("button", "Resume Service").click();

      // link is partly covered by another one, so we have to force it.
      cy
        .contains(`${Cypress.env("TEST_UUID")}_external-volumes-single`)
        .click({ force: true });

      cy.contains("Logs").click();

      cy.contains(
        `TEST_OUTPUT_${Cypress.env("TEST_UUID")}\nTEST_OUTPUT_${Cypress.env("TEST_UUID")}`
      );
    });
  });
});
