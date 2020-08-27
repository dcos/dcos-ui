describe("DC/OS UI [00j]", () => {
  beforeEach(() => {
    cy.configureCluster({
      mesos: "1-task-healthy",
      nodeHealth: true,
    }).visitUrl({ url: "/", identify: true });
  });

  context("Dashboard [00k]", () => {
    beforeEach(() => {
      cy.get(".sidebar-menu-item").contains("Dashboard").click({ force: true });
    });

    it("can change hash to dashboard page [00l]", () => {
      cy.hash().should("match", /dashboard/);
    });

    it("has eight panels [00m]", () => {
      cy.get("#application").find(".panel").should("have.length", 8);
    });
  });

  xcontext("Services [00n]", () => {
    beforeEach(() => {
      cy.get(".sidebar-menu-item").contains("Services").click();
      cy.get("table tbody tr").as("tableRows");
    });

    it("can change hash to services page [00o]", () => {
      cy.hash().should("match", /services/);
    });

    it("displays one row on the table [00p]", () => {
      cy.get("@tableRows").should("have.length", 3);
    });

    it("doesn't list marathon in the table [00q]", () => {
      cy.get("table tbody tr").should("not.contain", "marathon");
    });
  });

  context("Nodes [00r]", () => {
    beforeEach(() => {
      cy.get(".sidebar-menu-item").contains("Nodes").click({ force: true });
    });

    it("can change hash to nodes page [00s]", () => {
      cy.hash().should("match", /nodes/);
    });

    it("displays one row on the table [00t]", () => {
      cy.get(
        ".BottomLeftGrid_ScrollWrapper .ReactVirtualized__Grid__innerScrollContainer a"
      )
        .should("have.length", 4)
        .contains("dcos-01");
    });
  });
});
