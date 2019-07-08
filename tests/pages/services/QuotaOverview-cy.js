describe("Quota Tab", function() {
  context("No quota set", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-task-healthy-with-region",
        nodeHealth: true
      });
    });

    it("Shows the quota tab", function() {
      cy.visitUrl({ url: "/services/overview" });
      cy.get(".menu-tabbed-item-label-text")
        .contains("Quota")
        .click();
    });

    it("Shows the no quota message", function() {
      cy.visitUrl({ url: "/services/quota" });
      cy.get(".panel-content")
        .contains("No quota defined")
        .should("exist");
    });

    it("Shows a working back to services button", function() {
      cy.visitUrl({ url: "/services/quota" });
      cy.get(".button-primary")
        .contains("Back to Services")
        .click();
      cy.get(".service-table").should("exist");
    });
  });

  context("Quota set", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-task-healthy-with-quota",
        nodeHealth: true
      });
      cy.visitUrl({ url: "/services/quota" });
    });

    function getFirstRowName(name) {
      cy.get(".ReactVirtualized__Grid")
        .eq(2)
        .children()
        .first()
        .children()
        .first()
        .contains(name);
    }

    function getSecondRowName(name) {
      cy.get(".ReactVirtualized__Grid")
        .eq(2)
        .children()
        .first()
        .children()
        .last()
        .contains(name);
    }

    function clickHeading(name) {
      cy.get(".TopRightGrid_ScrollWrapper")
        .contains(name)
        .click();
    }

    it("Shows the quota table", function() {
      cy.get(".quota-table").should("exist");
    });

    it("Shows the correct headings", function() {
      cy.get(".ReactVirtualized__Grid")
        .eq(0)
        .contains("Name")
        .should("exist");
      cy.get(".TopRightGrid_ScrollWrapper")
        .contains("CPU Consumed")
        .should("exist");
      cy.get(".TopRightGrid_ScrollWrapper")
        .contains("Memory Consumed")
        .should("exist");
      cy.get(".TopRightGrid_ScrollWrapper")
        .contains("Disk Consumed")
        .should("exist");
      cy.get(".TopRightGrid_ScrollWrapper")
        .contains("GPU Consumed")
        .should("exist");
    });

    it("Shows the correct number of rows", function() {
      cy.get(".ReactVirtualized__Grid")
        .eq(2)
        .children()
        .first()
        .children()
        .should("to.have.length", 2);
    });

    it("Sorts the table by name", function() {
      cy.get(".ReactVirtualized__Grid")
        .eq(0)
        .contains("Name")
        .click();
      getFirstRowName("10000_apps");
      getSecondRowName("10_apps");

      cy.get(".ReactVirtualized__Grid")
        .eq(0)
        .contains("Name")
        .click();
      getFirstRowName("10_apps");
      getSecondRowName("10000_apps");
    });

    it("Sorts the table by CPU consumed", function() {
      clickHeading("CPU Consumed");
      getFirstRowName("10000_apps");
      getSecondRowName("10_apps");

      clickHeading("CPU Consumed");
      getFirstRowName("10_apps");
      getSecondRowName("10000_apps");
    });

    it("Sorts the table by Memory consumed", function() {
      clickHeading("Memory Consumed");
      getFirstRowName("10000_apps");
      getSecondRowName("10_apps");

      clickHeading("Memory Consumed");
      getFirstRowName("10_apps");
      getSecondRowName("10000_apps");
    });

    it("Sorts the table by Disk consumed", function() {
      clickHeading("Disk Consumed");
      getFirstRowName("10_apps");
      getSecondRowName("10000_apps");

      clickHeading("Disk Consumed");
      getFirstRowName("10000_apps");
      getSecondRowName("10_apps");
    });

    it("Sorts the table by GPU consumed", function() {
      clickHeading("GPU Consumed");
      getFirstRowName("10000_apps");
      getSecondRowName("10_apps");

      clickHeading("GPU Consumed");
      getFirstRowName("10_apps");
      getSecondRowName("10000_apps");
    });
  });
});
