describe("Cluster Details", () => {
  beforeEach(() => {
    cy.configureCluster({ mesos: "cluster-overview" });
  });

  it("displays Mesos Details", () => {
    cy.visitUrl({ url: "/" });
    cy.get(".breadcrumb__content").contains("Dashboard");

    cy.clock(new Date(2018, 1, 13).getTime());

    cy.visitUrl({ url: "/cluster/overview" });
    cy.get(".breadcrumb__content").contains("Overview");

    cy.root().configurationSection("Mesos Details").as("mesosDetailsSection");

    cy.get("@mesosDetailsSection")
      .configurationMapValue("Cluster")
      .contains("test-cluster");
    cy.get("@mesosDetailsSection")
      .configurationMapValue("Leader")
      .contains("dcos-0:5050");
    cy.get("@mesosDetailsSection")
      .configurationMapValue("Version")
      .contains("1.5.0");
    cy.get("@mesosDetailsSection")
      .configurationMapValue("Built")
      .contains("24 days ago");
    cy.get("@mesosDetailsSection")
      .configurationMapValue("Started")
      .contains("4 days ago");
    cy.get("@mesosDetailsSection")
      .configurationMapValue("Elected")
      .contains("4 days ago");
  });
});
