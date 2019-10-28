import DSLFilterTypes from "../DSLFilterTypes";
import DSLExpressionPart from "../DSLExpressionPart";

describe("DSLExpressionPart", function() {
  it("corrects create an .attribute('label') filter", function() {
    const ret = DSLExpressionPart.attribute("label");

    expect(ret.filterType).toEqual(DSLFilterTypes.ATTRIB);
    expect(ret.filterParams).toEqual({ label: "label" });
  });

  it("corrects create an .attribute('label', 'text') filter", function() {
    const ret = DSLExpressionPart.attribute("label", "text");

    expect(ret.filterType).toEqual(DSLFilterTypes.ATTRIB);
    expect(ret.filterParams).toEqual({ label: "label", text: "text" });
  });

  it("corrects create an .exact filter", function() {
    const ret = DSLExpressionPart.exact;

    expect(ret.filterType).toEqual(DSLFilterTypes.EXACT);
    expect(ret.filterParams).toEqual({});
  });

  it("corrects create an .fuzzy filter", function() {
    const ret = DSLExpressionPart.fuzzy;

    expect(ret.filterType).toEqual(DSLFilterTypes.FUZZY);
    expect(ret.filterParams).toEqual({});
  });
});
