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
      cy.get(".page-body-content .list-inline.list-unstyled").should(
        "contain",
        "13 Runs"
      );
    });

    it("renders the correct number of jobs in the table", function() {
      cy.get(".page table tbody tr").should(function($rows) {
        expect($rows.length).to.equal(13);
      });
    });

    it("does not show table children when row is not expanded", function() {
      cy.get(".page table tbody tr").then(function() {
        // Four rows, two for the virtual list padding and two for the data.
        cy.get(".page table tbody tr:nth-child(2)").as("tableRow");

        cy.get("@tableRow")
          .find("td:first-child .expanding-table-child")
          .should(function($children) {
            expect($children.length).to.equal(0);
          });
      });
    });

    it("expands the table row when clicking a job run", function() {
      cy.get(".page table tbody tr").as("tableRow");

      cy.get("@tableRow")
        .find(".expanding-table-primary-cell")
        .first()
        .click();

      cy.get("@tableRow")
        .find(".expanding-table-primary-cell")
        .first()
        .should("have.class", "is-expanded");

      cy.get("@tableRow")
        .find("td:nth-child(2) .expanding-table-child")
        .should($children => {
          expect($children.length).to.equal(2);
        });
    });

    it("expands a second table row when clicking another job run", function() {
      cy.get(".page table tbody tr .is-expandable").as("tableRows");
      cy.get("@tableRows")
        .first()
        .click();
      cy.get("@tableRows")
        .eq(1)
        .click();

      cy.get(".job-run-history-table-column-id .expanding-table-child").should(
        $children => {
          // two jobs with two tasks each
          expect($children.length).to.equal(4);
        }
      );
    });

    it("expands a row for already finished job runs", function() {
      cy.get(".page table tbody tr .is-expandable").as("tableRows");
      cy.get("@tableRows")
        .eq(2)
        .as("successfulHistoricRun");
      cy.get("@tableRows")
        .last()
        .as("failedHistoricRun");

      // make sure that we don't render those tasks in the dom already
      cy.contains("completedTask.42").should("not.exist");
      cy.contains("failedTask.42").should("not.exist");

      // expand the historic tasks
      cy.get("@successfulHistoricRun").click();
      cy.get("@failedHistoricRun").click();

      // check that they are in the dom now
      cy.contains("completedTask.42");
      cy.contains("failedTask.42");

      // check that the tooltip is present as the tasks from above are not
      // present in MesosStateStore
      cy.contains("The data related to this task has already been cleaned up.");
    });

    it("Shows the actions dropdown for running jobs", function() {
      cy.get(".actions-dropdown");
    });

    it("Shows the stop job run modal", function() {
      cy.get(".actions-dropdown").click();
      cy.get(".dropdown-menu-items")
        .contains("Stop")
        .click();
      cy.get(".modal-header-title").contains(
        "Are you sure you want to stop this?"
      );
      cy.get(".modal-body").contains(
        "You are about to stop the job run with id"
      );
    });
  });

  context("Configuration Tab", function() {
    it("renders the correct amount of job configuration details", function() {
      cy.get(".menu-tabbed-item")
        .contains("Configuration")
        .click();
      cy.get(".page-body-content .configuration-map-row").should(function(
        $elements
      ) {
        expect($elements.length).to.equal(16);
      });
    });

    it("renders the job configuration data", function() {
      cy.get(".menu-tabbed-item")
        .contains("Configuration")
        .click();
      cy.get(".page-body-content .configuration-map-row").as("configRow");

      cy.get("@configRow").should("contain", "Command");
      cy.get("@configRow").should("contain", "/foo");
      cy.get("@configRow").should("contain", "Schedule");
      cy.get("@configRow").should("contain", "0 1 6 9 *");
    });
  });
});
