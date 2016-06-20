describe('Jobs Overview', function () {
  context('Jobs page loads correctly', function () {
    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-for-each-health',
        nodeHealth: true
      });
      cy.visitUrl({url: '/jobs'});
    });

    it('has the right active navigation entry', function () {
      cy.get('.page-navigation-list .tab-item.active')
        .should('to.have.text', 'Jobs');
    });

    it('displays jobs overview page', function () {
      cy.get('tbody tr:visible').should('to.have.length', 3);
    });

    it('does not show status or last run for groups', function () {
      cy.get('tbody tr:visible').should(function ($tableRows) {
        expect($tableRows[0].children[1].textContent).to.equal('');
        expect($tableRows[0].children[2].textContent).to.equal('');
      });
    });

    it('displays the proper job status', function () {
      cy.get('tbody tr:visible').should(function ($tableRows) {
        expect($tableRows[1].children[1].textContent).to.equal('Scheduled');
        expect($tableRows[2].children[1].textContent).to.equal('');
      });
    });

    it('displays the proper last run status', function () {
      cy.get('tbody tr:visible').should(function ($tableRows) {
        expect($tableRows[1].children[2].textContent).to.equal('Failed');
        expect($tableRows[2].children[2].textContent).to.equal('Success');
      });
    });
  });
});
