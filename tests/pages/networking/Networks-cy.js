import { getVisibleTableRows } from "../../_support/utils/testUtil";

describe("Networks", function() {
  context("Networks Table", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-task-healthy"
      });
      cy.visitUrl({ url: "/networking/networks" });
    });

    it("displays all of the networks in the table", function() {
      cy.get("tbody tr").should(function($tableRows) {
        expect(getVisibleTableRows($tableRows).length).to.equal(2);
      });
    });

    it("displays all columns for each network", function() {
      cy.getAPIResponse("/mesos/overlay-master/state", function(fixture) {
        cy.get("tbody tr").should(function($tableRows) {
          getVisibleTableRows($tableRows).forEach(function(tableRow, index) {
            const overlayData = fixture.network.overlays[index];
            const tableCells = tableRow.querySelectorAll("td");

            expect(tableCells[0].textContent).to.equal(overlayData.name);
            expect(tableCells[1].textContent).to.equal(overlayData.subnet);
            expect(tableCells[2].textContent).to.equal(
              overlayData.prefix.toString()
            );
          });
        });
      });
    });

    it("allows users to filter the table", function() {
      cy.getAPIResponse("/mesos/overlay-master/state", function(fixture) {
        cy.get("input.form-control").type(fixture.network.overlays[0].name);
        cy.get("tbody tr").should(function($tableRows) {
          expect(getVisibleTableRows($tableRows).length).to.equal(1);
        });
      });
    });
  });

  context("Network Detail", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-task-healthy"
      });
      cy.visitUrl({ url: "/networking/networks" });
      cy.get("table tr:nth-child(2) a").click();
    });

    it("displays all columns for each network", function() {
      cy.getAPIResponse("/mesos/master/state", function(fixture) {
        cy.get("tbody tr").should(function($tableRows) {
          getVisibleTableRows($tableRows).forEach(function(tableRow) {
            const tableCells = tableRow.querySelectorAll("td");
            const task = fixture.frameworks[0].tasks[0];

            expect(tableCells[0].textContent).to.equal(task.id);
            expect(tableCells[1].textContent).to.equal(
              task.statuses[0].container_status.network_infos[0].ip_addresses[0]
                .ip_address
            );
            // TODO: Figure out how to determine the port mapping value from
            // the API response.
            expect(tableCells[2].textContent).to.equal("N/A");
          });
        });
      });
    });

    it("allows users to filter the table", function() {
      cy
        // Even though this is a anti pattern and almost always not needed
        // Wait a bit so "Cannot Connect With The Server" isn't displayed
        // 2 secs is based on the time "Cannot Connect With The Server" was displayed
        // before the nodes table is displayed
        .wait(2000)
        .get(".filter-bar-item .filter-input-text")
        .type("sleep.7084272b-6b76-11e5-a953-08002719334a");
      cy.get("tbody tr").should(function($tableRows) {
        expect(getVisibleTableRows($tableRows).length).to.equal(1);
      });
    });
  });
});
