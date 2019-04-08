import { statusCategorySorter } from "../ServicesTableStatusColumn";

describe("ServicesTableStatusColumn", () => {
  describe("#statusCategorySorter", () => {
    it("sorts by category priority", () => {
      const statusKeys = [
        "SUCCESS",
        "NA",
        "LOADING",
        "STOPPED",
        "ERROR",
        "WARNING"
      ];

      expect(statusKeys.sort(statusCategorySorter)).toEqual([
        "ERROR",
        "WARNING",
        "LOADING",
        "SUCCESS",
        "STOPPED",
        "NA"
      ]);
    });
  });
});
