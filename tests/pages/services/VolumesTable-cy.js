describe("Volumes", function() {
  beforeEach(function() {
    cy.configureCluster({
      mesos: "1-task-with-volumes",
      nodeHealth: true
    });
  });

  context("Volumes Table", function() {
    beforeEach(function() {
      cy.visitUrl({ url: "/services/overview/%2Fsleep" });
      cy.get(".menu-tabbed-item").contains("Volumes").click();
    });

    it("shows the correct number of volumes in the table", function() {
      cy.get(".table tbody tr").should(function($rows) {
        // 3 rows of volumes + 2 rows for VirtualList = 5 rows total.
        expect($rows.length).to.equal(5);
      });
    });

    it("renders the correct IDs in the table", function() {
      cy.get(".table tbody tr").should(function($rows) {
        var children = $rows[1].children;
        expect(children[0].textContent).to.equal(
          "sleep#data-1#c1fbf257-efb2-11e6-a361-5edc614b8201"
        );
        expect(children[1].textContent).to.equal("10.0.2.93");
        expect(children[2].textContent).to.equal("Persistent");
        expect(children[3].textContent).to.equal("data-1");
        expect(children[4].textContent).to.equal("1");
        expect(children[5].textContent).to.equal("RW");
        expect(children[6].textContent).to.equal("Attached");
      });
    });
  });

  context("Volume Details", function() {
    beforeEach(function() {
      cy.visitUrl({ url: "/services/overview/%2Fsleep" });
      cy.get(".menu-tabbed-item").contains("Volumes").click();
      cy
        .get(".table tbody tr a")
        .contains("sleep#data-1#c1fbf257-efb2-11e6-a361-5edc614b8201")
        .click();
    });

    it("routes to the volume details by id", function() {
      cy
        .hash()
        .should(
          "match",
          new RegExp(
            encodeURIComponent(
              "sleep#data-1#c1fbf257-efb2-11e6-a361-5edc614b8201"
            )
          )
        );
    });

    it("displays the correct status in the header", function() {
      cy
        .get(".detail-view-header-sub-heading .emphasize")
        .should("contain", "Attached");
    });

    it("displays the details of the volume", function() {
      cy
        .get(".configuration-map-row .configuration-map-value")
        .should(function($descriptionListEls) {
          expect($descriptionListEls[0].textContent).to.equal("data-1");
          expect($descriptionListEls[1].textContent).to.equal("RW");
          expect($descriptionListEls[2].textContent).to.equal("1");
          expect($descriptionListEls[3].textContent).to.equal("/sleep");
          expect($descriptionListEls[4].textContent).to.equal(
            "sleep.c1fc196a-efb2-11e6-a361-5edc614b8201"
          );
          expect($descriptionListEls[5].textContent).to.equal("10.0.2.93");
        });
    });
  });
});
