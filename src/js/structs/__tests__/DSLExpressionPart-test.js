import DSLFilterTypes from "../../constants/DSLFilterTypes";

const DSLExpressionPart = require("../DSLExpressionPart");

describe("DSLExpressionPart", () => {
  it("corrects create an .attribute('label') filter", () => {
    const ret = DSLExpressionPart.attribute("label");

    expect(ret.filterType).toEqual(DSLFilterTypes.ATTRIB);
    expect(ret.filterParams).toEqual({ label: "label" });
  });

  it("corrects create an .attribute('label', 'text') filter", () => {
    const ret = DSLExpressionPart.attribute("label", "text");

    expect(ret.filterType).toEqual(DSLFilterTypes.ATTRIB);
    expect(ret.filterParams).toEqual({ label: "label", text: "text" });
  });

  it("corrects create an .exact filter", () => {
    const ret = DSLExpressionPart.exact;

    expect(ret.filterType).toEqual(DSLFilterTypes.EXACT);
    expect(ret.filterParams).toEqual({});
  });

  it("corrects create an .fuzzy filter", () => {
    const ret = DSLExpressionPart.fuzzy;

    expect(ret.filterType).toEqual(DSLFilterTypes.FUZZY);
    expect(ret.filterParams).toEqual({});
  });
});
