describe("Nodes Page", function() {
  context("Nodes table", function() {
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
        cy.get("@hostnames")
          .should("contain", "dcos-01")
          .should("contain", "167.114.218.155")
          .should("contain", "167.114.218.156");
      });

      it("shows only healthy node", function() {
        cy.get(".filter-input-text").as("filterInputText");
        cy.get("@filterInputText").type("is:healthy");

        cy.get("@hostnames")
          .should("not.contain", "dcos-01")
          .should("not.contain", "167.114.218.156")
          .should("contain", "167.114.218.155");
      });

      it("shows only unhealthy node", function() {
        cy.get(".filter-input-text").as("filterInputText");
        cy.get("@filterInputText").type("is:unhealthy");

        cy.get("@hostnames")
          .should("not.contain", "dcos-01")
          .should("not.contain", "167.114.218.155")
          .should("contain", "167.114.218.156");
      });

      it("shows only draining nodes", function() {
        cy.get(".filter-input-text").as("filterInputText");
        cy.get("@filterInputText").type("status:draining");

        cy.get("@hostnames")
          .should("not.contain", "dcos-01")
          .should("not.contain", "167.114.218.156")
          .should("contain", "167.114.218.155");
      });

      it("shows only nodes with service", function() {
        cy.get("@filterBar")
          .contains("Filter by Framework")
          .click();
        cy.get(".dropdown-menu")
          .contains("cassandra-healthy")
          .click();

        cy.get("@hostnames")
          .should("not.contain", "167.114.218.156")
          .should("not.contain", "167.114.218.155")
          .should("contain", "dcos-01");
      });

      it("shows only private nodes", function() {
        cy.get(".filter-input-text").as("filterInputText");
        cy.get("@filterInputText").type("is:private");

        cy.get("@hostnames")
          .should("contain", "dcos-01")
          .should("contain", "167.114.218.156")
          .should("contain", "167.114.218.155");
      });

      it("shows only public nodes", function() {
        cy.get(".filter-input-text").as("filterInputText");
        cy.get("@filterInputText").type("is:public");

        cy.get("@hostnames")
          .should("not.contain", "dcos-01")
          .should("not.contain", "167.114.218.156")
          .should("not.contain", "167.114.218.155");
      });

      it("preserves the filter when switch to grid and back", function() {
        cy.get(".filter-input-text").as("filterInputText");
        cy.get("@filterInputText").type("is:unhealthy");

        cy.get(".filter-bar").as("filterBar");
        cy.get("@filterBar")
          .contains("Grid")
          .click();
        cy.get(".nodes-grid-dials-item").should("have.length", 1);

        cy.get("@filterBar")
          .contains("List")
          .click();

        cy.get("@hostnames")
          .should("not.contain", "dcos-01")
          .should("not.contain", "167.114.218.155")
          .should("contain", "167.114.218.156");
      });

      context("Filters by Framework", function() {
        function selectFramework(framework) {
          cy.get(".dropdown-toggle")
            .contains("Filter by Framework")
            .click();
          cy.get("a")
            .contains(framework)
            .click();
        }
        it("filters correctly for cassandra-healthy", function() {
          selectFramework("cassandra-healthy");
          cy.get("@hostnames")
            .should("contain", "dcos-01")
            .should("not.contain", "167.114.218.156")
            .should("not.contain", "167.114.218.155");
          cy.get(".flush")
            .contains("Showing 1 of 3 Nodes")
            .should("exist");
        });

        it("filters correctly for cassandra-na", function() {
          selectFramework("cassandra-na");
          cy.get("@hostnames")
            .should("not.contain", "dcos-01")
            .should("not.contain", "167.114.218.156")
            .should("not.contain", "167.114.218.155");
          cy.get(".flush")
            .contains("Showing 0 of 3 Nodes")
            .should("exist");
        });

        it("clears the filter when clicking Clear", function() {
          selectFramework("cassandra-healthy");
          cy.get(".small")
            .contains("(Clear)")
            .click();
          cy.get(".flush")
            .contains("3 Nodes")
            .should("exist");
        });

        it("clears the filter when clicking All Frameworks", function() {
          selectFramework("cassandra-healthy");
          cy.get(".dropdown-toggle")
            .contains("cassandra-healthy")
            .click();
          cy.get("a")
            .contains("All Frameworks")
            .click();
          cy.get(".flush")
            .contains("3 Nodes")
            .should("exist");
        });
      });
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
      cy.get("@filterBar")
        .contains("Grid")
        .click();

      cy.get(".nodes-grid-dials")
        .should("contain", "3%")
        .should("contain", "13%")
        .should("contain", "1%");
    });

    context("On nodes grid", function() {
      beforeEach(function() {
        cy.visitUrl({ url: "/nodes/agents/grid" });
      });

      it("can switch resources", function() {
        const resources = ["Mem", "Disk", "CPU"];

        resources.forEach(resource => {
          cy.get(".resource-switch-trigger").click();
          cy.get(".resource-switch-dropdown-menu-list")
            .contains(resource)
            .click();

          cy.get(".nodes-grid-dials").should("contain", resource);
        });
      });

      context("Filters nodes grid", function() {
        beforeEach(function() {
          cy.get(".filter-bar").as("filterBar");
        });

        it("shows only cassandra-healthy nodes", function() {
          cy.get("@filterBar")
            .contains("Filter by Framework")
            .click();
          cy.get(".dropdown-menu")
            .contains("cassandra-healthy")
            .click();

          cy.get(".nodes-grid-dials")
            .should("contain", "3%")
            .should("not.contain", "5%")
            .should("not.contain", "19%");
        });

        it("doesn't display any nodes", function() {
          cy.get("@filterBar")
            .contains("Filter by Framework")
            .click();
          cy.get(".dropdown-menu")
            .contains("cassandra-na")
            .click();

          cy.get(".nodes-grid-dials")
            .should("not.contain", "3%")
            .should("not.contain", "5%")
            .should("not.contain", "19%");
        });

        it("shows only unhealthy node", function() {
          cy.get("@filterBar")
            .contains("Filter by Framework")
            .click();
          cy.get(".dropdown-menu")
            .contains("cassandra-unhealthy")
            .click();
          cy.get(".filter-input-text").as("filterInputText");
          cy.get("@filterInputText").type("is:healthy");

          cy.get(".nodes-grid-dials")
            .should("contain", "13%")
            .should("not.contain", "19%");
        });
      });

      context("Without nodes", function() {
        beforeEach(function() {
          cy.configureCluster({
            mesos: "no-agents"
          });
        });

        it("shows an empty page", function() {
          cy.get("body").contains("No nodes detected");
        });
      });
    });
  });
});
