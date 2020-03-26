import AuthUtil from "../AuthUtil";

describe("AuthUtil", () => {
  describe("#isSubjectRemote", () => {
    it("returns false when the isRemote function returns false", () => {
      const item = {
        isRemote() {
          return false;
        },
      };
      expect(AuthUtil.isSubjectRemote(item)).toBeFalsy();
    });

    it("returns true when the isRemote function returns true", () => {
      const item = {
        isRemote() {
          return true;
        },
      };
      expect(AuthUtil.isSubjectRemote(item)).toBeTruthy();
    });

    it("returns false when isRemote is undefined", () => {
      const item = {};
      expect(AuthUtil.isSubjectRemote(item)).toBeFalsy();
    });

    it("returns false when isRemote is not a function", () => {
      const item = { isRemote: true };
      expect(AuthUtil.isSubjectRemote(item)).toBeFalsy();
    });
  });
});
