describe("DC/OS UI [00j]", function() {
  beforeEach(function() {
    cy
      .configureCluster({
        mesos: "1-task-healthy"
      })
      .visitUrl({ url: "/", identify: true, fakeAnalytics: true });
  });

  context("Dashboard [00k]", function() {
    beforeEach(function() {
      cy.get(".sidebar-menu-item").contains("Dashboard").click();
    });

    it("can change hash to dashboard page [00l]", function() {
      cy.hash().should("match", /dashboard/);
    });

    it("has six panels [00m]", function() {
      cy.get("#application").find(".panel").should("to.have.length", 7);
    });
  });

  xcontext("Services [00n]", function() {
    beforeEach(function() {
      cy.get(".sidebar-menu-item").contains("Services").click();
      cy.get("table tbody tr").as("tableRows");
    });

    it("can change hash to services page [00o]", function() {
      cy.hash().should("match", /services/);
    });

    it("should display one row on the table [00p]", function() {
      cy.get("@tableRows").should("to.have.length", 3);
    });

    it("should not list marathon in the table [00q]", function() {
      cy.get("table tbody tr").should("not.contain", "marathon");
    });
  });

  context("Nodes [00r]", function() {
    beforeEach(function() {
      cy.get(".sidebar-menu-item").contains("Nodes").click();
    });

    it("can change hash to nodes page [00s]", function() {
      cy.hash().should("match", /nodes/);
    });

    it("should display one row on the table [00t]", function() {
      cy.get("table tbody tr").should("to.have.length", 3).contains("dcos-01");
    });
  });
});
