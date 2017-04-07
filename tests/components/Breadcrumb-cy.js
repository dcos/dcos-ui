describe('Breadcrumb Component', function () {
  beforeEach(function () {
    cy.configureCluster({
      mesos: '1-task-healthy'
    });
    cy.visitUrl({
      url: '/services/overview/%2Fsome%2Fgroup-with-pods'
    });
  });

  context('When breadcrumb contain less than 4 items', function () {
    it('doesn\'t truncate breadcrumb', function () {
      cy.get('.breadcrumbs.breadcrumbs--is-truncated')
        .should('not.exist');
    });

    it('doesn\'t ellipsis breadcrumb items', function () {
      cy.get('.breadcrumb')
        .then(function ($breadcrumbs) {
          var currentBreadcrumb;

          for (var i = 0; i < $breadcrumbs.length; i++) {
            currentBreadcrumb = $breadcrumbs[i];
            expect(currentBreadcrumb.classList.value.indexOf('breadcrumb--is-ellipsis')).to.equal(-1);
          }
        });
    });
  });

  context('When breadcrumb contain more than 4 items', function () {
    beforeEach(function () {
      cy.get('.table-cell-link-primary')
        .click();
    });

    it('truncate breadcrumb', function () {
      cy.get('.breadcrumbs')
        .should('have.class', 'breadcrumbs--is-truncated');
    });

    it('last two breadcrumbs are visible', function () {
      cy.get('.breadcrumb')
        .then(function ($breadcrumbs) {
          const lastItem = $breadcrumbs[$breadcrumbs.length - 1];
          const beforeLastItem = $breadcrumbs[$breadcrumbs.length - 3];

          expect(beforeLastItem.textContent).to.equal('group-with-pods');
          expect(lastItem.textContent).to.equal('podEFGHDeploying (1 of 10)');
        });
    });

    it.skip('ellipsis breadcrumb in between first breadcrumb and two last breadcrumbs', function () {
      cy.get('.breadcrumb')
        .then(function ($breadcrumbs) {
          console.log($breadcrumbs);
          expect(true).to.equal(true);
        });
    });

    it('display path when hovering ellipsis', function () {
      cy.get('.breadcrumb--force-ellipsis')
        .eq(0)
        .triggerHover();

      cy.get('.tooltip')
        .contains('some');
    });

    it('route back to services overview', function () {
      cy.get('.breadcrumb')
        .eq(0)
        .click();

      cy.window()
        .then(function ($window) {
          const hash = $window.location.hash;
          const formattedHash = hash.substring(0, hash.indexOf('?'));

          expect(formattedHash).to.equal('#/services/overview');
        });
    });

    // When greater than 3 items:
    // X Breadcrumbs should collapse so that only the last two breadcrumb items are visible
    // An ellipsis should take place of all breadcrumbs except the last two
    // X Hovering the ellipsis should render a tooltip that displays the path that is hidden
    // X The Services icon should route back to the services overview

    // X When the viewport is narrow, the breadcrumbs should truncate and not overflow their container
    // X When the viewport is narrow, the page header actions should always be visible
    // When a page header's tab is active, its activity indicator should be flush with the bottom of the page header.
    // The activity indicator may just be a pseudo-element, so it's probably sufficient to test that the tab itself is flush with the bottom of the page header.

  });

  context('Breadcrumb when viewport is narrow', function () {
    beforeEach(function () {
      cy.viewport('iphone-6');
    });

    it('truncate breadcrumb on smaller screen', function () {
      cy.get('.breadcrumbs')
        .should('have.class', 'breadcrumbs--is-truncated');
    });
  });

  context('Page header', function () {
    beforeEach(function () {
      cy.viewport('iphone-6');
    });

    it('header actions is visible', function () {
      cy.get('.page-header-actions')
        .should('exist');
    });
  });
});
