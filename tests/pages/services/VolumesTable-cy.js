describe('Volumes', function () {

  beforeEach(function () {
    cy.configureCluster({
      mesos: '1-task-with-volumes',
      nodeHealth: true
    });
  });

  context('Volumes Table', function () {

    beforeEach(function () {
      cy.visitUrl({url: '/services/%2Fsleep/'});
      cy.get('.page-content .tabs').contains('Volumes').click();
    });

    it('shows the correct number of volumes in the table', function () {
      cy.get('.table tbody tr').should(function ($rows) {
          // 3 rows of volumes + 2 rows for VirtualList = 5 rows total.
          expect($rows.length).to.equal(5);
        });
    });

    it('renders the correct IDs in the table', function () {
      cy.get('.table tbody tr').should(function ($rows) {
          var children = $rows[1].children;
          expect(children[0].textContent).to.equal('foo-bar#data-1#624f5b52-2e5e-11e6-8e49-a6a5a4687c4d');
          expect(children[1].textContent).to.equal('10.0.1.117');
          expect(children[2].textContent).to.equal('Persistent');
          expect(children[3].textContent).to.equal('data-1');
          expect(children[4].textContent).to.equal('100');
          expect(children[5].textContent).to.equal('RW');
          expect(children[6].textContent).to.equal('Attached');
        });
    });

  });

  context('Volume Details', function () {

    beforeEach(function () {
      cy.visitUrl({url: '/services/%2Fsleep/'});
      cy.get('.page-content .tabs').contains('Volumes').click();
      cy.get('.table tbody tr a').contains('foo-bar#data-1#624f5b52-2e5e-11e6-8e49-a6a5a4687c4d').click();
    });

    it('routes to the volume details by id', function () {
      cy.hash().should('match', new RegExp(encodeURIComponent('foo-bar#data-1#624f5b52-2e5e-11e6-8e49-a6a5a4687c4d')));
    });

    it('displays the correct status in the header', function () {
      cy.get('.page-header-heading .emphasize').should('contain', 'Attached');
    });

    it('displays the details of the volume', function () {
      cy.get('.page-content dl.flex-box').should(function ($descriptionListEls) {
        expect($descriptionListEls[0].children[1].textContent).to.equal('data-1');
        expect($descriptionListEls[1].children[1].textContent).to.equal('RW');
        expect($descriptionListEls[2].children[1].textContent).to.equal('100');
        expect($descriptionListEls[3].children[1].textContent).to.equal('/sleep');
        expect($descriptionListEls[4].children[1].textContent).to.equal('foo-bar.624fd085-2e5e-11e6-8e49-a6a5a4687c4d');
        expect($descriptionListEls[5].children[1].textContent).to.equal('10.0.1.117');
      });
    });

  });

});

