const CreateServiceModalFormUtil = require("../CreateServiceModalFormUtil");

const EMPTY_TYPES = [null, undefined, {}, "", NaN];

function getTypeName(type) {
  if (Number.isNaN(type)) {
    return "NaN";
  }

  return JSON.stringify(type);
}

describe("CreateServiceModalFormUtil", () => {
  describe("#stripEmptyProperties", () => {
    EMPTY_TYPES.forEach(emptyType => {
      const emptyTypeStr = getTypeName(emptyType);

      it(`removes ${emptyTypeStr} object properties`, () => {
        const data = { a: "foo", b: emptyType };
        const clean = CreateServiceModalFormUtil.stripEmptyProperties(data);
        expect(clean).toEqual({ a: "foo" });
      });

      it(`removes ${emptyTypeStr} array items`, () => {
        const data = ["foo", emptyType];
        const clean = CreateServiceModalFormUtil.stripEmptyProperties(data);
        expect(clean).toEqual(["foo"]);
      });
    });
  });
});
