describe("JobModel Resolver", () => {
  describe("jobs", () => {
    it("polls the endpoint");
    it("waits for running requests to finish before sending new ones");

    // TODO: write this part in greater detail
    it("returns a JobsConnection");

    describe("ordering", () => {
      it("orders by ID");
      it("orders by STATUS");
      it("orders by LAST_RUN");
    });

    describe("filter", () => {
      it("filters by ID");
    });
  });

  describe("job", () => {
    it("polls the endpoint");
    it("waits for running requests to finish before sending new ones");

    // TODO: write this part in greater detail
    it("returns a Job");
  });
});
