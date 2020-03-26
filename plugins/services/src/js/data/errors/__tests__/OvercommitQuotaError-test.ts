import { OvercommitQuotaError } from "../OvercommitQuotaError";

describe("OvercommitQuotaError", () => {
  const STOCK_ERROR_MESSAGE =
    "Invalid QuotaConfig: Role 'foo' is already consuming 'cpus:0.6; mem:192'; this is more than the requested limits 'cpus:0.5; mem:2048' (use 'force' flag to bypass this check)";
  describe("#isOvercommitError", () => {
    it("returns true for an overcommit error message", () => {
      expect(
        OvercommitQuotaError.isOvercommitError(STOCK_ERROR_MESSAGE)
      ).toEqual(true);
    });

    it("returns false for a different error", () => {
      const error =
        "Updating quota on nested role 'foo/bar' is not supported yet";
      expect(OvercommitQuotaError.isOvercommitError(error)).toEqual(false);
    });
  });

  it("has expected name", () => {
    const error = new OvercommitQuotaError(STOCK_ERROR_MESSAGE);
    expect(error.name).toEqual("OvercommitQuotaError");
  });

  it("defaults responseCode to 400", () => {
    const error = new OvercommitQuotaError(STOCK_ERROR_MESSAGE);
    expect(error.responseCode).toEqual(400);
  });

  it("set responseCode if given", () => {
    const error = new OvercommitQuotaError(STOCK_ERROR_MESSAGE, 500);
    expect(error.responseCode).toEqual(500);
  });

  it("parses overcommitted resource from error", () => {
    const error = new OvercommitQuotaError(STOCK_ERROR_MESSAGE);
    expect(error.overcommittedResources).toEqual([
      {
        resourceName: "cpus",
        consumed: 0.6,
        requestedLimit: 0.5,
      },
    ]);
  });
  it("parses multiple overcommitted resources from error", () => {
    const message =
      "Invalid QuotaConfig: Role 'foo' is already consuming 'cpus:0.6; disk:100'; this is more than the requested limits 'cpus:0.5; disk:0' (use 'force' flag to bypass this check)";
    const error = new OvercommitQuotaError(message);
    expect(error.overcommittedResources).toEqual([
      {
        resourceName: "cpus",
        consumed: 0.6,
        requestedLimit: 0.5,
      },
      {
        resourceName: "disk",
        consumed: 100,
        requestedLimit: 0,
      },
    ]);
  });
  it("parses a single overcommitted resources from error", () => {
    const message =
      "Invalid QuotaConfig: Role 'foo' is already consuming 'cpus:0.6'; this is more than the requested limits 'cpus:0.5' (use 'force' flag to bypass this check)";
    const error = new OvercommitQuotaError(message);
    expect(error.overcommittedResources).toEqual([
      {
        resourceName: "cpus",
        consumed: 0.6,
        requestedLimit: 0.5,
      },
    ]);
  });
});
