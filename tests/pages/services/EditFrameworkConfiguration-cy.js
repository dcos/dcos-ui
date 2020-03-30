describe("Edit Framework Configuration", () => {
  context("Missing package", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-for-each-health",
      });

      cy.route({
        method: "POST",
        url: /service\/describe/,
        status: 400,
        response: JSON.stringify({
          type: "VersionNotFound",
          message: "Version [0.2.0-1] of package [cassandra] not found",
          data: { packageName: "cassandra", packageVersion: "0.2.0-1" },
        }),
      }).as("describeService");
    });

    it("contains correct error message", () => {
      cy.visitUrl({ url: "/services/detail/%2Fcassandra-healthy/edit" });

      cy.wait("@describeService");
      cy.contains("Version [0.2.0-1] of package [cassandra] not found");
    });
  });
});
