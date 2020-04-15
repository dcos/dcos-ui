describe("DC/OS Storage Service", () => {
  context("DSS (Single Container)", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy",
        plugins: "dss",
      });

      cy.visitUrl({ url: "/services/overview/%2F/create" });
      cy.get(".create-service-modal-service-picker-option")
        .contains("Single Container")
        .click();
    });

    context("Service: Volumes", () => {
      beforeEach(() => {
        cy.get(".menu-tabbed-item").contains("Volumes").click();

        // Alias tab view for cached lookups
        cy.get(".menu-tabbed-view").as("tabView");
      });

      context("Local Volumes", () => {
        beforeEach(() => {
          cy.get(".menu-tabbed-view .button.button-primary-link")
            .contains("Add Volume")
            .click();
        });

        it('adds new set of form fields when "DC/OS Storage Volume" is selected as volume type', () => {
          cy.get("@tabView").contains(".form-group", "Volume Type");
          cy.get("@tabView").find(".button.dropdown-toggle").click();
          cy.contains(
            ".dropdown-select-item-title",
            "DC/OS Storage Volume"
          ).click();
          cy.get('.form-control[name="volumes.0.containerPath"]').should(
            "exist"
          );
          cy.get('.form-control[name="volumes.0.size"]');
          cy.get('.form-control[name="volumes.0.profileName"]');
        });

        it('removes "Volume" form fields when remove button clicked', () => {
          cy.get("@tabView").find(".button.dropdown-toggle").click();
          cy.contains(
            ".dropdown-select-item-title",
            "Local Persistent Volume"
          ).click();

          cy.get("@tabView").find(".panel .button.button-primary-link").click();

          cy.get('.form-control[name="volumes.0.containerPath"]').should(
            "not.exist"
          );
        });
      });
    });

    context("Review and Run Service", () => {
      beforeEach(() => {
        // Fill in SERVICE ID
        cy.get('.form-control[name="id"]')
          .type("{selectall}{backspace}")
          .type("{selectall}{backspace}")
          .type("/test-review-and-run");

        // Fill in CONTAINER IMAGE
        cy.get('.form-control[name="container.docker.image"]')
          .type("{selectall}{backspace}")
          .type("{selectall}{backspace}")
          .type("nginx");

        cy.get(".menu-tabbed-item").contains("Volumes").click();

        // Select Volume Section
        cy.get(".menu-tabbed-view .button.button-primary-link")
          .contains("Add Volume")
          .click();

        cy.get(".menu-tabbed-view").as("tabView");

        // Add a DSS volume
        cy.get("@tabView").contains(".form-group", "Volume Type");
        cy.get("@tabView").find(".button.dropdown-toggle").click();
        cy.contains(
          ".dropdown-select-item-title",
          "DC/OS Storage Volume"
        ).click();
        cy.get('.form-control[name="volumes.0.containerPath"]').type(
          "containerPath"
        );
        cy.get('.form-control[name="volumes.0.size"]').type("1");
        cy.get('.form-control[name="volumes.0.profileName"]').type("dss");

        // Click review and run
        cy.get(".modal-full-screen-actions")
          .contains("button", "Review & Run")
          .click();
      });

      it("shows the right configurations", () => {
        // Fields that should not appear:
        //  - Service Endpoints
        //  - Health Checks
        //  - Environment Variables
        //  - Labels
        //
        // To test this, we filter for H1's and assert that only 2 exist - one
        // for General field and one for Network field
        cy.get("h1.configuration-map-heading").should(($h1) => {
          // Should have found 2 elements
          expect($h1).to.have.length(3);

          // First should be General
          expect($h1.eq(0)).to.contain("Service");

          // Second should be Network
          expect($h1.eq(1)).to.contain("Networking");
          expect($h1.eq(2)).to.contain("Volumes");
        });
        cy.root()
          .configurationSection("DC/OS Storage Volume")
          .configurationMapValue("Size")
          .contains("1 MiB");
        cy.root()
          .configurationSection("DC/OS Storage Volume")
          .configurationMapValue("Profile Name")
          .contains("dss");
        cy.root()
          .configurationSection("DC/OS Storage Volume")
          .configurationMapValue("Container Path")
          .contains("containerPath");
      });

      it('navigates back to the form when "edit" button is clicked', () => {
        // Click back
        cy.get(".modal-full-screen-actions").contains("button", "Back").click();

        // Verify form has correct Service ID
        cy.get('.form-control[name="id"]').should(
          "to.have.value",
          "/test-review-and-run"
        );

        // Verify form has correct container image
        cy.get('.form-control[name="container.docker.image"]').should(
          "to.have.value",
          "nginx"
        );

        cy.get(".menu-tabbed-item").contains("Volumes").click();

        cy.get('.form-control[name="volumes.0.containerPath"]').should(
          "to.have.value",
          "containerPath"
        );
        cy.get('.form-control[name="volumes.0.size"]').should(
          "to.have.value",
          "1"
        );
        cy.get('.form-control[name="volumes.0.profileName"]').should(
          "to.have.value",
          "dss"
        );
      });
    });
  });

  context("Create Layout (Multi Container)", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy",
        plugins: "dss",
      });

      cy.visitUrl({ url: "/services/overview/%2F/create" });
      cy.get(".create-service-modal-service-picker-option")
        .contains("Multi-container (Pod)")
        .click();
    });

    context("Multi-container (pod)", () => {
      beforeEach(() => {
        cy.get(".menu-tabbed-item-label")
          .eq(0)
          .click()
          .get(".menu-tabbed-view h1")
          .contains("Service");
      });

      it("adds DSS volume", () => {
        cy.get(".menu-tabbed-item").contains("Volumes").click();
        // Select Volume Section
        cy.get(".menu-tabbed-view .button.button-primary-link")
          .contains("Add Volume")
          .click();
        cy.get(".menu-tabbed-view").as("tabView");

        // Add a DSS volume
        cy.get("@tabView").contains(".form-group", "Volume Type");
        cy.get("@tabView").find(".button.dropdown-toggle").click();
        cy.contains(
          ".dropdown-select-item-title",
          "DC/OS Storage Volume"
        ).click();
        cy.get('.form-control[name="volumeMounts.0.name"]');
        cy.get('.form-control[name="volumeMounts.0.mountPath.0"]').should(
          "exist"
        );
        cy.get('.form-control[name="volumeMounts.0.size"]');
        cy.get('.form-control[name="volumeMounts.0.profileName"]').should(
          "exist"
        );
      });
    });
  });

  context("Multi-container - Review & Run", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy",
        plugins: "dss",
      });

      cy.visitUrl({ url: "/services/overview/%2F/create" });
      cy.get(".create-service-modal-service-picker-option")
        .contains("Multi-container (Pod)")
        .click();

      // Fill in SERVICE ID
      cy.get('.form-control[name="id"]')
        .type("{selectall}{backspace}")
        .type("{selectall}{backspace}")
        .type("/test-review-and-run");

      // Select Volume Section
      cy.get(".menu-tabbed-item").contains("Volumes").click();
      cy.get(".menu-tabbed-view .button.button-primary-link")
        .contains("Add Volume")
        .click();
      cy.get(".menu-tabbed-view").as("tabView");

      // Add a DSS volume
      cy.get("@tabView").contains(".form-group", "Volume Type");
      cy.get("@tabView").find(".button.dropdown-toggle").click();
      cy.contains(
        ".dropdown-select-item-title",
        "DC/OS Storage Volume"
      ).click();
      cy.get('.form-control[name="volumeMounts.0.name"]').type("dssvolume");
      cy.get('.form-control[name="volumeMounts.0.mountPath.0"]').type(
        "/mount/path"
      );
      cy.get('.form-control[name="volumeMounts.0.size"]').type("1");
      cy.get('.form-control[name="volumeMounts.0.profileName"]').type("dss");

      // Click review and run
      cy.get(".modal-full-screen-actions")
        .contains("button", "Review & Run")
        .click();
    });

    it("contains one volume at review and run modal", () => {
      cy.root()
        .configurationSection("Volumes")
        .children("div")
        .children("table")
        .getTableColumn("Volume")
        .contents()
        .should("deep.equal", ["dssvolume"]);
      cy.root()
        .configurationSection("Volumes")
        .children("div")
        .children("table")
        .getTableColumn("Container Mount Path")
        .contents()
        .should("deep.equal", ["/mount/path"]);
    });
  });
});
