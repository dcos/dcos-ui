describe("Install Package Modal", function() {
  beforeEach(function() {
    cy
      .configureCluster({
        mesos: "1-task-healthy",
        universePackages: true
      })
      .visitUrl({ url: "/universe" })
      .get(".page-body-content .button.button-success")
      .eq(0)
      .click();
  });

  it("displays install modal for package", function() {
    cy.get(".modal .modal-body").should("contain", "marathon");
  });
});
