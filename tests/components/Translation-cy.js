describe("Translation", function() {
  function changeEnToZh() {
    cy.visitUrl({
      url: "/dashboard"
    });
    cy.get(".sidebar-wrapper")
      .contains("Settings")
      .click();
    cy.contains("UI Settings").click();
    cy.contains("Edit").click();
    cy.get("button")
      .contains("English")
      .click();
    cy.contains("中文").click();
    cy.get("button")
      .contains("Save")
      .click();
  }

  beforeEach(function() {
    cy.configureCluster({
      mesos: "1-task-healthy"
    });

    changeEnToZh();

    cy.visitUrl({
      url: "/dashboard"
    });
  });

  context("zh - dashboard", function() {
    it("translates header", function() {
      cy.contains("仪表板");
    });
  });

  context("zh - sidebar", function() {
    it("translates 'Dashboard' link", function() {
      cy.get(".sidebar-wrapper").contains("仪表板");
    });
  });
});
