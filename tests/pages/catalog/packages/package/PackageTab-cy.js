describe("Package Detail Tab", function() {
  beforeEach(function() {
    cy
      .configureCluster({
        mesos: "1-task-healthy",
        universePackages: true
      })
      .visitUrl({ url: "/catalog/packages/marathon?version=1.4.6" });
  });

  context("Package Details", function() {
    it("displays package information on package page", function() {
      cy.get(".page-body-content h1").should("contain", "marathon");
    });

    // Stalls tests in CI. TODO: Talk with Brian about this test.
    it("displays marathon package details", function() {
      cy.get(".page-body-content .pod p").as("information");

      cy
        .get("@information")
        .eq(0)
        .should(
          "contain",
          "A container orchestration platform for Mesos and DCOS"
        )
        .get("@information")
        .eq(1)
        .should(
          "contain",
          "We recommend a minimum of one node with at least 2 CPU shares and 1GB of RAM available for the Marathon DCOS Service."
        )
        .get("@information")
        .eq(2)
        .should("contain", "SCM: https://github.com/mesosphere/marathon.git")
        .get("@information")
        .eq(3)
        .should("contain", "Maintainer: support@mesosphere.io")
        .get("@information")
        .eq(4)
        .should(
          "contain",
          "Apache License Version 2.0: https://github.com/mesosphere/marathon/blob/master/LICENSE"
        );
    });

    it("contains _blank target for links in description", function() {
      cy
        .get("h2")
        .contains("Description")
        .parent()
        .find("a")
        .should("have.attr", "target", "_blank");
    });
    it("contains _blank target for links in preinstall notes", function() {
      cy
        .get(".pre-install-notes")
        .find("a")
        .should("have.attr", "target", "_blank");
    });

    it("displays image in the image viewer", function() {
      cy
        .get(".media-object-item-fill-image.image-rounded-corners.clickable")
        .eq(4)
        .click();

      cy
        .get(".modal.modal-image-viewer img")
        .should(
          "have.attr",
          "src",
          "http://www.clker.com/cliparts/0/f/d/b/12917289761851255679earth-map-huge.jpg"
        );
    });

    it("changes image in the image viewer by clicking left arrow", function() {
      cy
        .get(".media-object-item-fill-image.image-rounded-corners.clickable")
        .eq(4)
        .click();

      cy.get(".modal-image-viewer-arrow-container.clickable.backward").click();

      cy
        .get(".modal.modal-image-viewer img")
        .should(
          "have.attr",
          "src",
          "https://mesosphere.com/wp-content/themes/mesosphere/library/images/assets/marathon-0.6.0/mesosphere-marathon-app-list.png"
        );
    });

    it("changes image in the image viewer by clicking right arrow", function() {
      cy
        .get(".media-object-item-fill-image.image-rounded-corners.clickable")
        .eq(4)
        .click();

      cy.get(".modal-image-viewer-arrow-container.clickable.forward").click();

      cy
        .get(".modal.modal-image-viewer img")
        .should(
          "have.attr",
          "src",
          "https://mesosphere.com/wp-content/themes/mesosphere/library/images/assets/marathon-0.6.0/mesosphere-marathon-app-list.png"
        );
    });

    it("dropdown display all versions available", function() {
      cy.get(".dropdown-toggle").click();
      cy.get(".is-selectable").should("have.length", 4);
    });

    it("select available version on dropdown", function() {
      cy.get(".dropdown-toggle").click();
      cy.get(".is-selectable").eq(3).click();
      cy.window().then(function(window) {
        const result = window.location.hash.includes("0.2.1");
        expect(result).to.equal(true);
      });
    });
  });

  context("Package Configuration", function() {
    beforeEach(function() {
      cy
        .get(".page-body-content .package-action-buttons button")
        .contains("Review & Run")
        .click();

      cy.get(".modal .modal-header button").contains("Review & Run").click();
    });

    it("opens framework configuration when Review & Run clicked", function() {
      cy
        .get(".modal .configuration-map-label")
        .contains("Name")
        .should("to.have.length", 1);
    });

    it("shows preinstall notes on review screen", function() {
      cy
        .get(".modal .message.message-warning")
        .contains(
          "We recommend a minimum of one node with at least 2 CPU shares and 1GB of RAM available for the Marathon DCOS Service."
        )
        .should("to.have.length", 1);
    });

    it("goes to form when back button is clicked", function() {
      cy.get(".modal .modal-header button").contains("Back").click();

      cy
        .get('.modal .menu-tabbed-container input[name="group"]')
        .type(`{selectall}group-1`);
    });

    it("changes cancel button to back when on review screen", function() {
      cy.get(".modal button").contains("Edit Config").click();

      cy
        .get('.modal .menu-tabbed-container input[name="group"]')
        .type(`{selectall}group-1`);

      cy.get(".modal .modal-header button").contains("Review & Run").click();

      cy
        .get(".modal .modal-header button")
        .contains("Back")
        .should("to.have.length", 1);
    });

    it("shows success dialog on successfully package install", function() {
      cy
        .get(".modal .modal-header button.button-primary")
        .contains("Run Service")
        .click();

      cy
        .get(".modal.modal-small .modal-body")
        .contains("Success")
        .should("to.have.length", 1);
    });

    context("Framework: Placement", function() {
      beforeEach(function() {
        cy.get(".modal button").contains("Edit Config").click();
      });

      context("Add Placement Constraint", function() {
        beforeEach(function() {
          cy.get(".menu-tabbed-view-container").as("tabView");
          cy
            .get(".button-primary-link")
            .contains("Add Placement Constraint")
            .click();
        });

        it('Should add rows when "Add Placement Constraint" link clicked', function() {
          // Field
          cy
            .get("@tabView")
            .find('.form-control[name="constraints.0.fieldName"]')
            .should("exist");

          // operator
          cy
            .get("@tabView")
            .find('[name="constraints.0.operator"]')
            .should("exist");

          // value
          cy
            .get("@tabView")
            .find('.form-control[name="constraints.0.value"]')
            .should("exist");
        });

        it("Should remove rows when remove button clicked", function() {
          cy.contains(".form-row", "Operator").within(function() {
            // Click delete button
            cy.get("a.button").click();
          });

          // Field
          cy
            .get("@tabView")
            .find('.form-control[name="constraints.0.fieldName"]')
            .should("not.exist");

          // operator
          cy
            .get("@tabView")
            .find('[name="constraints.0.operator"]')
            .should("not.exist");

          // value
          cy
            .get("@tabView")
            .find('.form-control[name="constraints.0.value"]')
            .should("not.exist");
        });

        it("Should disable the field value when Unique is selected in operator dropdown", function() {
          cy.get("@tabView").find(".button.dropdown-toggle").click();

          cy.contains(".dropdown-select-item-title", "Unique").click();

          // value
          cy
            .get("@tabView")
            .find('[name="constraints.0.value"]')
            .should("be.disabled");
        });
      });
    });
  });
});
