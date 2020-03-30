describe("Volumes", () => {
  beforeEach(() => {
    cy.configureCluster({
      mesos: "1-task-with-volumes",
      nodeHealth: true,
    });
  });

  context("Volumes Table", () => {
    beforeEach(() => {
      cy.visitUrl({ url: "/services/detail/%2Fsleep" });
      cy.get(".menu-tabbed-item").contains("Volumes").click();
    });

    it("shows the correct number of volumes in the table", () => {
      cy.get(".table tbody tr").should(($rows) => {
        expect($rows.length).to.equal(3);
      });
    });

    it("renders the correct IDs in the table", () => {
      cy.get(".table tbody tr").should(($rows) => {
        const children = $rows[0].children;
        expect(children[0].textContent).to.equal(
          "sleep#data-1#c1fbf257-efb2-11e6-a361-5edc614b8201"
        );
        expect(children[1].textContent).to.equal("10.0.2.93");
        expect(children[2].textContent).to.equal("Persistent");
        expect(children[3].textContent).to.equal("Not Available");
        expect(children[4].textContent).to.equal("data-1");
        expect(children[5].textContent).to.equal("1");
        expect(children[6].textContent).to.equal("Attached");
      });
    });
  });

  context("Volume Details", () => {
    beforeEach(() => {
      cy.visitUrl({ url: "/services/detail/%2Fsleep" });
      cy.get(".menu-tabbed-item").contains("Volumes").click();
      cy.get(".table tbody tr a")
        .contains("sleep#data-1#c1fbf257-efb2-11e6-a361-5edc614b8201")
        .click({ force: true });
    });

    it("routes to the volume details by id", () => {
      cy.hash().should(
        "match",
        new RegExp(
          encodeURIComponent(
            "sleep#data-1#c1fbf257-efb2-11e6-a361-5edc614b8201"
          )
        )
      );
    });

    it("displays the correct status in the header", () => {
      cy.get(".detail-view-header-sub-heading .emphasize").should(
        "contain",
        "Attached"
      );
    });

    it("displays the details of the volume", () => {
      cy.get(".configuration-map-row .configuration-map-value").should(
        ($descriptionListEls) => {
          expect($descriptionListEls[0].textContent).to.equal("data-1");
          expect($descriptionListEls[1].textContent).to.equal("RW");
          expect($descriptionListEls[2].textContent).to.equal("1");
          expect($descriptionListEls[3].textContent).to.equal("/sleep");
          expect($descriptionListEls[4].textContent).to.equal(
            "sleep.c1fc196a-efb2-11e6-a361-5edc614b8201"
          );
          expect($descriptionListEls[5].textContent).to.equal("10.0.2.93");
        }
      );
    });
  });
});
