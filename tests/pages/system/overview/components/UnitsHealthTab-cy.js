describe("Units Tab [0e2]", () => {
  context("Filters [0e3]", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy",
        plugins: "organization-enabled",
        componentHealth: true
      }).visitUrl({ url: "/components", identify: true });

      cy.get(".units-health-table-header").within(() => {
        cy.get(".form-control input[type='text']").as("filterTextbox");
        cy.get(".button-group .button").as("filterButtons");
      });
    });

    it("renders filter buttons [0e4]", () => {
      cy.get("@filterButtons").should($buttons => {
        expect($buttons.length).to.equal(3);
        expect($buttons).to.contain("Healthy");
      });
    });

    it("renders string filter input box [0e5]", () => {
      cy.get("@filterTextbox").should($input => {
        expect($input.length).to.equal(1);
      });
    });

    it("filters by node health [0e7]", () => {
      cy.get("@filterButtons")
        .last()
        .click();
      cy.get("tr a").should($row => {
        expect($row).to.contain("Mesos DNS");
        expect($row.length).to.equal(1);
      });
    });

    it("filters by node name [0e6]", () => {
      cy.get("@filterTextbox").type("signal");
      cy.get("tr a").should($row => {
        expect($row.length).to.equal(1);
      });
    });

    it("filters by node health and name at the same time [0e8]", () => {
      cy.get("@filterButtons")
        .eq(1)
        .click();
      cy.get("@filterTextbox").type("mesos");
      cy.get("tr a").should($row => {
        expect($row).to.contain("Mesos Master Service");
        expect($row.length).to.equal(1);
      });
    });

    it("opens unit detail side panel [0ed]", () => {
      cy.get("tr a")
        .contains("Mesos DNS")
        .click();
      cy.hash().should("match", /dcos-mesos-dns\.service/);
    });
  });

  context("Unit Detail Page [0e9]", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy",
        plugins: "organization-enabled",
        componentHealth: true
      }).visitUrl({
        url: "/components/dcos-mesos-dns.service",
        identify: true
      });
    });

    it("renders unit title [0ea]", () => {
      cy.get(".page-header").contains("Mesos DNS");
    });

    it("renders unit health [0eb]", () => {
      cy.get(".page-header")
        .find(".text-danger")
        .should($health => {
          expect($health).to.contain("Unhealthy");
        });
    });

    it("filters by node health [0ec]", () => {
      cy.get(".page-body-content button")
        .contains("All Health Checks")
        .click();
      cy.get(".dropdown-menu")
        .find("li")
        .contains("Healthy")
        .click();
      cy.get("tr")
        .contains("Healthy")
        .should($row => {
          expect($row.length).to.equal(1);
        });
    });

    it("opens unit node detail side panel [0ee]", () => {
      cy.get(".page-body-content tr a")
        .contains("10.10.0.236")
        .click();
      cy.hash().should("match", /10\.10\.0\.236/);
    });
  });

  context("Unit Node Side Panel [0ef]", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy",
        plugins: "organization-enabled",
        componentHealth: true
      }).visitUrl({
        url: "/components/dcos-mesos-dns.service/nodes/10.10.0.236",
        identify: true
      });
    });

    it("renders health check title [0ei]", () => {
      cy.get(".page-header").contains("Mesos DNS");
    });

    it("renders node health [0ej]", () => {
      cy.get(".page-header")
        .find(".text-success")
        .should($health => {
          expect($health).to.contain("Healthy");
        });
    });

    it("renders health check output [0ek]", () => {
      cy.get(".page-body-content")
        .find("pre")
        .should($output => {
          expect($output).to.contain("journald");
        });
    });
  });
});
