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

    context("Node Actions", function() {
      function openDropdown(ipAddress) {
        cy.get(".filter-input-text")
          .type("{selectall}{backspace}")
          .type("{selectall}{backspace}")
          .type("{selectall}{backspace}")
          .type(ipAddress); // filter to find the correct service
        cy.get(".form-control-group-add-on")
          .eq(-1)
          .click(); // close filter window
        cy.wait(2000); // wait for data to load
        cy.get(".ReactVirtualized__Grid")
          .eq(-1) // bottom right grid
          .scrollTo("right"); // scroll to the actions column
        cy.get(".actions-dropdown").should("not.to.have.length", 0);
        cy.get(".actions-dropdown")
          .eq(0)
          .click();
      }

      function clickDropdownAction(actionText) {
        cy.get(".dropdown-menu-items")
          .contains(actionText)
          .click();
      }

      beforeEach(function() {
        cy.configureCluster({
          mesos: "1-for-each-health",
          nodeHealth: true
        });
        cy.visitUrl({ url: "/nodes" });
      });

      it("active nodes can be drained via action", function() {
        cy.route({
          method: "POST",
          url: /\/mesos\/api\/v1/,
          response: []
        });

        openDropdown("167.114.218.156");
        clickDropdownAction("Drain");

        cy.get(".modal").should("contain", "Max Grace Period");

        cy.get(".modal .button-primary")
          .should("contain", "Drain")
          .click();

        cy.get(".modal").should("to.have.length", 0);
      });

      it("active nodes can be deactivated via action", function() {
        cy.route({
          method: "POST",
          url: /\/mesos\/api\/v1/,
          response: []
        });

        openDropdown("167.114.218.156");
        clickDropdownAction("Deactivate");

        cy.get(".modal").should("contain", "Deactivate");

        cy.get(".modal .button-danger")
          .should("contain", "Deactivate")
          .click();

        cy.get(".modal").should("to.have.length", 0);
      });

      it("draining nodes can be reactivated via action", function() {
        cy.route({
          method: "POST",
          url: /\/mesos\/api\/v1/,
          response: []
        });

        openDropdown("167.114.218.155");
        clickDropdownAction("Reactivate");
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
