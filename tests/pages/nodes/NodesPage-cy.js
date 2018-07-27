describe("Nodes Page", function() {
  context("Filters nodes table", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-for-each-health",
        nodeHealth: true
      });
      cy.visitUrl({ url: "/nodes" });
      cy.get(".BottomLeftGrid_ScrollWrapper").as("hostnames");
      cy.get(".filter-bar").as("filterBar");
    });

    it("shows all nodes", function() {
      cy
        .get("@hostnames")
        .should("contain", "dcos-01")
        .should("contain", "167.114.218.155")
        .should("contain", "167.114.218.156");
    });

    it("shows only healthy node", function() {
      cy.get(".filter-input-text").as("filterInputText");
      cy.get("@filterInputText").type("is:healthy");

      cy
        .get("@hostnames")
        .should("not.contain", "dcos-01")
        .should("not.contain", "167.114.218.156")
        .should("contain", "167.114.218.155");
    });

    it("shows only unhealthy node", function() {
      cy.get(".filter-input-text").as("filterInputText");
      cy.get("@filterInputText").type("is:unhealthy");

      cy
        .get("@hostnames")
        .should("not.contain", "dcos-01")
        .should("not.contain", "167.114.218.155")
        .should("contain", "167.114.218.156");
    });

    it("shows only nodes with service", function() {
      cy.get("@filterBar").contains("Filter by Service").click();
      cy.get(".dropdown-menu").contains("cassandra-healthy").click();

      cy
        .get("@hostnames")
        .should("not.contain", "167.114.218.156")
        .should("not.contain", "167.114.218.155")
        .should("contain", "dcos-01");
    });
  });

  context("Nodes grid", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-for-each-health",
        nodeHealth: true
      });
    });

    it("navigates to grid", function() {
      // Navigate to the grid using button
      cy.visitUrl({ url: "/nodes" });
      cy.get(".filter-bar").as("filterBar");
      cy.get("@filterBar").contains("Grid").click();

      cy
        .get(".nodes-grid-dials")
        .should("contain", "3%")
        .should("contain", "13%")
        .should("contain", "1%");
    });

    context("Filters nodes grid", function() {
      beforeEach(function() {
        cy.visitUrl({ url: "/nodes/grid" });
        cy.get(".filter-bar").as("filterBar");
      });

      it("shows only cassandra-healthy nodes", function() {
        cy.get("@filterBar").contains("Filter by Service").click();
        cy.get(".dropdown-menu").contains("cassandra-healthy").click();

        cy
          .get(".nodes-grid-dials")
          .should("contain", "3%")
          .should("not.contain", "5%")
          .should("not.contain", "19%");
      });

      it("doesn't display any nodes", function() {
        cy.get("@filterBar").contains("Filter by Service").click();
        cy.get(".dropdown-menu").contains("cassandra-na").click();

        cy
          .get(".nodes-grid-dials")
          .should("not.contain", "3%")
          .should("not.contain", "5%")
          .should("not.contain", "19%");
      });

      it("shows only unhealthy node", function() {
        cy.get("@filterBar").contains("Filter by Service").click();
        cy.get(".dropdown-menu").contains("cassandra-unhealthy").click();
        cy.get(".filter-input-text").as("filterInputText");
        cy.get("@filterInputText").type("is:healthy");

        cy
          .get(".nodes-grid-dials")
          .should("contain", "13%")
          .should("not.contain", "19%");
      });
    });
  });
});
