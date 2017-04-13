describe("Install Package Modal", function() {
  beforeEach(function() {
    cy
      .configureCluster({
        mesos: "1-task-healthy",
        universePackages: true
      })
      .visitUrl({ url: "/universe" })
      .get(".page-body-content .panel-content .h6")
      .contains("arangodb")
      .eq(0)
      .click();

    cy.get(".button.button-success").contains("Deploy").click();
  });

  it("displays install modal for package", function() {
    cy.get(".modal .modal-body").should("contain", "marathon");
  });
});
