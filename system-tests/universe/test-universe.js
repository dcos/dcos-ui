describe("Universe", function() {
  afterEach(() => {
    cy.window().then(win => {
      win.location.href = "about:blank";
    });
  });

  it("installs a certified package", function() {
    // Visit universe
    cy.visitUrl("universe");

    // Click 'Find a the kafka package'
    cy.contains("confluent-kafka").click();

    // Check that this package is certified
    cy.contains("Certified");

    // Click the easy deploy
    cy.contains("Deploy").click();

    // Wait for the new service to deploy
    cy.get(".modal").contains("Success");
    cy.get(".modal").contains("Go To Service").click();
  });

  it("installs a community package", function() {
    // Visit universe
    cy.visitUrl("universe");

    // Click 'Find a the kafka package'
    cy.contains("bitbucket").click();

    // Check that this package is certified
    cy.contains("Community");

    // Click the easy deploy
    cy.contains("Deploy").click();

    // Wait for the new service to deploy
    cy.get(".modal").contains("Success");
    cy.get(".modal").contains("Go To Service").click();
  });

  it("uses advanced install to deploy a certified package", function() {
    const packageName = "confluent-kafka";
    const serviceName = `${Cypress.env("TEST_UUID")}-${packageName}`;

    // Visit universe
    cy.visitUrl("universe");

    // Click 'Find a the kafka package'
    cy.contains(packageName).click();

    // Check that this package is certified
    cy.contains("Certified");

    cy.contains("Configure").click();

    // Find name input
    cy.get(".modal input[name=name]").clear().type(serviceName);

    // Wait for the new service to deploy
    cy.get(".modal").contains("Review and Deploy").click();
    cy.get(".modal").contains("Deploy").click();
    cy.get(".modal").contains("Go To Service").click();
  });

  it("uses advanced install to deploy a community package", function() {
    const packageName = "bitbucket";
    const serviceName = `${Cypress.env("TEST_UUID")}-${packageName}`;

    // Visit universe
    cy.visitUrl("universe");

    // Click 'Find a the kafka package'
    cy.contains(packageName).click();

    // Check that this package is certified
    cy.contains("Community");

    cy.contains("Configure").click();

    // Find name input
    cy.get(".modal input[name=name]").clear().type(serviceName);

    // Wait for the new service to deploy
    cy.get(".modal").contains("Review and Deploy").click();
    cy.get(".modal").contains("Deploy").click();
    cy.get(".modal").contains("Go To Service").click();
  });
});
