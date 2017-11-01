describe("Job Details", function() {
  beforeEach(function() {
    cy.configureCluster({
      jobDetails: true,
      mesos: "1-for-each-health",
      nodeHealth: true
    });
    cy.visitUrl({ url: "/jobs/detail/foo" });
  });

  context("Job Details Header", function() {
    it("renders the proper job name", function() {
      cy.get(".breadcrumbs").should("contain", "foo");
    });
  });

  context("Run History Tab", function() {
    it("shows the correct number of jobs in the filter header", function() {
      cy
        .get(".page-body-content .list-inline.list-unstyled")
        .should("contain", "13 Runs");
    });

    it("renders the correct number of jobs in the table", function() {
      cy.get(".page table tbody tr").should(function($rows) {
        // Four rows, two for the virtual list padding and two for the data.
        expect($rows.length).to.equal(15);
      });
    });

    it("does not show table children when row is not expanded", function() {
      cy.get(".page table tbody tr").then(function() {
        // Four rows, two for the virtual list padding and two for the data.
        cy.get(".page table tbody tr:nth-child(2)").as("tableRow");

        cy
          .get("@tableRow")
          .find("td:first-child .expanding-table-child")
          .should(function($children) {
            expect($children.length).to.equal(0);
          });
      });
    });

    it("expands the table row when clicking a job run", function() {
      cy.get(".page table tbody tr").as("tableRow");

      cy.get("@tableRow").find(".expanding-table-primary-cell").first().click();

      cy
        .get("@tableRow")
        .find(".expanding-table-primary-cell")
        .first()
        .should("have.class", "is-expanded");

      cy
        .get("@tableRow")
        .find("td:nth-child(2) .expanding-table-child")
        .should(function($children) {
          expect($children.length).to.equal(2);
        });
    });

    it("expands a second table row when clicking another job run", function() {
      cy.get(".page table tbody tr .is-expandable").as("tableRows");
      cy.get("@tableRows").first().as("tableRowA");
      cy.get("@tableRows").last().as("tableRowB");

      cy.get("@tableRowA").click();
      cy.get("@tableRowB").click();

      // 5 table columns (started column is sometimes hidden) each with 4
      // expanding-table-child cells = 20.
      cy.get(".page table .expanding-table-child").should(function($children) {
        expect($children.length).to.equal(20);
      });
    });
  });

  context("Configuration Tab", function() {
    it("renders the correct amount of job configuration details", function() {
      cy.get(".menu-tabbed-item").contains("Configuration").click();
      cy
        .get(".page-body-content .configuration-map-row")
        .should(function($elements) {
          expect($elements.length).to.equal(15);
        });
    });

    it("renders the job configuration data", function() {
      cy.get(".menu-tabbed-item").contains("Configuration").click();
      cy.get(".page-body-content .configuration-map-row").as("configRow");

      cy.get("@configRow").should("contain", "Command");
      cy.get("@configRow").should("contain", "/foo");
      cy.get("@configRow").should("contain", "Schedule");
      cy.get("@configRow").should("contain", "0 1 6 9 *");
    });
  });
});
