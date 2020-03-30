describe("Translation", () => {
  function changeEnToZh() {
    cy.visitUrl({
      url: "/dashboard",
    });
    cy.get(".sidebar-wrapper").contains("Settings").click();
    cy.contains("UI Settings").click();
    cy.contains("Edit").click();
    cy.get("button").contains("English").click();
    cy.contains("中文").click();
    cy.get("button").contains("Save").click();
  }

  beforeEach(() => {
    cy.configureCluster({
      mesos: "1-task-healthy",
    });

    changeEnToZh();

    cy.visitUrl({
      url: "/dashboard",
    });
  });

  context("zh - dashboard", () => {
    it("translates header", () => {
      cy.contains("仪表板");
    });
  });

  context("zh - sidebar", () => {
    it("translates 'Dashboard' link", () => {
      cy.get(".sidebar-wrapper").contains("仪表板");
    });
  });
});
