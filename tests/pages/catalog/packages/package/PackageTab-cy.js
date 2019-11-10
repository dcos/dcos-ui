describe("Package Detail Tab", () => {
  beforeEach(() => {
    cy.configureCluster({
      mesos: "1-task-healthy",
      universePackages: true
    }).visitUrl({ url: "/catalog/packages/marathon?version=1.4.6" });
  });

  context("Package Details", () => {
    it("displays package information on package page", () => {
      cy.get(".page-body-content h1").should("contain", "marathon");
    });

    // Stalls tests in CI. TODO: Talk with Brian about this test.
    it("displays marathon package details", () => {
      cy.get(".page-body-content .pod p").as("information");

      cy.get("@information")
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

    it("contains _blank target for links in description", () => {
      cy.get("h2")
        .contains("Description")
        .parent()
        .find("a")
        .should("have.attr", "target", "_blank");
    });

    it("contains _blank target for links in preinstall notes", () => {
      cy.get(".pre-install-notes")
        .find("a")
        .should("have.attr", "target", "_blank");
    });

    it("displays image in the image viewer", () => {
      cy.get(".media-object-item-fill-image.image-rounded-corners.clickable")
        .eq(4)
        .click();

      cy.get(".modal.modal-image-viewer img").should(
        "have.attr",
        "src",
        "http://www.clker.com/cliparts/0/f/d/b/12917289761851255679earth-map-huge.jpg"
      );
    });

    it("changes image in the image viewer by clicking left arrow", () => {
      cy.get(".media-object-item-fill-image.image-rounded-corners.clickable")
        .eq(4)
        .click();

      cy.get(".modal-image-viewer-arrow-container.clickable.backward").click();

      cy.get(".modal.modal-image-viewer img").should(
        "have.attr",
        "src",
        "https://mesosphere.com/wp-content/themes/mesosphere/library/images/assets/marathon-0.6.0/mesosphere-marathon-app-list.png"
      );
    });

    it("changes image in the image viewer by clicking right arrow", () => {
      cy.get(".media-object-item-fill-image.image-rounded-corners.clickable")
        .eq(4)
        .click();

      cy.get(".modal-image-viewer-arrow-container.clickable.forward").click();

      cy.get(".modal.modal-image-viewer img").should(
        "have.attr",
        "src",
        "https://mesosphere.com/wp-content/themes/mesosphere/library/images/assets/marathon-0.6.0/mesosphere-marathon-app-list.png"
      );
    });

    it("dropdown display all versions available", () => {
      cy.get(".dropdown-toggle").click();
      cy.get(".is-selectable").should("have.length", 4);
    });

    it("select available version on dropdown", () => {
      cy.get(".dropdown-toggle").click();
      cy.get(".is-selectable")
        .eq(3)
        .click();
      cy.window().then(window => {
        const result = window.location.hash.includes("0.2.1");
        expect(result).to.equal(true);
      });
    });

    it("Does not ask for confirmation for certified packages", () => {
      cy.get(".page-body-content .package-action-buttons button")
        .contains("Review & Run")
        .click();
      cy.get(".modal-body")
        .contains("Install Community Package")
        .should("not.exist");
      cy.get(".modal-full-screen-header-title").contains("Edit Configuration");
    });

    context("Unmet dependency", () => {
      beforeEach(() => {
        cy.configureCluster({
          mesos: "1-task-healthy",
          universePackages: "dependencyPackage"
        }).visitUrl({ url: "/catalog/packages/marathon?version=1.4.6" });
      });

      it("Displays a warning", () => {
        cy.get(".infoBoxWrapper").contains(
          "This service cannot run without the marathon-cluster package. Please run marathon-cluster package to enable this service."
        );
      });

      it("Disables the review and run button", () => {
        cy.get(".disabled").contains("Review & Run");
      });
    });

    context("Community Packages", () => {
      beforeEach(() => {
        cy.configureCluster({
          mesos: "1-task-healthy",
          universePackages: "communityPackage"
        }).visitUrl({ url: "/catalog/packages/marathon?version=1.4.6" });
        cy.get(".page-body-content .package-action-buttons button")
          .contains("Review & Run")
          .click();
      });

      it("Asks for confirmation for community packages", () => {
        cy.get(".modal-body").contains("Install Community Package");
        cy.get(".modal-body").contains(
          "This package is not tested for production environments and technical support is not provided."
        );
      });

      it("Goes back when Cancel is clicked", () => {
        cy.get(".button-primary-link")
          .contains("Cancel")
          .click();
        cy.get(".breadcrumb__content--text").contains("marathon");
      });

      it("Goes to package configuration when Continue is clicked", () => {
        cy.get(".button-primary")
          .contains("Continue")
          .click();
        cy.get(".modal-full-screen-header-title").contains(
          "Edit Configuration"
        );
      });
    });

    context("Last updated", () => {
      it("Shows no label for packages with no last updated information", () => {
        cy.get("[data-cy=outdated-warning]").should("not.exist");
        cy.get("[data-cy=last-updated]").should("not.exist");
        cy.get(".page-body-content .package-action-buttons button")
          .contains("Review & Run")
          .click();
        cy.get("[data-cy=outdated-warning]").should("not.exist");
      });

      it("Shows a label if the package has information about when it was last updated", () => {
        cy.configureCluster({
          mesos: "1-task-healthy",
          universePackages: "old"
        }).visitUrl({
          url: "/catalog/packages/marathon?version=1.4.6"
        });

        cy.get("[data-cy=last-updated]");
        cy.get(".page-body-content .package-action-buttons button")
          .contains("Review & Run")
          .click();
        cy.get("[data-cy=outdated-warning]").should("not.exist");
      });

      it("Shows a yellow warning if the package has not been updated for over a year", () => {
        cy.configureCluster({
          mesos: "1-task-healthy",
          universePackages: "older"
        }).visitUrl({ url: "/catalog/packages/marathon?version=1.4.6" });

        cy.get("[data-cy=outdated-warning]");
        cy.get(".tooltip").contains(
          "This service has not been updated for at least 1 year. We recommend you update if possible."
        );

        cy.get(".page-body-content .package-action-buttons button")
          .contains("Review & Run")
          .click();
        cy.get("[data-cy=outdated-warning]");
        cy.get(".tooltip").contains(
          "This service has not been updated for at least 1 year. We recommend you update if possible."
        );
      });
    });
  });

  context("Package Configuration", () => {
    beforeEach(() => {
      cy.get(".page-body-content .package-action-buttons button")
        .contains("Review & Run")
        .click();

      cy.get(".modal .modal-header button")
        .contains("Review & Run")
        .click();
    });

    it("opens framework configuration when Review & Run clicked", () => {
      cy.get(".modal .configuration-map-label")
        .contains("Name")
        .should("to.have.length", 1);
    });

    it("shows preinstall notes on review screen", () => {
      cy.get(".modal .infoBoxWrapper")
        .contains(
          "We recommend a minimum of one node with at least 2 CPU shares and 1GB of RAM available for the Marathon DCOS Service."
        )
        .should("to.have.length", 1);
    });

    it("goes to form when back button is clicked", () => {
      cy.get(".modal .modal-header button")
        .contains("Back")
        .click();

      cy.get('.modal .menu-tabbed-container input[name="group"]').type(
        `{selectall}group-1`
      );
    });

    it("changes cancel button to back when on review screen", () => {
      cy.get(".modal button")
        .contains("Edit Config")
        .click();

      cy.get('.modal .menu-tabbed-container input[name="group"]').type(
        `{selectall}group-1`
      );

      cy.get(".modal .modal-header button")
        .contains("Review & Run")
        .click();

      cy.get(".modal .modal-header button")
        .contains("Back")
        .should("to.have.length", 1);
    });

    it("shows success dialog on successfully package install", () => {
      cy.get(".modal .modal-header button.button-primary")
        .contains("Run Service")
        .click();

      cy.get(".modal.modal-small .modal-body")
        .contains("Success")
        .should("to.have.length", 1);
    });

    context("Framework: Placement", () => {
      beforeEach(() => {
        cy.get(".modal button")
          .contains("Edit Config")
          .click();
      });

      context("Add Placement Constraint", () => {
        beforeEach(() => {
          cy.get(".menu-tabbed-view-container").as("tabView");
          cy.get(".button-primary-link")
            .contains("Add Placement Constraint")
            .click();
        });

        it('Should add rows when "Add Placement Constraint" link clicked', () => {
          // Field
          cy.get("@tabView").find(
            '.form-control[name="constraints.0.fieldName"]'
          );

          // operator
          cy.get("@tabView").find('[name="constraints.0.operator"]');

          // value
          cy.get("@tabView").find('.form-control[name="constraints.0.value"]');
        });

        it("Should remove rows when remove button clicked", () => {
          cy.contains(".form-row", "Operator").within(() => {
            // Click delete button
            cy.get("a.button").click();
          });

          // Field
          cy.get("@tabView")
            .find('.form-control[name="constraints.0.fieldName"]')
            .should("not.exist");

          // operator
          cy.get("@tabView")
            .find('[name="constraints.0.operator"]')
            .should("not.exist");

          // value
          cy.get("@tabView")
            .find('.form-control[name="constraints.0.value"]')
            .should("not.exist");
        });

        it("Should disable the field value when Unique is selected in operator dropdown", () => {
          cy.get("@tabView")
            .find(".button.dropdown-toggle")
            .click();

          cy.contains(".dropdown-select-item-title", "Unique").click();

          // value
          cy.get("@tabView")
            .find('[name="constraints.0.value"]')
            .should("be.disabled");
        });
      });
    });
  });
});
